import { useState, useEffect, createContext, useContext } from "react";

interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in from sessionStorage
    const savedCredentials = sessionStorage.getItem("beavernet-auth");
    if (savedCredentials) {
      const { username, password } = JSON.parse(savedCredentials);
      // Verify credentials with backend
      verifyAuth(username, password);
    }
  }, []);

  const verifyAuth = async (username: string, password: string) => {
    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch("/api/auth/me", {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        sessionStorage.setItem("beavernet-auth", JSON.stringify({ username, password }));
        return true;
      } else {
        setUser(null);
        sessionStorage.removeItem("beavernet-auth");
        return false;
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setUser(null);
      sessionStorage.removeItem("beavernet-auth");
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    return await verifyAuth(username, password);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("beavernet-auth");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
