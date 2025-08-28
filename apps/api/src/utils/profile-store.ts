import { User } from '@steuer-fair/shared';

// Einfache In-Memory-Speicherung für Benutzerprofile
const profileStore = new Map<string, User>();

export class ProfileStore {
  static async findByLoginId(loginId: string): Promise<User | null> {
    return profileStore.get(loginId) || null;
  }

  static async create(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      loginId: user.loginId,
      name: user.name || 'Unbekannter Benutzer',
      steuernummer: user.steuernummer,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    profileStore.set(user.loginId, newUser);
    return newUser;
  }

  static async update(user: User): Promise<User> {
    const updatedUser: User = {
      ...user,
      lastLogin: new Date()
    };
    
    profileStore.set(user.loginId, updatedUser);
    return updatedUser;
  }

  static async saveOrUpdate(loginId: string, name?: string, steuernummer?: string): Promise<User> {
    let user = await this.findByLoginId(loginId);
    
    if (!user) {
      // Benutzer existiert nicht - erstelle einen neuen
      user = await this.create({
        loginId,
        name,
        steuernummer
      });
    } else {
      // Profil aktualisieren
      user = await this.update({
        ...user,
        name: name || user.name,
        steuernummer: steuernummer || user.steuernummer
      });
    }
    
    return user;
  }
}
