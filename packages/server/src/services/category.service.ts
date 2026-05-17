import prisma from '../prisma/client';
import type { Category } from '@app001/shared';
import { ConflictError, NotFoundError } from './auth.service';

function mapCategory(db: { id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date }): Category {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),
  };
}

export async function listCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return categories.map(mapCategory);
}

export async function getCategoryById(id: string): Promise<Category> {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Category not found');
  return mapCategory(category);
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  const existing = await prisma.category.findUnique({ where: { name: data.name } });
  if (existing) throw new ConflictError('Category with this name already exists');

  const category = await prisma.category.create({ data });
  return mapCategory(category);
}

export async function updateCategory(id: string, data: { name?: string; description?: string }): Promise<Category> {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Category not found');

  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictError('Category with this name already exists');
  }

  const updated = await prisma.category.update({ where: { id }, data });
  return mapCategory(updated);
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Category not found');
  await prisma.category.delete({ where: { id } });
}
