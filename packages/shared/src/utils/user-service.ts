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
        loginId: 'maxmustermann',
        name: 'Max Mustermann',
        steuernummer: '12345678901',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      },
      {
        id: '2',
        loginId: 'mariaschmidt',
        name: 'Maria Schmidt',
        steuernummer: '98765432109',
        createdAt: new Date('2024-01-02'),
        lastLogin: new Date()
      },
      {
        id: '3',
        loginId: 'testuser123',
        name: 'Test User',
        steuernummer: '11122233344',
        createdAt: new Date('2024-01-03'),
        lastLogin: new Date()
      },
      {
        id: '4',
        loginId: 'user@example.com',
        name: 'Demo User',
        steuernummer: '55566677788',
        createdAt: new Date('2024-01-04'),
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

    // Validiere Login-ID Format
    if (loginId.length < 8) {
      return {
        success: false,
        error: 'Login-ID muss mindestens 8 Zeichen lang sein'
      };
    }

    // Prüfe ob alphanumerisch oder gültige E-Mail
    const alphanumericPattern = /^[a-zA-Z0-9]{8,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!alphanumericPattern.test(loginId) && !emailPattern.test(loginId)) {
      return {
        success: false,
        error: 'Login-ID muss alphanumerisch (mindestens 8 Zeichen) oder eine gültige E-Mail-Adresse sein'
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
