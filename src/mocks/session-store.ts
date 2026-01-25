
interface Session {
  userId: string;
  username: string;
  csrfToken: string;
  authToken: string;
  createdAt: number;
}

class SessionStore {
  private readonly STORAGE_KEY = 'msw_sessions';

  constructor() {
    // Load sessions from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage(): Map<string, Session> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const sessionsArray = JSON.parse(stored) as [string, Session][];
        return new Map(sessionsArray);
      }
    } catch (error) {
      console.warn('Failed to load sessions from localStorage:', error);
    }
    return new Map();
  }

  private saveToStorage(sessions: Map<string, Session>): void {
    try {
      const sessionsArray = Array.from(sessions.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionsArray));
    } catch (error) {
      console.warn('Failed to save sessions to localStorage:', error);
    }
  }

  createSession(userId: string, username: string): Session {
    const csrfToken = this.generateToken();
    const authToken = this.generateToken();

    const session: Session = {
      userId,
      username,
      csrfToken,
      authToken,
      createdAt: Date.now()
    };

    const sessions = this.loadFromStorage();
    sessions.set(authToken, session);
    this.saveToStorage(sessions);

    return session;
  }

  getSessionByAuthToken(authToken: string): Session | undefined {
    const sessions = this.loadFromStorage();
    return sessions.get(authToken);
  }

  deleteSession(authToken: string): void {
    const sessions = this.loadFromStorage();
    sessions.delete(authToken);
    this.saveToStorage(sessions);
  }

  private generateToken(): string {
    return btoa(Math.random().toString(36) + Date.now().toString(36));
  }
}

export const sessionStore = new SessionStore();
