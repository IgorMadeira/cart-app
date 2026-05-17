import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './lib/swagger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import documentModelRoutes from './routes/document-models';
import { config } from './lib/config';
import type { Express } from 'express';

const app: Express = express();

// --- Security & parsing ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// --- Rate limiting (production only) ---
if (config.isProd) {
  app.use(
    '/api/',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}

// --- API docs ---
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/document-models', documentModelRoutes);

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Error handler (must be last) ---
app.use(errorHandler);

export default app;
