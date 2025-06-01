import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Permission checking utilities
export const checkOrganizationPermission = query({
  args: {
    organizationId: v.id("organizations"),
    requiredRole: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { hasPermission: false, role: null };
    }

    const membership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_organization", (q) => 
        q.eq("userId", userId).eq("organizationId", args.organizationId)
      )
      .unique();

    if (!membership) {
      return { hasPermission: false, role: null };
    }

    if (!args.requiredRole) {
      return { hasPermission: true, role: membership.role };
    }

    // Role hierarchy: owner > admin > member
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    const userRoleLevel = roleHierarchy[membership.role];
    const requiredRoleLevel = roleHierarchy[args.requiredRole];

    return {
      hasPermission: userRoleLevel >= requiredRoleLevel,
      role: membership.role,
    };
  },
});

export const checkTeamPermission = query({
  args: {
    teamId: v.id("teams"),
    requiredRole: v.optional(v.union(v.literal("lead"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { hasPermission: false, role: null };
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      return { hasPermission: false, role: null };
    }

    // Check team membership
    const teamMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user_and_team", (q) => 
        q.eq("userId", userId).eq("teamId", args.teamId)
      )
      .unique();

    // Check organization membership (org admins/owners have access to all teams)
    const orgMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_organization", (q) => 
        q.eq("userId", userId).eq("organizationId", team.organizationId)
      )
      .unique();

    if (!teamMembership && !orgMembership) {
      return { hasPermission: false, role: null };
    }

    // Org owners and admins have full access
    if (orgMembership && (orgMembership.role === "owner" || orgMembership.role === "admin")) {
      return { hasPermission: true, role: "lead" };
    }

    if (!teamMembership) {
      return { hasPermission: false, role: null };
    }

    if (!args.requiredRole) {
      return { hasPermission: true, role: teamMembership.role };
    }

    // Role hierarchy: lead > member
    const roleHierarchy = { lead: 2, member: 1 };
    const userRoleLevel = roleHierarchy[teamMembership.role];
    const requiredRoleLevel = roleHierarchy[args.requiredRole];

    return {
      hasPermission: userRoleLevel >= requiredRoleLevel,
      role: teamMembership.role,
    };
  },
});

export const checkEventPermission = query({
  args: {
    eventId: v.id("events"),
    action: v.union(v.literal("read"), v.literal("write"), v.literal("delete")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { hasPermission: false };
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return { hasPermission: false };
    }

    // Event creator has full access
    if (event.creatorId === userId) {
      return { hasPermission: true };
    }

    // Check organization membership
    const orgMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_and_organization", (q) => 
        q.eq("userId", userId).eq("organizationId", event.organizationId)
      )
      .unique();

    if (!orgMembership) {
      return { hasPermission: false };
    }

    // Org owners and admins have full access
    if (orgMembership.role === "owner" || orgMembership.role === "admin") {
      return { hasPermission: true };
    }

    // Check visibility and team membership
    if (event.visibility === "organization") {
      // All org members can read, only admins+ can write/delete
      if (args.action === "read") {
        return { hasPermission: true };
      }
      return { hasPermission: false };
    }

    if (event.visibility === "team" && event.teamId) {
      const teamMembership = await ctx.db
        .query("teamMemberships")
        .withIndex("by_user_and_team", (q) => 
          q.eq("userId", userId).eq("teamId", event.teamId!)
        )
        .unique();

      if (!teamMembership) {
        return { hasPermission: false };
      }

      // Team members can read, team leads can write/delete
      if (args.action === "read") {
        return { hasPermission: true };
      }
      return { hasPermission: teamMembership.role === "lead" };
    }

    if (event.visibility === "private") {
      // Only creator has access (already checked above)
      return { hasPermission: false };
    }

    return { hasPermission: false };
  },
});

export const isSystemAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return false;
    }

    // First check database for admin users
    const adminUser = await ctx.db
      .query("systemAdmins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (adminUser) {
      return true;
    }

    // Fallback to hardcoded admin emails for initial setup
    // IMPORTANT: Add your email here to become the first admin
    const fallbackAdminEmails = [
      "admin@dictato.com",
      "support@dictato.com",
      // 👇 ADD YOUR EMAIL HERE to become an admin
      "lkrenek@gmail.com",
      "user@example.com", // Add your email here
    ];

    return fallbackAdminEmails.includes(user.email || "");
  },
});
