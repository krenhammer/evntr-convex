import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Type for auth context
type AuthContext = QueryCtx | MutationCtx;

// Enhanced user type with organization and team context
export interface AuthenticatedUser {
  id: Id<"users">;
  name?: string;
  email?: string;
  image?: string;
  organizationMemberships: Array<{
    organizationId: Id<"organizations">;
    role: "owner" | "admin" | "member";
    joinedAt: number;
  }>;
  teamMemberships: Array<{
    teamId: Id<"teams">;
    organizationId: Id<"organizations">;
    role: "lead" | "member";
    joinedAt: number;
  }>;
  isSystemAdmin: boolean;
}

// Basic authentication check
export async function requireAuth(ctx: AuthContext): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

// Get authenticated user with full context
export async function getAuthenticatedUser(ctx: AuthContext): Promise<AuthenticatedUser> {
  const userId = await requireAuth(ctx);
  
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get organization memberships
  const orgMemberships = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  // Get team memberships
  const teamMemberships = await ctx.db
    .query("teamMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  // Check if user is system admin
  const adminUser = await ctx.db
    .query("systemAdmins")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .unique();

  // Fallback to hardcoded admin emails for initial setup
  const fallbackAdminEmails = [
    "admin@dictato.com",
    "support@dictato.com",
    "lkrenek@gmail.com",
  ];

  const isSystemAdmin = !!adminUser || fallbackAdminEmails.includes(user.email || "");

  return {
    id: userId,
    name: user.name,
    email: user.email,
    image: user.image,
    organizationMemberships: orgMemberships.map(m => ({
      organizationId: m.organizationId,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    teamMemberships: teamMemberships.map(m => ({
      teamId: m.teamId,
      organizationId: m.organizationId,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    isSystemAdmin,
  };
}

// Require organization membership with minimum role
export async function requireOrganizationMember(
  ctx: AuthContext,
  organizationId: Id<"organizations">,
  minRole: "owner" | "admin" | "member" = "member"
): Promise<{ userId: Id<"users">; role: "owner" | "admin" | "member" }> {
  const userId = await requireAuth(ctx);

  const membership = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_user_and_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", organizationId)
    )
    .unique();

  if (!membership) {
    throw new Error("Organization membership required");
  }

  // Role hierarchy: owner > admin > member
  const roleHierarchy = { owner: 3, admin: 2, member: 1 };
  const userRoleLevel = roleHierarchy[membership.role];
  const requiredRoleLevel = roleHierarchy[minRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error(`Insufficient permissions. Required: ${minRole}, Current: ${membership.role}`);
  }

  return { userId, role: membership.role };
}

// Require team membership with minimum role
export async function requireTeamMember(
  ctx: AuthContext,
  teamId: Id<"teams">,
  minRole: "lead" | "member" = "member"
): Promise<{ userId: Id<"users">; role: "lead" | "member" }> {
  const userId = await requireAuth(ctx);

  const team = await ctx.db.get(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  // Check team membership
  const teamMembership = await ctx.db
    .query("teamMemberships")
    .withIndex("by_user_and_team", (q) => 
      q.eq("userId", userId).eq("teamId", teamId)
    )
    .unique();

  // Check organization membership (org admins/owners have access to all teams)
  const orgMembership = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_user_and_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", team.organizationId)
    )
    .unique();

  // Org owners and admins have full access
  if (orgMembership && (orgMembership.role === "owner" || orgMembership.role === "admin")) {
    return { userId, role: "lead" };
  }

  if (!teamMembership) {
    throw new Error("Team membership required");
  }

  // Role hierarchy: lead > member
  const roleHierarchy = { lead: 2, member: 1 };
  const userRoleLevel = roleHierarchy[teamMembership.role];
  const requiredRoleLevel = roleHierarchy[minRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error(`Insufficient team permissions. Required: ${minRole}, Current: ${teamMembership.role}`);
  }

  return { userId, role: teamMembership.role };
}

// Require resource ownership or organization admin access
export async function requireResourceOwner(
  ctx: AuthContext,
  resourceType: string,
  resourceId: Id<any>,
  organizationId?: Id<"organizations">
): Promise<{ userId: Id<"users">; isOwner: boolean; isOrgAdmin: boolean }> {
  const userId = await requireAuth(ctx);

  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error(`${resourceType} not found`);
  }

  const isOwner = resource.created_by === userId || resource.creatorId === userId;
  
  let isOrgAdmin = false;
  if (organizationId) {
    try {
      const { role } = await requireOrganizationMember(ctx, organizationId, "admin");
      isOrgAdmin = role === "owner" || role === "admin";
    } catch {
      // User is not org admin
    }
  }

  if (!isOwner && !isOrgAdmin) {
    throw new Error("Resource ownership or organization admin access required");
  }

  return { userId, isOwner, isOrgAdmin };
}

// Require system admin access
export async function requireSystemAdmin(ctx: AuthContext): Promise<Id<"users">> {
  const userId = await requireAuth(ctx);
  
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check database for admin users
  const adminUser = await ctx.db
    .query("systemAdmins")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .unique();

  if (adminUser) {
    return userId;
  }

  // Fallback to hardcoded admin emails for initial setup
  const fallbackAdminEmails = [
    "admin@dictato.com",
    "support@dictato.com",
    "lkrenek@gmail.com",
  ];

  if (fallbackAdminEmails.includes(user.email || "")) {
    return userId;
  }

  throw new Error("System administrator access required");
}

// Check if user can access resource based on organization/team context
export async function canAccessResource(
  ctx: AuthContext,
  resourceType: string,
  resourceId: Id<any>,
  action: "read" | "write" | "delete"
): Promise<{ canAccess: boolean; reason?: string }> {
  try {
    const userId = await requireAuth(ctx);
    const resource = await ctx.db.get(resourceId);
    
    if (!resource) {
      return { canAccess: false, reason: "Resource not found" };
    }

    // Resource owner has full access
    if (resource.created_by === userId || resource.creatorId === userId) {
      return { canAccess: true };
    }

    // Check organization context
    if (resource.organization_id) {
      try {
        const { role } = await requireOrganizationMember(ctx, resource.organization_id);
        
        // Org owners and admins have full access
        if (role === "owner" || role === "admin") {
          return { canAccess: true };
        }
        
        // Org members have read access
        if (action === "read") {
          return { canAccess: true };
        }
        
        return { canAccess: false, reason: "Insufficient organization permissions" };
      } catch {
        return { canAccess: false, reason: "Organization membership required" };
      }
    }

    // Check team context
    if (resource.team_id) {
      try {
        const { role } = await requireTeamMember(ctx, resource.team_id);
        
        // Team leads have full access
        if (role === "lead") {
          return { canAccess: true };
        }
        
        // Team members have read access
        if (action === "read") {
          return { canAccess: true };
        }
        
        return { canAccess: false, reason: "Insufficient team permissions" };
      } catch {
        return { canAccess: false, reason: "Team membership required" };
      }
    }

    return { canAccess: false, reason: "No access permissions found" };
  } catch (error) {
    return { canAccess: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Get user's effective permissions for an organization
export async function getEffectivePermissions(
  ctx: AuthContext,
  organizationId: Id<"organizations">,
  teamId?: Id<"teams">
): Promise<{
  organizationRole?: "owner" | "admin" | "member";
  teamRole?: "lead" | "member";
  canCreateTeams: boolean;
  canManageOrganization: boolean;
  canManageTeam: boolean;
  isSystemAdmin: boolean;
}> {
  const userId = await requireAuth(ctx);
  
  // Check system admin status
  const user = await getAuthenticatedUser(ctx);
  const isSystemAdmin = user.isSystemAdmin;

  // Get organization membership
  const orgMembership = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_user_and_organization", (q) => 
      q.eq("userId", userId).eq("organizationId", organizationId)
    )
    .unique();

  let teamRole: "lead" | "member" | undefined;
  if (teamId) {
    const teamMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user_and_team", (q) => 
        q.eq("userId", userId).eq("teamId", teamId)
      )
      .unique();
    teamRole = teamMembership?.role;
  }

  const organizationRole = orgMembership?.role;
  const canCreateTeams = isSystemAdmin || organizationRole === "owner" || organizationRole === "admin";
  const canManageOrganization = isSystemAdmin || organizationRole === "owner" || organizationRole === "admin";
  const canManageTeam = isSystemAdmin || 
    organizationRole === "owner" || 
    organizationRole === "admin" || 
    teamRole === "lead";

  return {
    organizationRole,
    teamRole,
    canCreateTeams,
    canManageOrganization,
    canManageTeam,
    isSystemAdmin,
  };
}

// Helper to get organization context from resource
export async function getResourceOrganizationContext(
  ctx: AuthContext,
  resourceType: string,
  resourceId: Id<any>
): Promise<{ organizationId?: Id<"organizations">; teamId?: Id<"teams"> }> {
  const resource = await ctx.db.get(resourceId);
  if (!resource) {
    throw new Error(`${resourceType} not found`);
  }

  return {
    organizationId: resource.organization_id,
    teamId: resource.team_id,
  };
}

// Validate organization context for mutations
export async function validateOrganizationContext(
  ctx: AuthContext,
  organizationId?: Id<"organizations">,
  teamId?: Id<"teams">
): Promise<{ validatedOrgId?: Id<"organizations">; validatedTeamId?: Id<"teams"> }> {
  if (!organizationId && !teamId) {
    return {};
  }

  const userId = await requireAuth(ctx);

  if (organizationId) {
    await requireOrganizationMember(ctx, organizationId);
  }

  if (teamId) {
    await requireTeamMember(ctx, teamId);
    
    // If team is provided, ensure it belongs to the organization
    if (organizationId) {
      const team = await ctx.db.get(teamId);
      if (!team || team.organizationId !== organizationId) {
        throw new Error("Team does not belong to the specified organization");
      }
    }
  }

  return {
    validatedOrgId: organizationId,
    validatedTeamId: teamId,
  };
} 