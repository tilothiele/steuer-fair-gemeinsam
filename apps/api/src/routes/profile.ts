import { Router } from 'express';
import { logger } from '../utils/logger';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { UserRepository } from '../repositories/user-repository';

const router = Router();

// Debug-Route für Token-Testing
router.get('/debug/token', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
      message: 'Token ist gültig'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Token-Debug fehlgeschlagen'
    });
  }
});

// Profil speichern (temporär ohne strenge Authentifizierung für Debugging)
router.put('/:loginId', async (req, res) => {
  try {
    const { loginId } = req.params;
    const { name, steuernummer } = req.body;

    // Validiere Eingabedaten
    if (!name && !steuernummer) {
      return res.status(400).json({
        success: false,
        error: 'Name oder Steuernummer muss angegeben werden'
      });
    }

    // Temporär deaktiviert für Debugging
    // TODO: Reaktivieren nach Token-Validierung-Fix
    /*
    if (req.user && req.user.id !== loginId && req.user.name !== loginId) {
      return res.status(403).json({
        success: false,
        error: 'Sie können nur Ihr eigenes Profil bearbeiten'
      });
    }
    */

    // Profil speichern oder aktualisieren
    let currentUser;
    
    // Prüfe ob Benutzer bereits existiert
    const existingUser = await UserRepository.findByLoginId(loginId);
    
    if (existingUser) {
      // Aktualisiere bestehenden Benutzer
      currentUser = await UserRepository.update({
        ...existingUser,
        name: name || existingUser.name,
        steuernummer: steuernummer || existingUser.steuernummer
      });
    } else {
      // Erstelle neuen Benutzer
      currentUser = await UserRepository.create({
        loginId,
        name: name || '',
        steuernummer: steuernummer || ''
      });
    }

    logger.info('Profil erfolgreich aktualisiert', { loginId, name, steuernummer });

    res.json({
      success: true,
      user: currentUser
    });
  } catch (error) {
    logger.error('Fehler beim Aktualisieren des Profils:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Server-Fehler',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

// Profil laden
router.get('/:loginId', async (req, res) => {
  try {
    const { loginId } = req.params;

    // Profil aus Datenbank laden
    const user = await UserRepository.findByLoginId(loginId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Profil nicht gefunden'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Fehler beim Laden des Profils:', error);
    res.status(500).json({
      success: false,
      error: 'Interner Server-Fehler',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

export { router as profileRoutes };
