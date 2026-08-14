import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { toast } from "react-toastify";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      return toast.error("Please fill both fields");
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/login`,
        { username, password }
      );

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      localStorage.setItem("adminToken", response.data.token);
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-8"
      >
        <div className="text-center mb-7">
          <h2 className="text-2xl font-bold text-white">Admin Access</h2>
          <p className="text-slate-400 mt-1 text-sm">Operator dashboard — not for regular users</p>
        </div>

        <div className="mb-4">
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-3.25 text-slate-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Username"
              className="w-full h-11 border border-slate-700 rounded-xl pl-10 pr-4 text-sm text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-3.25 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              className="w-full h-11 border border-slate-700 rounded-xl pl-10 pr-4 text-sm text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-400 transition disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
