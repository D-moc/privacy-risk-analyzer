import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      return toast.error("Please enter your email");
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });

      setSent(true);

      toast.success("Password reset email sent 📩");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
        return;
      }

      if (error.code === "auth/invalid-email") {
        toast.error("Please enter a valid email.");
        return;
      }

      if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
        return;
      }

      toast.error(error.message || "Failed to send reset email");
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
      >
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white rounded-[10px] border border-slate-200 shadow-2xl p-10"
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-600 font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Login
        </button>

        {!sent ? (
          <>
            <div className="text-center mb-7">
              {/* Icon */}
              <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-4">
                <Mail size={22} className="text-cyan-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Forgot Password
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <div className="mb-6">
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
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  placeholder="you@example.com"
                  className="w-full h-11 border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
                />
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.01] transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-slate-400 mt-5 text-xs">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </>
        ) : (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4"
          >
            <div className="mx-auto w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center mb-5">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Check your inbox
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-1">
              We sent a password reset link to
            </p>
            <p className="text-cyan-600 font-semibold text-sm mb-6">{email}</p>
            <p className="text-slate-400 text-xs mb-6">
              Click the link in the email to reset your password. If you don't
              see it, check your spam folder.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-xs text-slate-500 hover:text-cyan-600 font-medium underline mr-4"
            >
              Try a different email
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-xs text-cyan-600 font-semibold hover:underline"
            >
              Back to Login →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
