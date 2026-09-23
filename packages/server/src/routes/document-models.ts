import { Router, type RequestHandler } from 'express';
import path from 'node:path';
import multer from 'multer';
import {
  DocumentGenerationRequestSchema,
  DocumentModelCreateSchema,
  DocumentModelFilterSchema,
  DocumentModelUpdateSchema,
  ROLES,
} from '@app001/shared';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as documentModelService from '../services/document-model.service';
import * as documentGenerationService from '../services/document-generation.service';
import z from 'zod';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/html',
  'text/xml',
  'application/json',
  'application/xml',
];

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.md', '.html', '.htm', '.xml', '.json',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ALLOWED_MIME_TYPES.includes(file.mimetype) ||
      file.mimetype.startsWith('text/') ||
      (file.mimetype === 'application/octet-stream' && ALLOWED_EXTENSIONS.has(ext))
    ) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

function parseJsonStringArrayField(body: Record<string, unknown>, fieldName: string): void {
  const value = body[fieldName];
  if (typeof value !== 'string') return;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      body[fieldName] = undefined;
      return;
    }

    const values: string[] = [];
    for (const item of parsed) {
      if (typeof item !== 'string') {
        body[fieldName] = undefined;
        return;
      }
      values.push(item);
    }

    body[fieldName] = values;
  } catch {
    body[fieldName] = undefined;
  }
}

function parseBooleanField(body: Record<string, unknown>, fieldName: string): void {
  const value = body[fieldName];
  if (value === 'true') {
    body[fieldName] = true;
    return;
  }

  if (value === 'false') {
    body[fieldName] = false;
  }
}

const normalizeDocumentModelFormBody: RequestHandler = (req, _res, next) => {
  parseJsonStringArrayField(req.body, 'tagIds');
  parseJsonStringArrayField(req.body, 'linkedDocumentModelIds');
  parseBooleanField(req.body, 'aiEnabled');
  next();
};

const router: Router = Router();

router.use(authenticate);

router.get(
  '/', 
  validate(DocumentModelFilterSchema, 'query'), 
  async (req, res, next) => {
  try {
    const result = await documentModelService.listDocuments(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:id',
  validate(z.object({ id: z.string() }), 'params'),
  async (req, res, next) => {
    try {
    const doc = await documentModelService.getDocumentById(req.params.id);
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id/download',
  validate(z.object({ id: z.string() }), 'params'),
  async (req, res, next) => {
    try {
      const file = await documentModelService.getDocumentFile(req.params.id);
      res.setHeader('Content-Type', file.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);
      res.send(file.fileData);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:id/generate',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  validate(z.object({ id: z.string() }), 'params'),
  validate(DocumentGenerationRequestSchema, 'body'),
  async (req, res, next) => {
    try {
      const result = await documentGenerationService.generateDocumentFromModel(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  upload.single('file'),
  normalizeDocumentModelFormBody,
  validate(DocumentModelCreateSchema, 'body'),
  async (req, res, next) => {
    try {
      const doc = await documentModelService.createDocument(req.body, req.file, req.user!.sub);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  upload.single('file'),
  normalizeDocumentModelFormBody,
  validate(z.object({ id: z.string() }), 'params'),
  validate(DocumentModelUpdateSchema, 'body'),
  async (req, res, next) => {
    try {
      const doc = await documentModelService.updateDocument(req.params.id, req.body, req.file);
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.EDITOR),
  validate(z.object({ id: z.string() }), 'params'),
  async (req, res, next) => {
    try {
      await documentModelService.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
