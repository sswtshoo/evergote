import { createContext, useContext } from "react";

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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
