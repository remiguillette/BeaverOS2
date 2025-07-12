// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        name: string;
        id: number;
        email?: string | null;
        department?: string | null;
        position?: string | null;
        accessLevel?: string | null;
      };
    }
  }
}

export {};