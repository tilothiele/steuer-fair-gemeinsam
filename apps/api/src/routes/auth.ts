import { Router } from 'express';
import { UserService } from '@steuer-fair/shared';
import { LoginRequestSchema } from '@steuer-fair/shared';
import { UserRepository } from '../repositories/user-repository';
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
    
    // Prüfe ob Benutzer in der Datenbank existiert
    let user = await UserRepository.findByLoginId(validatedData.loginId);
    
    if (!user) {
      // Erstelle neuen Benutzer
      user = await UserRepository.create({
        loginId: validatedData.loginId,
        name: undefined,
        steuernummer: undefined
      });
    } else {
      // Aktualisiere last_login
      await UserRepository.updateLastLogin(user.id);
    }

    // Log erfolgreichen Login
    logger.info({
      message: 'Benutzer erfolgreich angemeldet',
      loginId: user.loginId,
      userId: user.id
    });

    res.json({
      success: true,
      user: user
    });
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
