import { Router } from 'express';
import { LoginSchema, RegisterSchema } from '@app001/shared';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { config } from '../lib/config';
import * as authService from '../services/auth.service';

const router: Router = Router();

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 min
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookies(res: import('express').Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('access_token', tokens.accessToken, {
    ...config.cookie,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookie('refresh_token', tokens.refreshToken, {
    ...config.cookie,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/api/auth',
  });
}

function clearAuthCookies(res: import('express').Response) {
  res.clearCookie('access_token', { path: config.cookie.path });
  res.clearCookie('refresh_token', { path: '/api/auth' });
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201: { description: User created }
 *       409: { description: Email already exists }
 */
router.post('/register', validate(RegisterSchema, 'body'), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    setAuthCookies(res, result.tokens);
    res.status(201).json({ success: true, data: { user: result.user } });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(LoginSchema, 'body'), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setAuthCookies(res, result.tokens);
    res.json({ success: true, data: { user: result.user } });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200: { description: Tokens refreshed }
 *       401: { description: Invalid refresh token }
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing refresh token' } });
      return;
    }
    const result = await authService.refreshAccessToken(refreshToken);
    setAuthCookies(res, result.tokens);
    res.json({ success: true, data: { user: result.user } });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Unauthorized }
 */
router.get(
  '/me', 
  authenticate, 
  async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.sub);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and clear auth cookies
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', (_req, res) => {
  clearAuthCookies(res);
  res.json({ success: true });
});

export default router;
