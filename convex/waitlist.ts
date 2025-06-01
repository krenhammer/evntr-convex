import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists in waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      if (existing.status === "approved") {
        throw new Error("You have already been approved! Please check your email for login instructions.");
      } else if (existing.status === "pending") {
        throw new Error("You are already on the waitlist. We'll notify you when you're approved!");
      } else {
        throw new Error("Your previous application was not approved. Please contact support if you believe this is an error.");
      }
    }

    const waitlistId = await ctx.db.insert("waitlist", {
      email: args.email,
      name: args.name,
      company: args.company,
      reason: args.reason,
      status: "pending",
    });

    return waitlistId;
  },
});

export const getWaitlistStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    return entry;
  },
});

export const getAllWaitlistEntries = query({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin must be logged in.");
    }

    // Check if user is system admin
    const isAdmin = await ctx.runQuery(api.rbac.isSystemAdmin);
    if (!isAdmin) {
      throw new Error("Only system administrators can view waitlist entries.");
    }

    const entries = await ctx.db
      .query("waitlist")
      .order("desc")
      .collect();

    return entries;
  },
});

export const approveWaitlistEntry = mutation({
  args: {
    waitlistId: v.id("waitlist"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin must be logged in.");
    }

    // Check if user is system admin
    const isAdmin = await ctx.runQuery(api.rbac.isSystemAdmin);
    if (!isAdmin) {
      throw new Error("Only system administrators can approve waitlist entries.");
    }

    const entry = await ctx.db.get(args.waitlistId);
    if (!entry) {
      throw new Error("Waitlist entry not found.");
    }

    if (entry.status !== "pending") {
      throw new Error("Entry has already been processed.");
    }

    await ctx.db.patch(args.waitlistId, {
      status: "approved",
      approvedBy: adminUserId,
      approvedAt: Date.now(),
    });

    return args.waitlistId;
  },
});

export const rejectWaitlistEntry = mutation({
  args: {
    waitlistId: v.id("waitlist"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin must be logged in.");
    }

    // Check if user is system admin
    const isAdmin = await ctx.runQuery(api.rbac.isSystemAdmin);
    if (!isAdmin) {
      throw new Error("Only system administrators can reject waitlist entries.");
    }

    const entry = await ctx.db.get(args.waitlistId);
    if (!entry) {
      throw new Error("Waitlist entry not found.");
    }

    if (entry.status !== "pending") {
      throw new Error("Entry has already been processed.");
    }

    await ctx.db.patch(args.waitlistId, {
      status: "rejected",
      rejectedBy: adminUserId,
      rejectedAt: Date.now(),
      rejectionReason: args.reason,
    });

    return args.waitlistId;
  },
});
