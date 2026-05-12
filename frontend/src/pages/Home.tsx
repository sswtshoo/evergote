import { useNavigate } from "react-router-dom";
import * as motion from "motion/react-client";
import { useAuth } from "../context/AuthContext";
import evergoteImg from "../assets/evergote-main.jpg";

function HomePage() {
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/signin");
  };

  const firstName = authUser?.name?.split(" ")[0] ?? "there";

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden">
      <img src={evergoteImg} className="w-full h-full z-0 object-cover" />
      <div className="w-full h-full absolute flex p-4 items-center justify-center">
        <motion.div
          className="flex flex-col py-10 px-10 gap-6 items-center justify-center border-t-[1.5px] border-[0.5px] border-gray-100/20 bg-gray-400/5 rounded-3xl backdrop-blur-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-gray-400 text-sm tracking-wide uppercase">
              Welcome
            </p>
            <h1 className="text-white font-medium text-3xl">
              Hey, {firstName} 👋
            </h1>
            {authUser?.email && (
              <p className="text-gray-400 text-sm">{authUser.email}</p>
            )}
          </div>

          <div className="w-full border-t border-white/10" />

          {authUser?.createdAt && (
            <p className="text-gray-400 text-sm">
              Member since{" "}
              <span className="text-gray-200">
                {new Date(authUser.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          )}

          <motion.button
            onClick={handleSignOut}
            className="mt-2 px-8 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-md hover:bg-white/5 hover:text-white transition duration-150 hover:cursor-pointer"
            initial={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: false, duration: 0.15 }}
          >
            Sign out
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;
