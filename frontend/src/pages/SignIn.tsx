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

  const inputClass = (field: keyof FormErrors) =>
    `w-80 px-3 py-3 text-sm bg-white/5 backdrop-blur-lg rounded-md text-white border shadow-md focus:outline-none transition duration-150 ${
      errors[field]
        ? "border-red-400/70"
        : "border-white/5 focus:border-white/50"
    }`;

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden">
      <img src={evergoteImg} className="w-full h-full z-0 object-cover" />
      <div className="w-full h-full absolute flex p-4 items-center justify-center">
        <div className="flex flex-col py-8 px-8 gap-2 items-center justify-center border-t-[1.5px] border-[0.5px] border-gray-100/20 bg-gray-400/5 rounded-3xl backdrop-blur-2xl">
          <div className="form-container flex flex-col items-baseline justify-center gap-4">
            <p className="text-gray-200 font-medium text-xl mb-2">
              Welcome back
            </p>

            {apiError && (
              <div className="w-80 px-3 py-2 rounded-md bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
                {apiError}
              </div>
            )}

            <form
              className="flex flex-col gap-3 items-center"
              onSubmit={handleSignIn}
              noValidate
            >
              <div className="flex flex-col gap-1">
                <input
                  className={inputClass("email")}
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <input
                  className={inputClass("password")}
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-80 bg-stone-50 text-black text-base font-medium px-12 py-2 rounded-md hover:bg-stone-100 transition duration-150 mt-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                initial={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: false, duration: 0.15, damping: 1 }}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </motion.button>

              <p className="text-gray-400 text-sm mt-1">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-gray-200 hover:text-white transition duration-150"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SigninPage;
