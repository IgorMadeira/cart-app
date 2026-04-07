import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import type { User, PaginatedResponse } from '@app001/shared';
import { NotFoundError, ConflictError } from './auth.service';

function mapUser(dbUser: { id: string; email: string; name: string; role: string; createdAt: Date; updatedAt: Date }): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    createdAt: dbUser.createdAt.toISOString(),
    updatedAt: dbUser.updatedAt.toISOString(),
  };
}

export async function listUsers(
  page = 1,
  pageSize = 20,
  sortBy = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'asc',
): Promise<PaginatedResponse<User>> {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count(),
  ]);

  return {
    items: items.map(mapUser),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getUserById(id: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');
  return mapUser(user);
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  role?: string;
}): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError('Email already in use');

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role || 'viewer',
    },
  });
  return mapUser(user);
}

export async function updateUser(
  id: string,
  data: { email?: string; name?: string; role?: string },
): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already in use');
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return mapUser(updated);
}

export async function deleteUser(id: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');
  await prisma.user.delete({ where: { id } });
}
