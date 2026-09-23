import { Router } from 'express';
import {
  CreateDocumentRequestSchema,
  PostValidateDocumentConformityRequestSchema,
  PreValidateDocumentConformityRequestSchema,
  ROLES,
} from '@app001/shared';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as documentCreationService from '../services/document-creation.service';

const router: Router = Router();

router.use(authenticate);

router.post(
  '/generate',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  validate(CreateDocumentRequestSchema, 'body'),
  async (req, res, next) => {
    try {
      const result = await documentCreationService.generateCreateDocumentContent(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/pre-validate-conformity',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  validate(PreValidateDocumentConformityRequestSchema, 'body'),
  async (req, res, next) => {
    try {
      const result = await documentCreationService.preValidateDocumentConformity(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/post-validate-conformity',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  validate(PostValidateDocumentConformityRequestSchema, 'body'),
  async (req, res, next) => {
    try {
      const result = await documentCreationService.postValidateDocumentConformity(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
