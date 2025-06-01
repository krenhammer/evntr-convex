import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Games table - main game entities
  games: defineTable({
    owner_id: v.id("users"),
    game_team_id: v.optional(v.id("game_teams")),
    name: v.string(),
    description: v.optional(v.string()),
    game_type: v.string(),
    start_date: v.optional(v.number()), // timestamp
    end_date: v.optional(v.number()), // timestamp
    status: v.string(), // e.g., "draft", "active", "completed", "cancelled"
    created_at: v.number(), // timestamp
    created_by: v.id("users"),
    updated_at: v.optional(v.number()), // timestamp
    updated_by: v.optional(v.id("users")),
  })
    .index("by_owner", ["owner_id"])
    .index("by_status", ["status"])
    .index("by_game_type", ["game_type"])
    .index("by_created_at", ["created_at"]),

  // Game players - users participating in games
  game_players: defineTable({
    game_id: v.id("games"),
    user_id: v.id("users"),
    role: v.union(v.literal("host"), v.literal("player"), v.literal("admin")),
    status: v.string(), // e.g., "active", "inactive", "banned"
    created_at: v.number(), // timestamp
    created_by: v.id("users"),
    updated_at: v.optional(v.number()), // timestamp
    updated_by: v.optional(v.id("users")),
  })
    .index("by_game", ["game_id"])
    .index("by_user", ["user_id"])
    .index("by_game_user", ["game_id", "user_id"])
    .index("by_role", ["role"]),

  // Game items - items/tasks/challenges within games
  game_items: defineTable({
    game_id: v.id("games"),
    game_player_id: v.optional(v.id("game_players")),
    game_team_id: v.optional(v.id("game_teams")),
    name: v.string(),
    description: v.optional(v.string()),
    count: v.optional(v.number()),
    game_media_id: v.optional(v.id("game_media")),
    order: v.optional(v.number()),
    approved_date: v.optional(v.number()), // timestamp
    approved_by: v.optional(v.id("users")),
    created_at: v.number(), // timestamp
    created_by: v.id("users"),
    updated_at: v.optional(v.number()), // timestamp
    updated_by: v.optional(v.id("users")),
  })
    .index("by_game", ["game_id"])
    .index("by_player", ["game_player_id"])
    .index("by_team", ["game_team_id"])
    .index("by_order", ["order"])
    .index("by_game_order", ["game_id", "order"]),

  // Game teams - team structures within games
  game_teams: defineTable({
    game_id: v.id("games"),
    team_name: v.string(),
    created_at: v.number(), // timestamp
    created_by: v.id("users"),
    updated_at: v.optional(v.number()), // timestamp
    updated_by: v.optional(v.id("users")),
  })
    .index("by_game", ["game_id"])
    .index("by_team_name", ["team_name"]),

  // Game players teams - many-to-many relationship between players and teams
  game_players_teams: defineTable({
    game_player_id: v.id("game_players"),
    game_team_id: v.id("game_teams"),
    created_at: v.number(), // timestamp
    created_by: v.id("users"),
    updated_at: v.optional(v.number()), // timestamp
    updated_by: v.optional(v.id("users")),
  })
    .index("by_player", ["game_player_id"])
    .index("by_team", ["game_team_id"])
    .index("by_player_team", ["game_player_id", "game_team_id"]),

  // Game results - outcomes and scoring
  game_results: defineTable({
    finished_date: v.number(), // timestamp
    game_id: v.id("games"),
    user_id: v.id("users"),
    game_item_id: v.optional(v.id("game_items")),
    game_team_id: v.optional(v.id("game_teams")),
    order: v.optional(v.number()),
    points: v.optional(v.number()),
    created_at: v.number(), // timestamp
    created_by: v.id("users"),
    updated_at: v.optional(v.number()), // timestamp
    updated_by: v.optional(v.id("users")),
  })
    .index("by_game", ["game_id"])
    .index("by_user", ["user_id"])
    .index("by_item", ["game_item_id"])
    .index("by_team", ["game_team_id"])
    .index("by_finished_date", ["finished_date"])
    .index("by_points", ["points"]),

  // Game settings - configurable game parameters
  game_settings: defineTable({
    game_id: v.id("games"),
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
    .index("by_game", ["game_id"])
    .index("by_setting_key", ["setting_key"])
    .index("by_game_setting", ["game_id", "setting_key"]),

  // Game state - current game state and progress
  game_state: defineTable({
    game_id: v.id("games"),
    current_round: v.optional(v.number()),
    current_turn_player_id: v.optional(v.id("game_players")),
    current_turn_team_id: v.optional(v.id("game_teams")),
    game_data: v.any(), // JSON - flexible state storage
    last_action_at: v.number(), // timestamp
    created_at: v.number(), // timestamp
    updated_at: v.number(), // timestamp
  })
    .index("by_game", ["game_id"])
    .index("by_last_action", ["last_action_at"]),

  // Game rounds - individual rounds within games
  game_rounds: defineTable({
    game_id: v.id("games"),
    round_number: v.number(),
    round_type: v.optional(v.string()),
    start_time: v.number(), // timestamp
    end_time: v.optional(v.number()), // timestamp
    round_data: v.any(), // JSON
    status: v.string(), // e.g., "active", "completed", "paused"
  })
    .index("by_game", ["game_id"])
    .index("by_round_number", ["round_number"])
    .index("by_game_round", ["game_id", "round_number"])
    .index("by_status", ["status"]),

  // Game media - media assets associated with games
  game_media: defineTable({
    game_id: v.id("games"),
    game_item_id: v.optional(v.id("game_items")),
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
    .index("by_game", ["game_id"])
    .index("by_item", ["game_item_id"])
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
};

export default defineSchema({
    ...authTables,
    ...applicationTables,
  });