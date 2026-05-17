import { Router } from 'express';
import { TagCreateSchema, ROLES } from '@app001/shared';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as tagService from '../services/tag.service';
import z from 'zod';

const router: Router = Router();

router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const tags = await tagService.listTags();
    res.json({ success: true, data: tags });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  validate(TagCreateSchema, 'body'),
  async (req, res, next) => {
    try {
      const tag = await tagService.createTag(req.body);
      res.status(201).json({ success: true, data: tag });
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
      await tagService.deleteTag(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
