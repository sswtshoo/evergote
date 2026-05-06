import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

type RequireGuestProps = {
  children: ReactNode;
};

export default function RequireGuest({ children }: RequireGuestProps) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoggedIn) {
    return <Navigate to="/app" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
