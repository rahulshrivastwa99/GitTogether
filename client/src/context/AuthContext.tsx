import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 1. Define User Structure
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  exp?: number;
}

// 2. ✅ Update Interface to include BOTH user AND userEmail
interface AuthContextType {
  token: string | null;
  user: User | null;
  userEmail: string | null; // <--- ADDED THIS LINE BACK TO FIX THE ERROR
  isOnboarded: boolean;
  isAuthenticated: boolean;
  login: (token: string, email: string, onboarded: boolean) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode Token
const parseJwt = (token: string): User | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse token", e);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? parseJwt(storedToken) : null;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(
    localStorage.getItem("isOnboarded") === "true"
  );

  useEffect(() => {
    if (token) {
      setUser(parseJwt(token));
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string, email: string, onboarded: boolean) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("isOnboarded", String(onboarded));

    setToken(newToken);
    setIsOnboarded(onboarded);
    setUser(parseJwt(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isOnboarded");

    setToken(null);
    setUser(null);
    setIsOnboarded(false);
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem("isOnboarded", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        userEmail: user?.email || null, // ✅ Now this is allowed because it's in the interface
        isOnboarded,
        isAuthenticated: !!token,
        login,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
