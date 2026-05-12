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

  const apiClient = useApiClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim() || firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegx.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    const { missing } = getPasswordStrength(formData.password);

    if (missing.length > 0) {
      newErrors.password = `Password requires: ${missing.join(", ")}`;
    }

    if (formData.password != confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { score } = getPasswordStrength(formData.password);
  const strengthColors = ["", "#E24B4A", "#EF9F27", "#639922", "#1D9E75"];
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
      if (res.status == 200) {
        updateUser({
          name: res.data.name,
          email: res.data.email,
          createdAt: res.data.createdAt,
        });
        console.log("Signup success: ", res.data);
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
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-3 py-3 text-sm bg-white/5 backdrop-blur-lg rounded-md text-white border shadow-md focus:outline-none transition duration-150 ${
      errors[field]
        ? "border-red-400/70 focus:border-red-400"
        : "border-white/5 focus:border-white/50"
    }`;
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden">
      <img src={evergoteImg} className="w-full h-full z-0 object-cover" />
      <div className="w-full h-full absolute flex p-4 items-center justify-center">
        <div className="flex flex-col py-8 px-8 gap-2 items-center justify-center border-t-[1.5px] border-[0.5px] border-gray-100/20 bg-gray-400/5 rounded-3xl backdrop-blur-2xl">
          <div className="form-container flex flex-col items-baseline justify-center gap-4">
            <p className="text-gray-200 font-medium text-xl mb-2">
              Create an account
            </p>

            {apiError && (
              <div className="w-80 px-3 py-2 rounded-md bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
                {apiError}
              </div>
            )}

            <form
              className="flex flex-col gap-3 items-center justify-center rounded-lg"
              onSubmit={handleSignUp}
              noValidate
            >
              {/* name row */}

              <div className="w-full flex flex-col gap-1">
                <input
                  className="w-full px-3 py-3 text-sm bg-white/5 backdrop-blur-lg rounded-md text-white border border-white/5 shadow-md focus:outline-none"
                  type="text"
                  placeholder="Name *"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setErrors((p) => ({ ...p, firstName: undefined }));
                  }}
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs">{errors.firstName}</p>
                )}
              </div>

              {/* email */}
              <div className="flex flex-col gap-1 w-80">
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

              {/* password */}
              <div className="flex flex-col gap-1 w-80">
                <input
                  className={inputClass("password")}
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formData.password && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-[3px] flex-1 rounded-full transition-all duration-200"
                          style={{
                            background:
                              i <= score
                                ? strengthColors[score]
                                : "rgba(255,255,255,0.1)",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: strengthColors[score] }}
                    >
                      {strengthLabels[score]}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password}</p>
                )}
              </div>

              {/* confirm password */}
              <div className="flex flex-col gap-1 w-80">
                <input
                  className={inputClass("confirmPassword")}
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs">
                    {errors.confirmPassword}
                  </p>
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
                {isLoading ? "Creating account..." : "Create an account"}
              </motion.button>
              <p className="text-gray-400 text-sm mt-1">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-gray-200 hover:text-white transition duration-150"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
