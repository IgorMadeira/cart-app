import { Response, Router } from 'express';
import { UserCreateSchema, UserUpdateSchema, PaginationSchema, ROLES, User } from '@app001/shared';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as userService from '../services/user.service';
import z from 'zod';

const router: Router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Paginated user list }
 */
router.get('/', validate(PaginationSchema, 'query'), async (req, res, next) => {
  try {
    const { page, pageSize, sortBy, sortOrder } = req.query;
    const result = await userService.listUsers(page, pageSize, sortBy, sortOrder);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User found }
 *       404: { description: User not found }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password]
 *             properties:
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [admin, editor, viewer] }
 *     responses:
 *       201: { description: User created }
 *       409: { description: Email already exists }
 */
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(UserCreateSchema, 'body'),
  async (req, res, next) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               name: { type: string }
 *               role: { type: string, enum: [admin, editor, viewer] }
 *     responses:
 *       200: { description: User updated }
 *       404: { description: User not found }
 */
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(z.object({ id: z.string() }), 'params'),
  validate(UserUpdateSchema, 'body'),
  async (
    req, 
    res: Response<{
  success: boolean;
  data: User;
  }>, next) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: User deleted }
 *       404: { description: User not found }
 */
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(z.object({ id: z.string() }), 'params'),
  async (req, res, next) => {
    try {
      await userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
