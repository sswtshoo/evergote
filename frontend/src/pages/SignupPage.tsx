import { useState } from "react";
import { useApiClient } from "../utils/ApiClient";
import evergoteImg from "../assets/evergote-main.jpg";
import * as motion from "motion/react-client";
import { useAuth } from "../context/AuthContext";

function SignupPage() {
  const { updateUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };
  const apiClient = useApiClient();
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: `${firstName} ${lastName}`.trim(),
      email: formData.email,
      password: formData.password,
    };
    try {
      const res = await apiClient.post("/api/signup", data);
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
      // if (res.status == 200) {
      // }
    } catch (err) {
      console.log("Signup failed: ", err);
    }
  };
  return (
    <>
      <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden">
        <img src={evergoteImg} className="w-full h-full z-0 object-cover" />
        <div className="w-full h-full absolute flex p-4 items-center justify-center">
          <div className="flex flex-col py-8 px-8 gap-2 items-center justify-center border-t-[1.5px] border-[0.5px] border-gray-100/20 bg-gray-400/5 rounded-3xl backdrop-blur-2xl">
            <div className="form-container flex flex-col items-baseline justify-center gap-4">
              <p className="text-gray-200 font-medium text-xl mb-2">
                Create an account
              </p>
              <form className="flex flex-col gap-4 items-center justify-center rounded-lg">
                <div className="form-name flex flex-row justify-items-end gap-x-5">
                  <input
                    className="w-[150px] px-3 py-3 text-sm bg-white/5 backdrop-blur-lg rounded-md text-white border border-white/5 shadow-md focus:border-b focus:border-b-white/50 focus:outline-none"
                    type="text"
                    id="first_name"
                    placeholder="First Name"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    required
                  />
                  <input
                    className="w-[150px] px-3 py-3 text-sm bg-white/5 backdrop-blur-lg rounded-md text-white border border-white/5 shadow-md  focus:outline-none"
                    type="text"
                    id="last_name"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={handleLastNameChange}
                  />
                </div>
                <div className="form-email flex flex-col items-baseline justify-center gap-y-1">
                  <input
                    className="w-80 px-3 py-3 text-sm bg-white/5 backdrop-blur-lg rounded-md text-white border border-white/5 shadow-md  focus:outline-none"
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-password flex flex-col items-baseline justify-center gap-y-1">
                  <input
                    className="w-80 px-3 py-3 text-sm bg-white/5 backdrop-blur-lg rounded-md text-white border border-white/5 shadow-md  focus:outline-none"
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <motion.button
                    className="w-80 bg-stone-50 text-black text-base font-medium px-12 py-2 rounded-md hover:bg-stone-100 transition duration-150 mt-4 hover:cursor-pointer"
                    onClick={handleSignUp}
                    initial={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: false, duration: 0.15, damping: 1 }}
                  >
                    Create an account
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
          {/* <div className="w-3/5 bg-white/0"></div> */}
        </div>
      </div>
    </>
  );
}

export default SignupPage;
