import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import cookieSession from 'cookie-session';
import { taxRoutes } from './routes/tax';
import { profileRoutes } from './routes/profile';
import { taxDataRoutes } from './routes/tax-data';
import { pdfRoutes } from './routes/pdf';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';
import { sessionConfig, keycloak } from './config/keycloak';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());

// CORS Configuration für dynamische Frontend-URLs
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Erlaube requests ohne origin (z.B. Postman, curl)
    if (!origin) {
      console.log('No origin');
      return callback(null, true);
    }

    // Lokale Entwicklung
    if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
      console.log('Localhost');
      return callback(null, true);
    }

    // Dynamische Frontend-URLs basierend auf API-URL
    const apiUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Wenn FRONTEND_URL gesetzt ist, erlaube diese
    if (apiUrl && origin.startsWith(apiUrl.replace(':3001', ':3000'))) {
      console.log('FRONTEND_URL');
      return callback(null, true);
    }

    // Erlaube alle Origins mit gleicher Domain-Kette
    try {
      const url = new URL(origin);
      const apiUrlObj = new URL(apiUrl);

      console.log('url', url);
      console.log('apiUrlObj', apiUrlObj);

      // Extrahiere Domain-Kette (alles nach dem ersten Punkt)
      const getDomainChain = (hostname: string) => {
        const parts = hostname.split('.');
        return parts.length > 1 ? parts.slice(1).join('.') : hostname;
      };

      const originDomainChain = getDomainChain(url.hostname);
      const apiDomainChain = getDomainChain(apiUrlObj.hostname);

      console.log('originDomainChain', originDomainChain);
      console.log('apiDomainChain', apiDomainChain);

      // Wenn Domain-Kette übereinstimmt, erlaube
      if (originDomainChain === apiDomainChain) {
        console.log('Same domain chain');
        return callback(null, true);
      }
    } catch (e) {
      // Bei URL-Parsing-Fehlern, erlaube nicht
    }

    // Fallback: Erlaube alle Origins in Entwicklung
    if (process.env.NODE_ENV === 'development') {
      console.log('Development');
      return callback(null, true);
    }

    console.log('CORS nicht erlaubt');
    callback(new Error('CORS nicht erlaubt'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.'
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(cookieSession(sessionConfig));

// Keycloak middleware
app.use(keycloak.middleware());

// Request logging
app.use(requestLogger);

// Preflight handler für OPTIONS requests
app.options('*', cors(corsOptions));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/tax', taxRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tax-data', taxDataRoutes);
app.use('/api/pdf', pdfRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint nicht gefunden',
    path: req.originalUrl
  });
});

// Error handling
app.use(errorHandler);

// Global error handlers für uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('🚨 UNCAUGHT EXCEPTION:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚨 UNHANDLED REJECTION:', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Steuer-Fair API Server läuft auf Port ${PORT}`);
  logger.info(`📊 Health Check: http://localhost:${PORT}/health`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM empfangen, Server wird beendet...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT empfangen, Server wird beendet...');
  process.exit(0);
});
