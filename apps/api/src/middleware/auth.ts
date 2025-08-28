import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractUserFromToken } from '../config/keycloak';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Zugriffstoken fehlt'
      });
    }

    const verifiedToken = await verifyToken(token);
    const user = extractUserFromToken(verifiedToken);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Ungültiger Token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token-Validierungsfehler:', error);
    return res.status(401).json({
      success: false,
      error: 'Ungültiger oder abgelaufener Token'
    });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Nicht authentifiziert'
      });
    }

    if (!req.user.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Unzureichende Berechtigungen'
      });
    }

    next();
  };
};
