import axios from "axios";
import type { ReactNode } from "react";
import { useState, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthUser } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("authenticated_user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // const serverUrl = import.meta.env.VITE_SERVER_URL;

  const updateUser = useCallback((user: AuthUser) => {
    localStorage.setItem("authenticated_user", JSON.stringify(user));
    setAuthUser(user);
    setIsLoggedIn(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await axios.post("/api/login", {
        email,
        password,
      });
      const user = {
        email: response.data.email,
        name: response.data.name,
        createdAt: response.data.created_at,
      };
      updateUser(user);
    },
    [updateUser],
  );

  const logout = useCallback(async () => {
    try {
      await axios.post("/api/logout");
      localStorage.removeItem("authenticated_user");
      setIsLoggedIn(false);
      setAuthUser(null);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const value = useMemo(
    () => ({
      login,
      logout,
      isLoggedIn,
      authUser,
      updateUser,
    }),
    [login, logout, isLoggedIn, authUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
