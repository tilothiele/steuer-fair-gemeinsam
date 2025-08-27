import { Router } from 'express';
import { UserService } from '@steuer-fair/shared';
import { LoginRequestSchema } from '@steuer-fair/shared';
import { logger } from '../utils/logger';

const router = Router();

// Initialisiere Dummy-Benutzer beim Start
UserService.initializeDummyUsers();

/**
 * POST /api/auth/login
 * Login mit Login-ID (ohne Passwort)
 */
router.post('/login', async (req, res) => {
  try {
    // Validiere Request Body
    const validatedData = LoginRequestSchema.parse(req.body);
    
    // Führe Login durch
    const result = UserService.login(validatedData);

    if (result.success && result.user) {
      // Log erfolgreichen Login
      logger.info({
        message: 'Benutzer erfolgreich angemeldet',
        loginId: result.user.loginId,
        userId: result.user.id
      });

      res.json({
        success: true,
        user: result.user
      });
    } else {
      // Log fehlgeschlagenen Login
      logger.warn({
        message: 'Login fehlgeschlagen',
        loginId: validatedData.loginId,
        error: result.error
      });

      res.status(400).json({
        success: false,
        error: result.error || 'Login fehlgeschlagen'
      });
    }
  } catch (error) {
    logger.error({
      message: 'Fehler beim Login',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });

    res.status(500).json({
      success: false,
      error: 'Interner Server-Fehler'
    });
  }
});

/**
 * GET /api/auth/users
 * Holt alle Benutzer (nur für Debugging)
 */
router.get('/users', (req, res) => {
  try {
    const users = UserService.getAllUsers();
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    logger.error({
      message: 'Fehler beim Abrufen der Benutzer',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });

    res.status(500).json({
      success: false,
      error: 'Interner Server-Fehler'
    });
  }
});

export { router as authRoutes };
