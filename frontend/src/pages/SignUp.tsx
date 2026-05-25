import { useState } from "react";
import { useApiClient } from "../utils/ApiClient";
import evergoteImg from "../assets/evergote-main.jpg";
import * as motion from "motion/react-client";
import { useAuth } from "../context/AuthContext";
import { getPasswordStrength } from "../utils/SignUp";
import axios from "axios";
import { Link } from "react-router-dom";

interface FormErrors {
  firstName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function SignupPage() {
  const { updateUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const apiClient = useApiClient();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!firstName.trim() || firstName.trim().length < 2)
      newErrors.firstName = "First name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    const { missing } = getPasswordStrength(formData.password);
    if (missing.length > 0)
      newErrors.password = `Password requires: ${missing.join(", ")}`;
    if (formData.password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { score } = getPasswordStrength(formData.password);
  const strengthColors = ["", "#c07060", "#c8943a", "#7a9e50", "#4a9e80"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.id]: undefined }));
    setApiError("");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiClient.post("/api/signup", {
        name: firstName.trim(),
        email: formData.email,
        password: formData.password,
      });
      if (res.status === 200) {
        updateUser({
          name: res.data.name,
          email: res.data.email,
          createdAt: res.data.createdAt,
        });
      }
      const userData = JSON.parse(res.data);
      localStorage.setItem("authenticated_user", userData.name);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ??
            err.message ??
            "Signup failed. Please try again.",
        );
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: keyof FormErrors, id?: string) =>
    [
      "w-full px-3 py-2.5 rounded-lg text-sm bg-white/[0.03] outline-none transition-colors duration-150",
      "font-['Satoshi-Variable'] text-neutral-300 placeholder:text-neutral-700 caret-amber-700",
      errors[field]
        ? "border border-red-900/60"
        : focusedField === (id ?? field)
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
            Create an account
          </h1>
          <p className="font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
            Start writing today
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
          className="flex flex-col gap-3"
          onSubmit={handleSignUp}
          noValidate
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-['Geist_Mono'] text-[10px] tracking-widest uppercase text-neutral-600">
              Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrors((p) => ({ ...p, firstName: undefined }));
                setApiError("");
              }}
              onFocus={() => setFocusedField("firstName")}
              onBlur={() => setFocusedField(null)}
              className={inputCls("firstName", "firstName")}
              autoComplete="given-name"
            />
            {errors.firstName && (
              <motion.p
                className="font-['Geist_Mono'] text-[10px] tracking-wide text-red-400/70"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.firstName}
              </motion.p>
            )}
          </div>

          {/* Email */}
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

          {/* Password */}
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
              autoComplete="new-password"
            />
            {/* Strength meter */}
            {formData.password && (
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
                setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              className={inputCls("confirmPassword", "confirmPassword")}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <motion.p
                className="font-['Geist_Mono'] text-[10px] tracking-wide text-red-400/70"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.confirmPassword}
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
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </motion.button>
        </form>

        <p className="text-center font-['Geist_Mono'] text-[11px] tracking-wide text-neutral-700">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-neutral-500 hover:text-amber-700 transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default SignupPage;
