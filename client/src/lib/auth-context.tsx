import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  username: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem("admin_token");
    const username = localStorage.getItem("admin_username");

    if (token && username) {
      setUser({ username, token });
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();

    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_username", data.username);

    setUser({ username: data.username, token: data.token });
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper to get auth headers for API calls
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
