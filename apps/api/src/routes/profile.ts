import { Router } from 'express';
import { UserRepository } from '../repositories/user-repository';
import { logger } from '../utils/logger';

const router = Router();

// Profil speichern
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

    // Aktuelles Profil laden oder erstellen
    let currentUser = await UserRepository.findByLoginId(loginId);
    
    if (!currentUser) {
      // Benutzer existiert nicht - erstelle einen neuen
      currentUser = await UserRepository.create({
        loginId: loginId,
        name: name || undefined,
        steuernummer: steuernummer || undefined
      });
    } else {
      // Profil aktualisieren
      currentUser = await UserRepository.update({
        ...currentUser,
        name: name || currentUser.name,
        steuernummer: steuernummer || currentUser.steuernummer
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
      error: 'Interner Server-Fehler'
    });
  }
});

export { router as profileRoutes };
