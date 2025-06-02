import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import { logger } from "../utils/logger";

// Initialize the Convex client
let convexClient: ConvexReactClient | null = null;

export function getConvexClient() {
  if (!convexClient) {
    const url = (import.meta as any).env.VITE_CONVEX_URL;
    if (!url) {
      throw new Error("VITE_CONVEX_URL environment variable is not set");
    }
    convexClient = new ConvexReactClient(url);
  }
  return convexClient;
}

// Helper function to interact with assistants via Convex
export const assistantsApi = {
  // List assistants for a user
  async listAssistants(userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Listing assistants for user: ${userId}`);
      
      // Use the actual Convex function to list assistants
      const result = await client.query(api.assistants.list, { 
        userId, 
        organizationId 
      });
      
      return result || [];
    } catch (error) {
      logger.error("Error listing assistants:", error);
      return [];
    }
  },

  // Get a specific assistant
  async getAssistant(id: string, userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Getting assistant with ID: ${id}`);
      
      // Use the actual Convex function to get an assistant
      const result = await client.query(api.assistants.get, { id });
      
      return result;
    } catch (error) {
      logger.error("Error getting assistant:", error);
      return null;
    }
  },

  // Create a new assistant
  async createAssistant(data: any, userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Creating assistant for user: ${userId}`);
      
      // Use the actual Convex function to create an assistant
      const result = await client.mutation(api.assistants.create, {
        name: data.name,
        description: data.description || "",
        instructions: data.instructions || "",
        knowledge: data.knowledge || "",
        createdById: userId,
        organizationId: organizationId,
        files: Array.isArray(data.files) ? data.files.map((file: any) => ({
          filename: file.filename,
          content: file.content,
          fileType: file.fileType
        })) : []
      });
      
      return result;
    } catch (error) {
      logger.error("Error creating assistant:", error);
      throw error;
    }
  },

  // Update an existing assistant
  async updateAssistant(data: any, userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Updating assistant with ID: ${data.id}`);
      
      // Use the actual Convex function to update an assistant
      const result = await client.mutation(api.assistants.update, {
        id: data.id,
        name: data.name,
        description: data.description,
        instructions: data.instructions,
        knowledge: data.knowledge,
        files: Array.isArray(data.files) ? data.files.map((file: any) => ({
          id: file.id,
          filename: file.filename,
          content: file.content,
          fileType: file.fileType
        })) : undefined
      });
      
      return result;
    } catch (error) {
      logger.error("Error updating assistant:", error);
      throw error;
    }
  },

  // Delete an assistant
  async deleteAssistant(id: string, userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Deleting assistant with ID: ${id}`);
      
      // Use the actual Convex function to delete an assistant
      const result = await client.mutation(api.assistants.remove, { id });
      
      return result.success;
    } catch (error) {
      logger.error("Error deleting assistant:", error);
      throw error;
    }
  }
}; 