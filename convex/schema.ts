import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {

    organizations: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        ownerId: v.id("users"),
        subscriptionStatus: v.union(v.literal("active"), v.literal("inactive"), v.literal("trial")),
        subscriptionId: v.optional(v.string()), // Polar subscription ID
        planType: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
        maxMembers: v.number(),
        maxEvents: v.number(),
        maxPhotosPerEvent: v.number(),
      }).index("by_owner", ["ownerId"]),
    
      // Teams within organizations
      teams: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.id("organizations"),
        creatorId: v.id("users"),
      }).index("by_organization", ["organizationId"]),
    
      // User memberships in organizations
      organizationMemberships: defineTable({
        userId: v.id("users"),
        organizationId: v.id("organizations"),
        role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
        invitedBy: v.optional(v.id("users")),
        joinedAt: v.number(),
      })
        .index("by_user", ["userId"])
        .index("by_organization", ["organizationId"])
        .index("by_user_and_organization", ["userId", "organizationId"]),
    
      // User memberships in teams
      teamMemberships: defineTable({
        userId: v.id("users"),
        teamId: v.id("teams"),
        organizationId: v.id("organizations"),
        role: v.union(v.literal("lead"), v.literal("member")),
        addedBy: v.id("users"),
        joinedAt: v.number(),
      })
        .index("by_user", ["userId"])
        .index("by_team", ["teamId"])
        .index("by_organization", ["organizationId"])
        .index("by_user_and_team", ["userId", "teamId"]),
    // events table - main event entities
    events: defineTable({
        creatorId: v.id("users"),
        event_team_id: v.optional(v.id("event_teams")),
        organizationId: v.id("organizations"),
        teamId: v.optional(v.id("teams")),
        visibility: v.union(v.literal("organization"), v.literal("team"), v.literal("private")),
        name: v.string(),
        description: v.optional(v.string()),
        event_type: v.string(),
        start_date: v.optional(v.number()), // timestamp
        end_date: v.optional(v.number()), // timestamp
        status: v.string(), // e.g., "draft", "active", "completed", "cancelled"
        created_at: v.number(), // timestamp
        created_by: v.id("users"),
        updated_at: v.optional(v.number()), // timestamp
        updated_by: v.optional(v.id("users")),
    })
        .index("by_creator", ["creatorId"])
        .index("by_status", ["status"])
        .index("by_event_type", ["event_type"])
        .index("by_created_at", ["created_at"]),

    // event players - users participating in events
    event_players: defineTable({
        event_id: v.id("events"),
        user_id: v.id("users"),
        role: v.union(v.literal("host"), v.literal("player"), v.literal("admin")),
        status: v.string(), // e.g., "active", "inactive", "banned"
        created_at: v.number(), // timestamp
        created_by: v.id("users"),
        updated_at: v.optional(v.number()), // timestamp
        updated_by: v.optional(v.id("users")),
    })
        .index("by_event", ["event_id"])
        .index("by_user", ["user_id"])
        .index("by_event_user", ["event_id", "user_id"])
        .index("by_role", ["role"]),

    // event items - items/tasks/challenges within events
    event_items: defineTable({
        event_id: v.id("events"),
        event_player_id: v.optional(v.id("event_players")),
        event_team_id: v.optional(v.id("event_teams")),
        name: v.string(),
        description: v.optional(v.string()),
        count: v.optional(v.number()),
        event_media_id: v.optional(v.id("event_media")),
        order: v.optional(v.number()),
        approved_date: v.optional(v.number()), // timestamp
        approved_by: v.optional(v.id("users")),
        created_at: v.number(), // timestamp
        created_by: v.id("users"),
        updated_at: v.optional(v.number()), // timestamp
        updated_by: v.optional(v.id("users")),
    })
        .index("by_event", ["event_id"])
        .index("by_player", ["event_player_id"])
        .index("by_team", ["event_team_id"])
        .index("by_order", ["order"])
        .index("by_event_order", ["event_id", "order"]),

    // event teams - team structures within events
    event_teams: defineTable({
        event_id: v.id("events"),
        team_name: v.string(),
        created_at: v.number(), // timestamp
        created_by: v.id("users"),
        updated_at: v.optional(v.number()), // timestamp
        updated_by: v.optional(v.id("users")),
    })
        .index("by_event", ["event_id"])
        .index("by_team_name", ["team_name"]),

    // event players teams - many-to-many relationship between players and teams
    event_players_teams: defineTable({
        event_player_id: v.id("event_players"),
        event_team_id: v.id("event_teams"),
        created_at: v.number(), // timestamp
        created_by: v.id("users"),
        updated_at: v.optional(v.number()), // timestamp
        updated_by: v.optional(v.id("users")),
    })
        .index("by_player", ["event_player_id"])
        .index("by_team", ["event_team_id"])
        .index("by_player_team", ["event_player_id", "event_team_id"]),

    // event results - outcomes and scoring
    event_results: defineTable({
        finished_date: v.number(), // timestamp
        event_id: v.id("events"),
        user_id: v.id("users"),
        event_item_id: v.optional(v.id("event_items")),
        event_team_id: v.optional(v.id("event_teams")),
        order: v.optional(v.number()),
        points: v.optional(v.number()),
        created_at: v.number(), // timestamp
        created_by: v.id("users"),
        updated_at: v.optional(v.number()), // timestamp
        updated_by: v.optional(v.id("users")),
    })
        .index("by_event", ["event_id"])
        .index("by_user", ["user_id"])
        .index("by_item", ["event_item_id"])
        .index("by_team", ["event_team_id"])
        .index("by_finished_date", ["finished_date"])
        .index("by_points", ["points"]),

    // event settings - configurable event parameters
    event_settings: defineTable({
        event_id: v.id("events"),
        setting_key: v.string(), // e.g., "time_limit", "max_players", "rounds", "difficulty"
        setting_value: v.string(), // stored as string, parsed based on setting_type
        setting_type: v.union(
            v.literal("string"),
            v.literal("number"),
            v.literal("boolean"),
            v.literal("json")
        ),
        created_at: v.number(), // timestamp
        updated_at: v.number(), // timestamp
    })
        .index("by_event", ["event_id"])
        .index("by_setting_key", ["setting_key"])
        .index("by_event_setting", ["event_id", "setting_key"]),

    // event state - current event state and progress
    event_state: defineTable({
        event_id: v.id("events"),
        current_round: v.optional(v.number()),
        current_turn_player_id: v.optional(v.id("event_players")),
        current_turn_team_id: v.optional(v.id("event_teams")),
        event_data: v.any(), // JSON - flexible state storage
        last_action_at: v.number(), // timestamp
        created_at: v.number(), // timestamp
        updated_at: v.number(), // timestamp
    })
        .index("by_event", ["event_id"])
        .index("by_last_action", ["last_action_at"]),

    // event rounds - individual rounds within events
    event_rounds: defineTable({
        event_id: v.id("events"),
        round_number: v.number(),
        round_type: v.optional(v.string()),
        start_time: v.number(), // timestamp
        end_time: v.optional(v.number()), // timestamp
        round_data: v.any(), // JSON
        status: v.string(), // e.g., "active", "completed", "paused"
    })
        .index("by_event", ["event_id"])
        .index("by_round_number", ["round_number"])
        .index("by_event_round", ["event_id", "round_number"])
        .index("by_status", ["status"]),

    // event media - media assets associated with events
    event_media: defineTable({
        event_id: v.id("events"),
        event_item_id: v.optional(v.id("event_items")),
        media_type: v.union(
            v.literal("image"),
            v.literal("audio"),
            v.literal("video"),
            v.literal("text")
        ),
        storage_id: v.optional(v.string()), // Convex file storage ID
        url: v.optional(v.string()), // external URL
        media_metadata: v.any(), // JSON
        created_at: v.number(), // timestamp
        created_by: v.id("users"),
        updated_at: v.optional(v.number()), // timestamp
        updated_by: v.optional(v.id("users")),
    })
        .index("by_event", ["event_id"])
        .index("by_item", ["event_item_id"])
        .index("by_media_type", ["media_type"])
        .index("by_created_at", ["created_at"]),

    // Users table - basic user information (you may want to extend this)
    users: defineTable({
        name: v.string(),
        email: v.optional(v.string()),
        avatar_url: v.optional(v.string()),
        created_at: v.number(), // timestamp
        updated_at: v.optional(v.number()), // timestamp
    })
        .index("by_email", ["email"])
        .index("by_created_at", ["created_at"]),

    adminSessions: defineTable({
        adminUserId: v.id("users"),
        impersonatedUserId: v.id("users"),
        reason: v.string(),
        startTime: v.number(),
        endTime: v.optional(v.number()),
        isActive: v.boolean(),
    })
        .index("by_admin", ["adminUserId"])
        .index("by_impersonated", ["impersonatedUserId"])
        .index("by_active", ["isActive"]),

    // System administrators
    systemAdmins: defineTable({
        userId: v.id("users"),
        grantedBy: v.id("users"),
        grantedAt: v.number(),
        isActive: v.boolean(),
        notes: v.optional(v.string()),
    })
        .index("by_user", ["userId"])
        .index("by_active", ["isActive"]),

    // Polar webhook events
    polarWebhooks: defineTable({
        eventType: v.string(),
        eventId: v.string(),
        organizationId: v.optional(v.id("organizations")),
        subscriptionId: v.optional(v.string()),
        processed: v.boolean(),
        data: v.any(),
    }).index("by_event_id", ["eventId"]),

    // Waitlist for beta access
    waitlist: defineTable({
        email: v.string(),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        reason: v.optional(v.string()),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.number()),
        rejectedBy: v.optional(v.id("users")),
        rejectedAt: v.optional(v.number()),
        rejectionReason: v.optional(v.string()),
    })
        .index("by_email", ["email"])
        .index("by_status", ["status"]),

    // Feature flags for controlling app behavior
    featureFlags: defineTable({
        key: v.string(),
        value: v.boolean(),
        description: v.string(),
        updatedBy: v.optional(v.id("users")),
        updatedAt: v.optional(v.number()),
    }).index("by_key", ["key"]),

    stt: defineTable({
        result: v.optional(v.string()),
        language: v.string(),
        responseType: v.string(),
        creatorId: v.id("users"),
        startTime: v.number(),
        error: v.optional(v.string()),
        endTime: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    }).index("by_creator", ["creatorId"]),
};

export default defineSchema({
    ...authTables,
    ...applicationTables,
});