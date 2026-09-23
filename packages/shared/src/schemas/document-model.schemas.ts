import { z } from 'zod';
import { PaginationSchema } from './user.schemas';

export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const CategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const TagCreateSchema = z.object({
  name: z.string().min(1).max(50),
});

export const DocumentGenerationFieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const DocumentGenerationRequestSchema = z.object({
  requesterInstructions: z.string().max(5000).optional(),
  inputValues: z.record(DocumentGenerationFieldValueSchema).optional(),
});

export const DocumentModelCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string().optional(),
  aiEnabled: z.boolean().optional(),
  aiInstructions: z.string().max(10000).optional(),
  legislationRules: z.string().max(10000).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  linkedDocumentModelIds: z.array(z.string()).optional(),
});

export const DocumentModelUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  content: z.string().optional(),
  aiEnabled: z.boolean().optional(),
  aiInstructions: z.string().max(10000).optional(),
  legislationRules: z.string().max(10000).optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  linkedDocumentModelIds: z.array(z.string()).optional(),
});

export const DocumentModelFilterSchema = PaginationSchema.extend({
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  search: z.string().optional(),
});

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
export type TagCreateInput = z.infer<typeof TagCreateSchema>;
export type DocumentGenerationRequestInput = z.infer<typeof DocumentGenerationRequestSchema>;
export type DocumentModelCreateInput = z.infer<typeof DocumentModelCreateSchema>;
export type DocumentModelUpdateInput = z.infer<typeof DocumentModelUpdateSchema>;
export type DocumentModelFilterInput = z.infer<typeof DocumentModelFilterSchema>;
