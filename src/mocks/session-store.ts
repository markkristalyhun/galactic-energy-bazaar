
interface Session {
  userId: string;
  username: string;
  csrfToken: string;
  authToken: string;
  createdAt: number;
}

class SessionStore {
  private readonly sessions = new Map<string, Session>(); // authToken -> Session

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

    // Use authToken as the key
    this.sessions.set(authToken, session);

    return session;
  }

  getSessionByAuthToken(authToken: string): Session | undefined {
    return this.sessions.get(authToken);
  }

  deleteSession(authToken: string): void {
    this.sessions.delete(authToken);
  }

  private generateToken(): string {
    return btoa(Math.random().toString(36) + Date.now().toString(36));
  }
}

export const sessionStore = new SessionStore();
