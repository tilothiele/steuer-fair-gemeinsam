import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Bestimme Status Code
  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;

  // Detailliertes Error Logging
  const errorLog = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: statusCode,
    isServerError: isServerError,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  };

  // Server-Fehler (500+) immer als ERROR loggen
  if (isServerError) {
    logger.error('🚨 SERVER ERROR:', errorLog);

    // Zusätzliche Details für Server-Fehler
    logger.error('Request Details:', {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: {
        authorization: req.headers.authorization ? 'present' : 'missing',
        'content-type': req.headers['content-type'],
        origin: req.headers.origin
      }
    });
  } else {
    // Client-Fehler (400-499) als WARN loggen
    logger.warn('⚠️ CLIENT ERROR:', errorLog);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const message = 'Validierungsfehler';
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      error: message,
      details
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Ungültige Ressource ID';
    error = { ...error, message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Doppelter Wert für ein eindeutiges Feld';
    error = { ...error, message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validierungsfehler';
    error = { ...error, message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Fehler',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
