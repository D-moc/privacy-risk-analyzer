import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext"; // 🔥 ADD

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // 🔥 ADD

  // 🔥 SIGNUP WITH FASTAPI
  const handleSignup = async () => {
    if (!email || !password) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      // ✅ CREATE USER
      await API.post("/auth/signup", {
        email,
        password,
      });

      // 🔥 AUTO LOGIN AFTER SIGNUP
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // ✅ STORE TOKEN + USER
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", email);

      // 🔥 UPDATE CONTEXT (IMPORTANT)
      setUser({ email });

      toast.success("Account created & logged in 🎉");

      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f2]">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        <p className="text-gray-500 text-center mt-2">
          Start using PrivacyLens
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="w-full border p-3 rounded mb-4 focus:border-green-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <div className="relative mb-4">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            className="w-full border p-3 rounded focus:border-green-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* SIGNUP BUTTON */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* FOOTER */}
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Signup;