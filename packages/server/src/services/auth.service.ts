import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import prisma from '../prisma/client';
import { config } from '../lib/config';
import type { JwtPayload } from '../middleware/auth';
import { userSchema, type AuthTokens } from '@app001/shared';

const SALT_ROUNDS = 10;


function generateTokens(user: { id: string; email: string; role: string }): AuthTokens {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresInSeconds,
  });

  const refreshToken = crypto.randomBytes(40).toString('hex');

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresInSeconds,
  };
}

export async function register(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: 'viewer' },
  });

  const tokens = generateTokens(user);
  await storeRefreshToken(tokens.refreshToken, user.id);

  return { user: userSchema.parse(user), tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = generateTokens(user);
  await storeRefreshToken(tokens.refreshToken, user.id);

  return { user: userSchema.parse(user), tokens };
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const tokens = generateTokens(stored.user);
  await storeRefreshToken(tokens.refreshToken, stored.user.id);

  return { user: userSchema.parse(stored.user), tokens };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  return userSchema.parse(user);
}

async function storeRefreshToken(token: string, userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
}

// --- Custom Error Classes ---

export class ConflictError extends Error {
  status = 409;
  code = 'CONFLICT';
}

export class UnauthorizedError extends Error {
  status = 401;
  code = 'UNAUTHORIZED';
}

export class NotFoundError extends Error {
  status = 404;
  code = 'NOT_FOUND';
}
