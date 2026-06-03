import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";

function Signup() {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/home", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const exchangeFirebaseToken = async (firebaseToken) => {
    const res = await API.post("/auth/firebase", { token: firebaseToken });
    const userData = {
      uid: res.data.uid,
      email: res.data.email,
      name: res.data.name,
      picture: res.data.picture,
    };
    localStorage.setItem("userEmail", res.data.email);

    localStorage.setItem("userName", res.data.name || "User");

    login(userData);

    navigate("/home", {
      replace: true,
    });
  };

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthText = ["Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-yellow-400",
    "bg-cyan-500",
    "bg-green-500",
  ];

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword)
      return toast.error("Please fill all fields");

    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    if (password.length < 8)
      return toast.error("Password must be at least 8 characters");

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const firebaseToken = await result.user.getIdToken();

      await exchangeFirebaseToken(firebaseToken);

      toast.success("Account Created 🎉");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        toast.error("Account already exists.");
        return;
      }

      if (error.code === "auth/weak-password") {
        toast.error("Password is too weak.");
        return;
      }

      if (error.code === "auth/invalid-email") {
        toast.error("Please enter a valid email.");
        return;
      }

      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();
      await exchangeFirebaseToken(firebaseToken);
      toast.success("Signup Successful!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Google Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden p-6">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute -left-40 top-0 h-full w-125 bg-cyan-300/25 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-full w-125 bg-blue-300/25 blur-[140px]" />
      </div>

      {/* Top-left branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-10 z-10"
      ></motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white rounded-[10px] border border-slate-200 shadow-2xl p-10"
      >
        <div className="text-center mb-7">
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Start protecting your privacy today
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full h-11 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition disabled:opacity-60 font-medium text-slate-700 text-sm shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-slate-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Email
          </label>
          <div className="relative mt-1.5">
            <Mail
              size={15}
              className="absolute left-3.5 top-3.25 text-slate-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock
              size={15}
              className="absolute left-3.5 top-3.25 text-slate-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 border border-slate-200 rounded-xl pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.25 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Strength */}
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-slate-400">
              Password strength
            </span>
            <span className="text-[11px] font-semibold text-cyan-600">
              {password ? strengthText[strength] : ""}
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  strength >= bar ? strengthColor[strength] : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-1.5 h-11 border border-slate-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
          />
        </div>

        {/* Create Account */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.01] transition disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center text-slate-400 mt-5 text-xs">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-cyan-600 font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default Signup;
