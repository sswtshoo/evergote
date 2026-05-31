import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignUp.tsx";
import SigninPage from "./pages/SignIn.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import ResetPasswordPage from "./pages/ResetPassword.tsx";
import RequireAuth from "./utils/RequireAuth.tsx";
import RequireGuest from "./utils/RequireGuest.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <div className="min-h-screen min-w-screen p-0">
        <BrowserRouter>
          <Routes>
            <Route
              path="/signin"
              element={
                <RequireGuest>
                  <SigninPage />
                </RequireGuest>
              }
            />
            <Route
              path="/signup"
              element={
                <RequireGuest>
                  <SignupPage />
                </RequireGuest>
              }
            />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <App />
                </RequireAuth>
              }
            ></Route>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  </StrictMode>,
);

// bun run dev --port 3000
