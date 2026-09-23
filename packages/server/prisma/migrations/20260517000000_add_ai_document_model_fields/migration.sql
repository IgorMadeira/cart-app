-- AlterTable
ALTER TABLE "document_models" ADD COLUMN "ai_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "document_models" ADD COLUMN "ai_instructions" TEXT;
ALTER TABLE "document_models" ADD COLUMN "legislation_rules" TEXT;

-- CreateTable
CREATE TABLE "document_model_links" (
    "source_document_model_id" TEXT NOT NULL,
    "linked_document_model_id" TEXT NOT NULL,
    "link_type" TEXT NOT NULL DEFAULT 'related',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("source_document_model_id", "linked_document_model_id"),
    CONSTRAINT "document_model_links_source_document_model_id_fkey" FOREIGN KEY ("source_document_model_id") REFERENCES "document_models" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_model_links_linked_document_model_id_fkey" FOREIGN KEY ("linked_document_model_id") REFERENCES "document_models" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "document_model_links_linked_document_model_id_idx" ON "document_model_links"("linked_document_model_id");