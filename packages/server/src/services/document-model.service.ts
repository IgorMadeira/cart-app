import prisma from '../prisma/client';
import type {
  DocumentModel,
  DocumentModelCreateInput,
  DocumentModelListItem,
  DocumentModelUpdateInput,
  PaginatedResponse,
} from '@app001/shared';
import { ConflictError, NotFoundError } from './auth.service';
import type { Prisma } from '@prisma/client';

const documentInclude = {
  category: true,
  createdBy: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
  linkedDocuments: {
    include: {
      linkedDocumentModel: {
        include: { category: true },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.DocumentModelInclude;

type DbDocumentWithRelations = Prisma.DocumentModelGetPayload<{ include: typeof documentInclude }>;

interface UploadedDocumentFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

function getUniqueDocumentModelIds(ids: string[] | undefined): string[] {
  if (!ids) return [];

  const uniqueIds: string[] = [];
  for (const id of ids) {
    if (!uniqueIds.includes(id)) {
      uniqueIds.push(id);
    }
  }
  return uniqueIds;
}

function buildLinkedDocumentCreates(linkedDocumentModelIds: string[]) {
  return linkedDocumentModelIds.map((linkedDocumentModelId, index) => ({
    linkedDocumentModelId,
    sortOrder: index,
  }));
}

function getFileData(file: UploadedDocumentFile | undefined): Uint8Array<ArrayBuffer> | undefined {
  if (!file) return undefined;
  const fileData = new Uint8Array(file.buffer.length);
  fileData.set(file.buffer);
  return fileData;
}

async function validateLinkedDocumentModelIds(
  client: Prisma.TransactionClient,
  linkedDocumentModelIds: string[],
  sourceDocumentModelId?: string,
): Promise<void> {
  if (linkedDocumentModelIds.length === 0) return;

  if (sourceDocumentModelId && linkedDocumentModelIds.includes(sourceDocumentModelId)) {
    throw new ConflictError('A Document Model cannot link to itself');
  }

  const total = await client.documentModel.count({
    where: { id: { in: linkedDocumentModelIds } },
  });

  if (total !== linkedDocumentModelIds.length) {
    throw new NotFoundError('Linked Document Model not found');
  }
}

function mapLinkedDocuments(db: DbDocumentWithRelations) {
  return db.linkedDocuments.map((link) => ({
    id: link.linkedDocumentModel.id,
    title: link.linkedDocumentModel.title,
    categoryId: link.linkedDocumentModel.categoryId,
    categoryName: link.linkedDocumentModel.category?.name ?? null,
    linkType: link.linkType,
    sortOrder: link.sortOrder,
  }));
}

function mapDocument(db: DbDocumentWithRelations): DocumentModel {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    content: db.content,
    aiEnabled: db.aiEnabled,
    aiInstructions: db.aiInstructions,
    legislationRules: db.legislationRules,
    fileName: db.fileName,
    fileType: db.fileType,
    fileSize: db.fileSize,
    categoryId: db.categoryId,
    categoryName: db.category?.name ?? null,
    createdById: db.createdById,
    createdByName: db.createdBy.name,
    tags: db.tags.map((dt) => ({ id: dt.tag.id, name: dt.tag.name })),
    linkedDocuments: mapLinkedDocuments(db),
    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),
  };
}

function mapDocumentListItem(db: DbDocumentWithRelations): DocumentModelListItem {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    aiEnabled: db.aiEnabled,
    fileName: db.fileName,
    fileType: db.fileType,
    fileSize: db.fileSize,
    categoryId: db.categoryId,
    categoryName: db.category?.name ?? null,
    createdById: db.createdById,
    createdByName: db.createdBy.name,
    tags: db.tags.map((dt) => ({ id: dt.tag.id, name: dt.tag.name })),
    linkedDocuments: mapLinkedDocuments(db),
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
  data: DocumentModelCreateInput,
  file: UploadedDocumentFile | undefined,
  userId: string,
): Promise<DocumentModel> {
  const linkedDocumentModelIds = getUniqueDocumentModelIds(data.linkedDocumentModelIds);

  const doc = await prisma.$transaction(async (client) => {
    await validateLinkedDocumentModelIds(client, linkedDocumentModelIds);

    return client.documentModel.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        aiEnabled: data.aiEnabled ?? false,
        aiInstructions: data.aiInstructions,
        legislationRules: data.legislationRules,
        categoryId: data.categoryId,
        createdById: userId,
        fileName: file?.originalname,
        fileType: file?.mimetype,
        fileSize: file?.size,
        fileData: getFileData(file),
        tags: data.tagIds?.length
          ? { create: data.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        linkedDocuments: linkedDocumentModelIds.length
          ? { create: buildLinkedDocumentCreates(linkedDocumentModelIds) }
          : undefined,
      },
      select: { id: true },
    });
  });

  return getDocumentById(doc.id);
}

export async function updateDocument(
  id: string,
  data: DocumentModelUpdateInput,
  file?: UploadedDocumentFile,
): Promise<DocumentModel> {
  const existing = await prisma.documentModel.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Document Model not found');

  const linkedDocumentModelIds = data.linkedDocumentModelIds === undefined
    ? undefined
    : getUniqueDocumentModelIds(data.linkedDocumentModelIds);

  const doc = await prisma.$transaction(async (client) => {
    if (linkedDocumentModelIds) {
      await validateLinkedDocumentModelIds(client, linkedDocumentModelIds, id);
    }

    return client.documentModel.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        aiEnabled: data.aiEnabled,
        aiInstructions: data.aiInstructions,
        legislationRules: data.legislationRules,
        categoryId: data.categoryId,
        fileName: file?.originalname ?? undefined,
        fileType: file?.mimetype ?? undefined,
        fileSize: file?.size ?? undefined,
        fileData: getFileData(file),
        tags: data.tagIds
          ? {
              deleteMany: {},
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
        linkedDocuments: linkedDocumentModelIds
          ? {
              deleteMany: {},
              create: buildLinkedDocumentCreates(linkedDocumentModelIds),
            }
          : undefined,
      },
      select: { id: true },
    });
  });

  return getDocumentById(doc.id);
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
