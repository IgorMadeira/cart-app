-- Rename documents table to document_models
ALTER TABLE "documents" RENAME TO "document_models";

-- Rename document_tags join table to document_model_tags
ALTER TABLE "document_tags" RENAME TO "document_model_tags";
