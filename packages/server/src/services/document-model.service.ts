import prisma from '../prisma/client';
import type { DocumentModel, DocumentModelListItem, PaginatedResponse } from '@app001/shared';
import { NotFoundError } from './auth.service';
import type { Prisma } from '@prisma/client';

const documentInclude = {
  category: true,
  createdBy: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.DocumentModelInclude;

type DbDocumentWithRelations = Prisma.DocumentModelGetPayload<{ include: typeof documentInclude }>;

function mapDocument(db: DbDocumentWithRelations): DocumentModel {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    content: db.content,
    fileName: db.fileName,
    fileType: db.fileType,
    fileSize: db.fileSize,
    categoryId: db.categoryId,
    categoryName: db.category?.name ?? null,
    createdById: db.createdById,
    createdByName: db.createdBy.name,
    tags: db.tags.map((dt) => ({ id: dt.tag.id, name: dt.tag.name })),
    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),
  };
}

function mapDocumentListItem(db: DbDocumentWithRelations): DocumentModelListItem {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    fileName: db.fileName,
    fileType: db.fileType,
    fileSize: db.fileSize,
    categoryId: db.categoryId,
    categoryName: db.category?.name ?? null,
    createdById: db.createdById,
    createdByName: db.createdBy.name,
    tags: db.tags.map((dt) => ({ id: dt.tag.id, name: dt.tag.name })),
    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),
  };
}

export async function listDocuments(filters: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  tagId?: string;
  search?: string;
}): Promise<PaginatedResponse<DocumentModelListItem>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';

  const where: Prisma.DocumentModelWhereInput = {};

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.tagId) {
    where.tags = { some: { tagId: filters.tagId } };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.documentModel.findMany({
      where,
      include: documentInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.documentModel.count({ where }),
  ]);

  return {
    items: items.map(mapDocumentListItem),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getDocumentById(id: string): Promise<DocumentModel> {
  const doc = await prisma.documentModel.findUnique({
    where: { id },
    include: documentInclude,
  });
  if (!doc) throw new NotFoundError('Document Model not found');
  return mapDocument(doc);
}

export async function createDocument(
  data: {
    title: string;
    description?: string;
    content?: string;
    categoryId?: string;
    tagIds?: string[];
  },
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer } | undefined,
  userId: string,
): Promise<DocumentModel> {
  const doc = await prisma.documentModel.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      categoryId: data.categoryId,
      createdById: userId,
      fileName: file?.originalname,
      fileType: file?.mimetype,
      fileSize: file?.size,
      fileData: file?.buffer,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: documentInclude,
  });
  return mapDocument(doc);
}

export async function updateDocument(
  id: string,
  data: {
    title?: string;
    description?: string;
    content?: string;
    categoryId?: string | null;
    tagIds?: string[];
  },
  file?: { originalname: string; mimetype: string; size: number; buffer: Buffer },
): Promise<DocumentModel> {
  const existing = await prisma.documentModel.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Document Model not found');

  const doc = await prisma.documentModel.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      categoryId: data.categoryId,
      fileName: file?.originalname ?? undefined,
      fileType: file?.mimetype ?? undefined,
      fileSize: file?.size ?? undefined,
      fileData: file?.buffer ?? undefined,
      tags: data.tagIds
        ? {
            deleteMany: {},
            create: data.tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    include: documentInclude,
  });
  return mapDocument(doc);
}

export async function deleteDocument(id: string): Promise<void> {
  const doc = await prisma.documentModel.findUnique({ where: { id } });
  if (!doc) throw new NotFoundError('Document Model not found');
  await prisma.documentModel.delete({ where: { id } });
}

export async function getDocumentFile(id: string): Promise<{
  fileName: string;
  fileType: string;
  fileData: Buffer;
}> {
  const doc = await prisma.documentModel.findUnique({
    where: { id },
    select: { fileName: true, fileType: true, fileData: true },
  });
  if (!doc || !doc.fileData || !doc.fileName || !doc.fileType) {
    throw new NotFoundError('File not found');
  }
  return {
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileData: Buffer.from(doc.fileData),
  };
}
