import { getConvexClient } from "./convex-client";
import { api } from "../../convex/_generated/api";
import { logger } from "../utils/logger";

// Helper function to interact with plan templates via Convex
export const planTemplatesApi = {
  // List templates for a user
  async listTemplates(userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Listing plan templates for user: ${userId}`);
      
      const result = await client.query(api.planTemplates.list, { 
        userId, 
        organizationId 
      });
      
      return result || [];
    } catch (error) {
      logger.error("Error listing plan templates:", error);
      return [];
    }
  },

  // Get a specific template
  async getTemplate(id: string) {
    try {
      const client = getConvexClient();
      logger.debug(`Getting plan template with ID: ${id}`);
      
      const result = await client.query(api.planTemplates.get, { id });
      
      return result;
    } catch (error) {
      logger.error("Error getting plan template:", error);
      return null;
    }
  },

  // Create a new template
  async createTemplate(data: { title: string; description?: string }, userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Creating plan template for user: ${userId}`);
      
      const result = await client.mutation(api.planTemplates.create, {
        title: data.title,
        description: data.description || "",
        createdById: userId,
        organizationId: organizationId
      });
      
      return result;
    } catch (error) {
      logger.error("Error creating plan template:", error);
      throw error;
    }
  },

  // Update an existing template
  async updateTemplate(data: { id: string; title?: string; description?: string }) {
    try {
      const client = getConvexClient();
      logger.debug(`Updating plan template with ID: ${data.id}`);
      
      const result = await client.mutation(api.planTemplates.update, {
        id: data.id,
        title: data.title,
        description: data.description
      });
      
      return result;
    } catch (error) {
      logger.error("Error updating plan template:", error);
      throw error;
    }
  },

  // Delete a template
  async deleteTemplate(id: string) {
    try {
      const client = getConvexClient();
      logger.debug(`Deleting plan template with ID: ${id}`);
      
      const result = await client.mutation(api.planTemplates.remove, { id });
      
      return result.success;
    } catch (error) {
      logger.error("Error deleting plan template:", error);
      throw error;
    }
  },

  // Create a new step in a template
  async createStep(data: { 
    planTemplateId: string;
    title: string;
    description?: string;
  }, userId: string, organizationId: string | null) {
    try {
      const client = getConvexClient();
      logger.debug(`Creating step in plan template ID: ${data.planTemplateId}`);
      
      const result = await client.mutation(api.planTemplates.createStep, {
        planTemplateId: data.planTemplateId,
        title: data.title,
        description: data.description || "",
        createdById: userId,
        organizationId: organizationId
      });
      
      return result;
    } catch (error) {
      logger.error("Error creating plan template step:", error);
      throw error;
    }
  },

  // Update an existing step
  async updateStep(data: { id: string; title?: string; description?: string }) {
    try {
      const client = getConvexClient();
      logger.debug(`Updating plan template step with ID: ${data.id}`);
      
      const result = await client.mutation(api.planTemplates.updateStep, {
        id: data.id,
        title: data.title,
        description: data.description
      });
      
      return result;
    } catch (error) {
      logger.error("Error updating plan template step:", error);
      throw error;
    }
  },

  // Delete a step
  async deleteStep(id: string) {
    try {
      const client = getConvexClient();
      logger.debug(`Deleting plan template step with ID: ${id}`);
      
      const result = await client.mutation(api.planTemplates.removeStep, { id });
      
      return result.success;
    } catch (error) {
      logger.error("Error deleting plan template step:", error);
      throw error;
    }
  },

  // Reorder steps in a template
  async reorderSteps(planTemplateId: string, steps: Array<{ id: string; order: number }>) {
    try {
      const client = getConvexClient();
      logger.debug(`Reordering steps in plan template ID: ${planTemplateId}`);
      
      const result = await client.mutation(api.planTemplates.reorderSteps, {
        planTemplateId,
        steps
      });
      
      return result.success;
    } catch (error) {
      logger.error("Error reordering plan template steps:", error);
      throw error;
    }
  },

  // Reorder items within a step
  async reorderStepItems(planStepId: string, items: Array<{ id: string; order: number }>) {
    try {
      const client = getConvexClient();
      logger.debug(`Reordering items in plan step ID: ${planStepId}`);
      
      const result = await client.mutation(api.planTemplates.reorderStepItems, {
        planStepId,
        items
      });
      
      return result.success;
    } catch (error) {
      logger.error("Error reordering plan step items:", error);
      throw error;
    }
  },
}; 