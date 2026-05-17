import { Router } from 'express';
import { CategoryCreateSchema, CategoryUpdateSchema, ROLES } from '@app001/shared';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as categoryService from '../services/category.service';
import z from 'zod';

const router: Router = Router();

router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const categories = await categoryService.listCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(CategoryCreateSchema, 'body'),
  async (req, res, next) => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(z.object({ id: z.string() }), 'params'),
  validate(CategoryUpdateSchema, 'body'),
  async (req, res, next) => {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(z.object({ id: z.string() }), 'params'),
  async (req, res, next) => {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
