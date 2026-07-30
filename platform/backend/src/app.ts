import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import { resolveTenant } from './middleware/tenant.js';
import { correlationMiddleware } from './services/observability.js';
import { securityHeadersExtra } from './middleware/securityHardening.js';
import { API_VERSION } from './utils/pagination.js';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || CLIENT_URL)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, // SPA hosts own CSP; API is JSON-only
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || CORS_ORIGINS.includes(origin) || CORS_ORIGINS.includes('*')) {
        cb(null, true);
        return;
      }
      cb(null, CORS_ORIGINS[0] || true);
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(correlationMiddleware);
app.use(securityHeadersExtra);
app.use(resolveTenant);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
  }),
);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'SV Live Events API',
    version: API_VERSION,
    health: '/api/health',
    frontend: CLIENT_URL,
    docs: 'All REST endpoints are under /api/* — OpenAPI: docs/openapi.yaml',
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

export function getPort(): number {
  return Number(process.env.PORT) || 5001;
}

export { logger };
