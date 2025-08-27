import { User, LoginRequest, LoginResponse } from '../types/tax-models';

export class UserService {
  private static users: Map<string, User> = new Map();

  /**
   * Initialisiert einige Dummy-Benutzer
   */
  static initializeDummyUsers() {
    const dummyUsers: User[] = [
      {
        id: '1',
        loginId: 'max.mustermann',
        name: 'Max Mustermann',
        email: 'max@example.com',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      },
      {
        id: '2',
        loginId: 'maria.schmidt',
        name: 'Maria Schmidt',
        email: 'maria@example.com',
        createdAt: new Date('2024-01-02'),
        lastLogin: new Date()
      },
      {
        id: '3',
        loginId: 'test',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date('2024-01-03'),
        lastLogin: new Date()
      }
    ];

    dummyUsers.forEach(user => {
      this.users.set(user.loginId, user);
    });
  }

  /**
   * Authentifiziert einen Benutzer mit Login-ID
   */
  static login(loginRequest: LoginRequest): LoginResponse {
    const { loginId } = loginRequest;

    if (!loginId || loginId.trim() === '') {
      return {
        success: false,
        error: 'Login-ID ist erforderlich'
      };
    }

    // Prüfe ob Benutzer existiert
    let user = this.users.get(loginId);

    if (!user) {
      // Erstelle neuen Benutzer wenn nicht vorhanden
      user = {
        id: Date.now().toString(),
        loginId: loginId,
        name: loginId,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      this.users.set(loginId, user);
    } else {
      // Aktualisiere lastLogin
      user.lastLogin = new Date();
      this.users.set(loginId, user);
    }

    return {
      success: true,
      user: user
    };
  }

  /**
   * Holt einen Benutzer anhand der Login-ID
   */
  static getUserByLoginId(loginId: string): User | undefined {
    return this.users.get(loginId);
  }

  /**
   * Holt alle Benutzer (für Debugging)
   */
  static getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
}
