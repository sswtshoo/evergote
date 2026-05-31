import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as motion from "motion/react-client";
import { useAuth } from "../context/AuthContext";
import evergoteImg from "../assets/evergote-main.jpg";
import axios from "axios";

interface FormErrors {
  email?: string;
  password?: string;
}

function SigninPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.id]: undefined }));
    setApiError("");
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError("");
    try {
      await login(formData.email, formData.password);
      navigate("/home");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ?? err.message ?? "Sign in failed.",
        );
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Sign in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: keyof FormErrors) =>
    [
      "w-full px-3 py-2.5 rounded-lg text-sm bg-white/[0.03] outline-none transition-colors duration-150",
      "font-['Satoshi-Variable'] text-neutral-300 placeholder:text-neutral-700 caret-amber-700",
      errors[field]
        ? "border border-red-900/60"
        : focusedField === field
          ? "border border-neutral-700"
          : "border border-neutral-900",
    ].join(" ");

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
        className="relative z-20 w-xl flex flex-col gap-5 px-8 py-9 rounded-2xl backdrop-blur-2xl bg-[#0b0a09]/80"
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
            Welcome back
          </h1>
          <p className="font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
            Sign in to continue writing
          </p>
        </div>

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
            {apiError}
          </motion.div>
        )}

        {/* Form */}
        <form
          className="flex flex-col gap-3.5"
          onSubmit={handleSignIn}
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
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={inputCls("email")}
              autoComplete="email"
            />
            {errors.email && (
              <motion.p
                className="font-['Geist_Mono'] text-[10px] tracking-wide text-red-400/70"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-['Geist_Mono'] text-[10px] tracking-widest uppercase text-neutral-600"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className={inputCls("password")}
              autoComplete="current-password"
            />
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
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="font-['Geist_Mono'] text-[10px] tracking-wide text-neutral-700 hover:text-amber-700 transition-colors duration-150"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="mt-1.5 w-full py-2.5 rounded-lg border border-neutral-800 bg-transparent font-['Geist_Mono'] text-[11px] font-medium tracking-[0.12em] uppercase text-amber-700 transition-colors duration-150 hover:bg-[#1a1612] hover:border-amber-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full border border-neutral-700 border-t-amber-700 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </motion.button>
        </form>

        <p className="text-center font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-neutral-500 hover:text-amber-700 transition-colors duration-150"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default SigninPage;
