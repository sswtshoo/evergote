import axios from "axios";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export type AuthUser = {
  email: string;
  name: string;
  createdAt: string;
};

type AuthContextValue = {
  authUser: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthInitialized: boolean;
  updateUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const login = async (email: string, password: string) => {
    const response = await axios.post(`${serverUrl}/api/login`, {
      email,
      password,
    });
    const user = {
      email: response.data.email,
      name: response.data.name,
      createdAt: response.data.created_at,
    };
    updateUser(user);
    setAuthUser(user);
  };

  const updateUser = (user: AuthUser) => {
    localStorage.setItem("authenticated_user", JSON.stringify(user));
    setAuthUser(user);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await axios.post("/api/logout");
      localStorage.removeItem("authenticated_user");
      setIsLoggedIn(false);
      setAuthUser(null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("authenticated_user");

    if (storedUser) {
      setAuthUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setIsAuthInitialized(true);
  }, []);

  const value = {
    login,
    logout,
    isLoggedIn,
    authUser,
    isAuthInitialized,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
