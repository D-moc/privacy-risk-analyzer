import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ErrorState({ title, message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 flex flex-1 flex-col items-center justify-center rounded-3xl glass px-6 py-8 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/12 text-danger">
        <AlertTriangle size={26} />
      </div>
      <h2 className="mb-1.5 text-[14px] font-semibold text-text-primary">{title}</h2>
      <p className="mb-6 max-w-[260px] text-[11.5px] leading-relaxed text-text-secondary">{message}</p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="w-full rounded-2xl px-5 py-3 text-[13px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
      >
        Try Again
      </motion.button>
    </motion.div>
  );
}
