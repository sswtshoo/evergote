import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthInitialized, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isAuthInitialized) {
    return (
      <>
        <p>Initializing auth</p>
      </>
    );
  }
  if (!isLoggedIn) {
    return (
      <Navigate to="/signup" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}
