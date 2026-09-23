import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function parseDurationSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value) return fallbackSeconds;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue > 0) return numericValue;

  const durationMatch = /^(\d+)([smhd])$/.exec(value.trim());
  if (!durationMatch) return fallbackSeconds;

  const amount = Number(durationMatch[1]);
  const unit = durationMatch[2];

  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 60 * 60;
  return amount * 24 * 60 * 60;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv,
  isProd,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    expiresInSeconds: parseDurationSeconds(process.env.JWT_EXPIRES_IN, 15 * 60),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
  },
} as const;
