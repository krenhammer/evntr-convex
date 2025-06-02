import { getConvexClient } from "./convex-client";
import { api } from "../../convex/_generated/api";
import { logger } from "../utils/logger";

// Helper function to interact with plan items via Convex
export const planItemsApi = {
  // List all items for a user
  async listItems(userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Listing plan items for user: ${userId}`);
      
      const result = await client.query(api.planItems.list, { 
        userId, 
        organizationId 
      });
      
      return result || [];
    } catch (error) {
      logger.error("Error listing plan items:", error);
      return [];
    }
  },

  // Get a specific item
  async getItem(id: string) {
    try {
      const client = getConvexClient();
      logger.debug(`Getting plan item with ID: ${id}`);
      
      const result = await client.query(api.planItems.get, { id });
      
      return result;
    } catch (error) {
      logger.error("Error getting plan item:", error);
      return null;
    }
  },

  // Create a new item
  async createItem(data: {
    title: string;
    description?: string;
    type: string;
    instructions?: string;
    systemPrompt?: string;
    userPrompt?: string;
    planStepId?: string;
    order?: number;
  }, userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Creating plan item for user: ${userId}`);
      
      const result = await client.mutation(api.planItems.create, {
        title: data.title,
        description: data.description || "",
        type: data.type,
        instructions: data.instructions || "",
        systemPrompt: data.systemPrompt || "",
        userPrompt: data.userPrompt || "",
        createdById: userId,
        organizationId: organizationId,
        planStepId: data.planStepId,
        order: data.order
      });
      
      return result;
    } catch (error) {
      logger.error("Error creating plan item:", error);
      throw error;
    }
  },

  // Update an existing item
  async updateItem(data: {
    id: string;
    title?: string;
    description?: string;
    type?: string;
    instructions?: string;
    systemPrompt?: string;
    userPrompt?: string;
  }) {
    try {
      const client = getConvexClient();
      logger.debug(`Updating plan item with ID: ${data.id}`);
      
      const result = await client.mutation(api.planItems.update, {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        instructions: data.instructions,
        systemPrompt: data.systemPrompt,
        userPrompt: data.userPrompt
      });
      
      return result;
    } catch (error) {
      logger.error("Error updating plan item:", error);
      throw error;
    }
  },

  // Delete an item
  async deleteItem(id: string) {
    try {
      const client = getConvexClient();
      logger.debug(`Deleting plan item with ID: ${id}`);
      
      const result = await client.mutation(api.planItems.remove, { id });
      
      return result.success;
    } catch (error) {
      logger.error("Error deleting plan item:", error);
      throw error;
    }
  },

  // Add an item to a step
  async addItemToStep(planItemId: string, planStepId: string, order?: number) {
    try {
      const client = getConvexClient();
      logger.debug(`Adding plan item ${planItemId} to step ${planStepId}`);
      
      const result = await client.mutation(api.planItems.addToStep, {
        planItemId,
        planStepId,
        order
      });
      
      return result.success;
    } catch (error) {
      logger.error("Error adding plan item to step:", error);
      throw error;
    }
  },

  // Remove an item from a step
  async removeItemFromStep(planItemId: string, planStepId: string) {
    try {
      const client = getConvexClient();
      logger.debug(`Removing plan item ${planItemId} from step ${planStepId}`);
      
      const result = await client.mutation(api.planItems.removeFromStep, {
        planItemId,
        planStepId
      });
      
      return result.success;
    } catch (error) {
      logger.error("Error removing plan item from step:", error);
      throw error;
    }
  }
}; 