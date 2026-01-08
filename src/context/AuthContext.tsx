import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  isOnboarded: boolean; // <--- NEW TRACKER
  isAuthenticated: boolean;
  login: (token: string, email: string, onboarded: boolean) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    localStorage.getItem("userEmail")
  );
  // Check localStorage for onboarding status, default to false
  const [isOnboarded, setIsOnboarded] = useState<boolean>(
    localStorage.getItem("isOnboarded") === "true"
  );

  const login = (newToken: string, email: string, onboarded: boolean) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("isOnboarded", String(onboarded));

    setToken(newToken);
    setUserEmail(email);
    setIsOnboarded(onboarded);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isOnboarded");
    setToken(null);
    setUserEmail(null);
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
        userEmail,
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
