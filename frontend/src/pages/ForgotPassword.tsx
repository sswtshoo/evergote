import { useState } from "react";
import { Link } from "react-router-dom";
import * as motion from "motion/react-client";
import { apiClient } from "../utils/ApiClient";
import evergoteImg from "../assets/evergote-main.jpg";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await apiClient.post("/api/forgot-password", { email });
      setSubmitted(true);
    } catch {
      // Show success regardless — don't leak whether email exists
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

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
            Forgot password
          </h1>
          <p className="font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
            {submitted
              ? "Check your inbox"
              : "We'll send a reset link to your email"}
          </p>
        </div>

        {/* Confirmation state */}
        {submitted ? (
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-700 shrink-0 mt-px"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <p className="font-['Geist_Mono'] text-[11px] text-amber-700/80 leading-relaxed">
                If an account exists for{" "}
                <span className="text-amber-700">{email}</span>, a reset link is
                on its way. Check your spam folder too.
              </p>
            </div>

            <Link
              to="/signin"
              className="text-center font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-600 hover:text-amber-700 transition-colors duration-150"
            >
              ← Back to sign in
            </Link>
          </motion.div>
        ) : (
          /* Form state */
          <form
            className="flex flex-col gap-3.5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="font-['Geist_Mono'] text-[10px] tracking-widest uppercase text-neutral-600"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete="email"
                className={[
                  "w-full px-3 py-2.5 rounded-lg text-sm bg-white/3 outline-none transition-colors duration-150",
                  "font-['Satoshi-Variable'] text-neutral-300 placeholder:text-neutral-700 caret-amber-700",
                  error
                    ? "border border-red-900/60"
                    : focused
                      ? "border border-neutral-700"
                      : "border border-neutral-900",
                ].join(" ")}
              />
              {error && (
                <motion.p
                  className="font-['Geist_Mono'] text-[10px] tracking-wide text-red-400/70"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full py-2.5 rounded-lg border border-neutral-800 bg-transparent font-['Geist_Mono'] text-[11px] font-medium tracking-[0.12em] uppercase text-amber-700 transition-colors duration-150 hover:bg-[#1a1612] hover:border-amber-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full border border-neutral-700 border-t-amber-700 animate-spin" />
                  Sending…
                </span>
              ) : (
                "Send reset link"
              )}
            </motion.button>

            <p className="text-center font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
              <Link
                to="/signin"
                className="text-neutral-500 hover:text-amber-700 transition-colors duration-150"
              >
                ← Back to sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
