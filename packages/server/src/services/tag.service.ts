import prisma from '../prisma/client';
import type { Tag } from '@app001/shared';
import { ConflictError, NotFoundError } from './auth.service';

function mapTag(db: { id: string; name: string; createdAt: Date }): Tag {
  return {
    id: db.id,
    name: db.name,
    createdAt: db.createdAt.toISOString(),
  };
}

export async function listTags(): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  return tags.map(mapTag);
}

export async function createTag(data: { name: string }): Promise<Tag> {
  const existing = await prisma.tag.findUnique({ where: { name: data.name } });
  if (existing) throw new ConflictError('Tag with this name already exists');

  const tag = await prisma.tag.create({ data });
  return mapTag(tag);
}

export async function deleteTag(id: string): Promise<void> {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) throw new NotFoundError('Tag not found');
  await prisma.tag.delete({ where: { id } });
}
