import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, token: string) => void; // Token accept karega
  logout: () => void;
  isLoading: boolean; // Initial check ke liye
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check login status on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("userEmail");

    if (savedToken && savedEmail) {
      setIsAuthenticated(true);
      setUserEmail(savedEmail);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, token: string) => {
    localStorage.setItem("token", token); // Token save karein
    localStorage.setItem("userEmail", email); // Email save karein
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userEmail, login, logout, isLoading }}
    >
      {!isLoading && children}
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
