import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import * as motion from "motion/react-client";
import { apiClient } from "../utils/ApiClient";
import { getPasswordStrength } from "../utils/SignUp";
import evergoteImg from "../assets/evergote-main.jpg";
import axios from "axios";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { score } = getPasswordStrength(password);
  const strengthColors = ["", "#c07060", "#c8943a", "#7a9e50", "#4a9e80"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const validate = (): boolean => {
    const newErrors: { password?: string; confirm?: string } = {};
    const { missing } = getPasswordStrength(password);
    if (missing.length > 0)
      newErrors.password = `Password requires: ${missing.join(", ")}`;
    if (password !== confirmPassword)
      newErrors.confirm = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError("");
    try {
      await apiClient.post("/api/reset-password", {
        token,
        new_password: password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 2500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ??
            "Invalid or expired link. Please request a new one.",
        );
      } else {
        setApiError("Invalid or expired link. Please request a new one.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="h-screen w-screen bg-[#0a0908] flex items-center justify-center relative overflow-hidden">
        <img
          src={evergoteImg}
          className="absolute inset-0 w-full h-full object-cover opacity-35 saturate-60 z-0"
          alt=""
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, #0a0908 75%)",
          }}
        />
        <motion.div
          className="relative z-20 w-[340px] flex flex-col gap-5 px-8 py-9 rounded-2xl backdrop-blur-2xl bg-[#0b0a09]/80"
          style={{
            borderTop: "1px solid rgba(200,169,126,0.12)",
            borderLeft: "1px solid rgba(200,169,126,0.06)",
            borderRight: "1px solid rgba(0,0,0,0.4)",
            borderBottom: "1px solid rgba(0,0,0,0.5)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="font-['Geist_Mono'] text-[10px] tracking-[0.2em] uppercase text-amber-700 mb-1">
              notes
            </span>
            <h1 className="font-['Satoshi-Variable'] text-[22px] font-[450] text-neutral-200 leading-tight">
              Invalid link
            </h1>
            <p className="font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
              This reset link is missing or malformed.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="text-center font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-500 hover:text-amber-700 transition-colors duration-150"
          >
            Request a new link →
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0908] flex items-center justify-center relative overflow-hidden">
      <img
        src={evergoteImg}
        className="absolute inset-0 w-full h-full object-cover opacity-35 saturate-60 z-0"
        alt=""
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, #0a0908 75%)",
        }}
      />

      <motion.div
        className="relative z-20 w-[340px] flex flex-col gap-5 px-8 py-9 rounded-2xl backdrop-blur-2xl bg-[#0b0a09]/80"
        style={{
          borderTop: "1px solid rgba(200,169,126,0.12)",
          borderLeft: "1px solid rgba(200,169,126,0.06)",
          borderRight: "1px solid rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(0,0,0,0.5)",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <span className="font-['Geist_Mono'] text-[10px] tracking-[0.2em] uppercase text-amber-700 mb-1">
            notes
          </span>
          <h1 className="font-['Satoshi-Variable'] text-[22px] font-[450] text-neutral-200 leading-tight">
            Reset password
          </h1>
          <p className="font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
            {success ? "Password updated" : "Choose a new password"}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-amber-950/20 border border-amber-900/20">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-700 shrink-0 mt-px"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="font-['Geist_Mono'] text-[11px] text-amber-700/80 leading-relaxed">
                Your password has been updated. Redirecting you to sign in…
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* API error */}
            {apiError && (
              <motion.div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-950/30 border border-red-900/30 font-['Geist_Mono'] text-[11px] text-red-400/80 leading-relaxed"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0 mt-px"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 14a1 1 0 110-2 1 1 0 010 2zm1-4a1 1 0 01-2 0V8a1 1 0 012 0v4z" />
                </svg>
                <span>
                  {apiError}{" "}
                  {apiError.includes("expired") ||
                  apiError.includes("Invalid") ? (
                    <Link
                      to="/forgot-password"
                      className="underline text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      Request a new link
                    </Link>
                  ) : null}
                </span>
              </motion.div>
            )}

            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['Geist_Mono'] text-[10px] tracking-widest uppercase text-neutral-600">
                  New password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                  className={[
                    "w-full px-3 py-2.5 rounded-lg text-sm bg-white/3 outline-none transition-colors duration-150",
                    "font-['Satoshi-Variable'] text-neutral-300 placeholder:text-neutral-700 caret-amber-700",
                    errors.password
                      ? "border border-red-900/60"
                      : focusedField === "password"
                        ? "border border-neutral-700"
                        : "border border-neutral-900",
                  ].join(" ")}
                />
                {/* Strength meter */}
                {password && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-0.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background:
                              i <= score ? strengthColors[score] : "#1e1c1a",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="font-['Geist_Mono'] text-[10px] tracking-wide min-w-[34px] text-right"
                      style={{ color: strengthColors[score] }}
                    >
                      {strengthLabels[score]}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <motion.p
                    className="font-['Geist_Mono'] text-[10px] tracking-wide text-red-400/70"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['Geist_Mono'] text-[10px] tracking-widest uppercase text-neutral-600">
                  Confirm password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((p) => ({ ...p, confirm: undefined }));
                  }}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                  className={[
                    "w-full px-3 py-2.5 rounded-lg text-sm bg-white/3 outline-none transition-colors duration-150",
                    "font-['Satoshi-Variable'] text-neutral-300 placeholder:text-neutral-700 caret-amber-700",
                    errors.confirm
                      ? "border border-red-900/60"
                      : focusedField === "confirm"
                        ? "border border-neutral-700"
                        : "border border-neutral-900",
                  ].join(" ")}
                />
                {errors.confirm && (
                  <motion.p
                    className="font-['Geist_Mono'] text-[10px] tracking-wide text-red-400/70"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.confirm}
                  </motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-2.5 rounded-lg border border-neutral-800 bg-transparent font-['Geist_Mono'] text-[11px] font-medium tracking-[0.12em] uppercase text-amber-700 transition-colors duration-150 hover:bg-[#1a1612] hover:border-amber-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-neutral-700 border-t-amber-700 animate-spin" />
                    Updating…
                  </span>
                ) : (
                  "Update password"
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;
