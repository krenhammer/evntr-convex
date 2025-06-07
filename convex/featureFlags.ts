import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getFeatureFlag = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();


    return flag?.value ?? false;
  },
});

export const updateFeatureFlag = mutation({
  args: {
    key: v.string(),
    value: v.boolean(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin must be logged in.");
    }

    // Check if user is system admin
    const isAdmin = await ctx.runQuery(api.rbac.isSystemAdmin);
    if (!isAdmin) {
      throw new Error("Only system administrators can update feature flags.");
    }

    const existing = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description || existing.description,
        updatedBy: adminUserId,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const flagId = await ctx.db.insert("featureFlags", {
        key: args.key,
        value: args.value,
        description: args.description || `Feature flag: ${args.key}`,
        updatedBy: adminUserId,
        updatedAt: Date.now(),
      });
      return flagId;
    }
  },
});

export const getAllFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin must be logged in.");
    }

    // Check if user is system admin
    const isAdmin = await ctx.runQuery(api.rbac.isSystemAdmin);
    if (!isAdmin) {
      throw new Error("Only system administrators can view feature flags.");
    }

    const flags = await ctx.db.query("featureFlags").collect();
    
    // Add default flags if they don't exist
    const flagMap = new Map(flags.map(f => [f.key, f]));
    
    const defaultFlags = [
      {
        key: "open_registration",
        value: true, // Enable direct sign-in by default
        description: "Allow open user registration (disable waitlist mode)",
      },
      {
        key: "waitlist_enabled",
        value: false, // Disable waitlist by default
        description: "Enable waitlist signup for beta access",
      },
      {
        key: "disable_signup",
        value: false, // Allow signup by default
        description: "Disable user signup and redirect to waitlist",
      },
    ];

    for (const defaultFlag of defaultFlags) {
      if (!flagMap.has(defaultFlag.key)) {
        flags.push({
          _id: `default_${defaultFlag.key}` as any,
          _creationTime: Date.now(),
          ...defaultFlag,
          updatedBy: undefined,
          updatedAt: undefined,
        });
      }
    }

    return flags.sort((a, b) => a.key.localeCompare(b.key));
  },
});
