import { api } from '../../convex/_generated/api';
import { getConvexClient } from './convex-client';

// Utility functions to simulate Drizzle's eq, and, max operators
export const convexOps = {
  // Simulate the 'eq' (equal) operator
  eq: (field: string, value: any) => ({
    field,
    operator: 'eq',
    value
  }),
  
  // Simulate the 'and' operator
  and: (...conditions: any[]) => ({
    operator: 'and',
    conditions
  }),
  
  // Simulate the 'max' operator
  max: (field: string) => ({
    operator: 'max',
    field
  }),
  
  // Simulate the 'desc' operator
  desc: (field: string) => ({
    operator: 'desc',
    field
  }),
  
  // Simulate the 'asc' operator
  asc: (field: string) => ({
    operator: 'asc',
    field
  })
};

// Helper function to convert field references like assistants.id to simple field names
export const getFieldName = (fieldRef: string) => {
  const parts = fieldRef.split('.');
  return parts.length > 1 ? parts[1] : parts[0];
};

// Export the operators as individual functions for compatibility
export const eq = convexOps.eq;
export const and = convexOps.and;
export const max = convexOps.max;
export const desc = convexOps.desc;
export const asc = convexOps.asc;

// Table name references for type safety and consistency
export const tableNames = {
  assistants: 'assistants',
  assistantFiles: 'assistant_files',
  planTemplates: 'plan_templates',
  planSteps: 'plan_template_steps',
  planItems: 'plan_template_items',
  planStepItems: 'plan_template_steps_items',
  invitations: 'invitations',
  members: 'members',
  organizations: 'organizations',
  teams: 'teams',
  teamMembers: 'team_members'
};

// Field definitions for common tables
export const assistants = {
  id: 'id',
  name: 'name',
  description: 'description',
  instructions: 'instructions',
  knowledge: 'knowledge',
  createdById: 'created_by',
  organizationId: 'organization_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const assistantFiles = {
  id: 'id',
  assistantId: 'assistant_id',
  filename: 'filename',
  fileType: 'file_type',
  content: 'content',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const planTemplates = {
  id: 'id',
  title: 'title',
  description: 'description',
  createdById: 'created_by',
  organizationId: 'organization_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const planSteps = {
  id: 'id',
  planTemplateId: 'plan_template_id',
  title: 'title',
  description: 'description',
  order: 'order',
  createdById: 'created_by',
  organizationId: 'organization_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const planItems = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  instructions: 'instructions',
  systemPrompt: 'system_prompt',
  userPrompt: 'user_prompt',
  createdById: 'created_by',
  organizationId: 'organization_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const planStepItems = {
  id: 'id',
  planStepId: 'plan_step_id',
  planItemId: 'plan_item_id',
  order: 'order',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const invitations = {
  id: 'id',
  email: 'email',
  organizationId: 'organization_id',
  status: 'status',
  role: 'role',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const members = {
  id: 'id',
  userId: 'user_id',
  organizationId: 'organization_id',
  role: 'role',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const organizations = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  logo: 'logo',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const teams = {
  id: 'id',
  name: 'name',
  description: 'description',
  organizationId: 'organization_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

export const teamMembers = {
  id: 'id',
  teamId: 'team_id',
  memberId: 'member_id',
  role: 'role',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

// Helper function for query filter conditions
export const neq = (field: string, value: any) => ({
  field,
  operator: 'neq',
  value,
});

// Helper function for query filter conditions
export const gt = (field: string, value: any) => ({
  field,
  operator: 'gt',
  value,
});

// Helper function for query filter conditions
export const gte = (field: string, value: any) => ({
  field,
  operator: 'gte',
  value,
});

// Helper function for query filter conditions
export const lt = (field: string, value: any) => ({
  field,
  operator: 'lt',
  value,
});

// Helper function for query filter conditions
export const lte = (field: string, value: any) => ({
  field,
  operator: 'lte',
  value,
});

// Helper function for query filter conditions
export const contains = (field: string, value: any) => ({
  field,
  operator: 'contains',
  value,
});

// Helper function for query filter conditions
export const startsWith = (field: string, value: string) => ({
  field,
  operator: 'startsWith',
  value,
});

// Helper function for query filter conditions
export const endsWith = (field: string, value: string) => ({
  field,
  operator: 'endsWith',
  value,
});

// Schema for the assistant entity
export const assistantsSchema = {
  tableName: 'assistants',
  fields: {
    id: 'string',
    name: 'string',
    description: 'string',
    instructions: 'string',
    knowledge: 'string',
    organization_id: 'string',
    created_by: 'string',
    created_at: 'string',
    updated_at: 'string',
  },
};

// Schema for the assistant file entity
export const assistantFilesSchema = {
  tableName: 'assistant_files',
  fields: {
    id: 'string',
    assistant_id: 'string',
    filename: 'string',
    content: 'string',
    file_type: 'string',
    created_at: 'string',
    updated_at: 'string',
  },
}; 