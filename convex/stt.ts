import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { experimental_transcribe as transcribe } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const speechToText = action({
    args: {
      storageId: v.id("_storage"),
    },
    returns: v.union(v.id("stt"), v.null()),
    handler: async (ctx, args) => {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new Error("User must be logged in to process voice.");
      }
  
      // Get the file blob from storage
      const fileBlob = await ctx.storage.get(args.storageId);
      if (!fileBlob) {
        throw new Error("Voice file not found in storage.");
      }

      try {
        // Create a custom OpenAI provider pointing to the STT endpoint
        const customOpenAI = createOpenAI({
          baseURL: process.env.STT_URL!,
          apiKey: process.env.STT_API_KEY!,
        });

        // Convert blob to ArrayBuffer for the AI SDK
        const audioBuffer = await fileBlob.arrayBuffer();
        
        // Use the Vercel AI SDK to transcribe
        const result = await transcribe({
          model: customOpenAI.transcription('whisper-1'), // Use a standard model name
          audio: new Uint8Array(audioBuffer),
          providerOptions: {
            openai: {
              language: 'en'
            }
          }
        });

        console.log('Transcription result:', result.text);
        
        // Use runMutation to upsert the STT result
        const sttId: Id<"stt"> = await ctx.runMutation(internal.stt.upsertSttResult, {
          result: result.text,
          language: result.language || "en",
          responseType: "text",
          creatorId: userId,
          startTime: Date.now(),
        });

        // Delete the file from storage after successful processing
        await ctx.storage.delete(args.storageId);
      
        return sttId;
      } catch (error) {
        console.error('Speech to Text Error:', error);
        
        // Get error message safely
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Store error in database for debugging
        try {
          await ctx.runMutation(internal.stt.upsertSttResult, {
            result: "",
            language: "en",
            responseType: "error",
            creatorId: userId,
            startTime: Date.now(),
          });
        } catch (dbError) {
          console.error('Failed to store error in database:', dbError);
        }
        
        return null;
      }
    },
});

// Helper internal mutation to upsert STT results based on creator ID
export const upsertSttResult = internalMutation({
  args: {
    result: v.string(),
    language: v.string(),
    responseType: v.string(),
    creatorId: v.id("users"),
    startTime: v.number(),
  },
  returns: v.id("stt"),
  handler: async (ctx, args) => {
    // Find existing STT record for this user
    const existingStt = await ctx.db
      .query("stt")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .unique();

    if (existingStt) {
      // Update existing record
      const updateData: any = {
        result: args.result,
        language: args.language,
        responseType: args.responseType,
        startTime: args.startTime,
        updatedAt: Date.now(),
        endTime: Date.now(),
      };
      
      // Clear error if this is a successful result, otherwise set error
      if (args.responseType === "error") {
        updateData.error = "Transcription failed";
      } else {
        updateData.error = undefined;
      }
      
      await ctx.db.patch(existingStt._id, updateData);
      return existingStt._id;
    } else {
      // Create new record
      const insertData: any = {
        result: args.result,
        language: args.language,
        responseType: args.responseType,
        creatorId: args.creatorId,
        startTime: args.startTime,
        endTime: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Set error if this is an error result
      if (args.responseType === "error") {
        insertData.error = "Transcription failed";
      }
      
      return await ctx.db.insert("stt", insertData);
    }
  },
});

// Keep the old function for backward compatibility (deprecated)
export const insertSttResult = internalMutation({
  args: {
    result: v.string(),
    language: v.string(),
    responseType: v.string(),
    creatorId: v.id("users"),
    startTime: v.number(),
  },
  returns: v.id("stt"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("stt", args);
  },
});

// Query to get the current user's STT result
export const getCurrentUserSttResult = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("stt"),
      _creationTime: v.number(),
      result: v.optional(v.string()),
      language: v.string(),
      responseType: v.string(),
      creatorId: v.id("users"),
      startTime: v.number(),
      error: v.optional(v.string()),
      endTime: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const sttResult = await ctx.db
      .query("stt")
      .withIndex("by_creator", (q) => q.eq("creatorId", userId))
      .unique();

    return sttResult || null;
  },
});
  