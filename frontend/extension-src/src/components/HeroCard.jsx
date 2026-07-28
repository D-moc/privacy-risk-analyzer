import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

export default function HeroCard({ onAnalyze }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-4 flex flex-1 flex-col items-center justify-center rounded-3xl glass px-6 py-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          boxShadow: "0 12px 30px -8px rgba(99, 102, 241, 0.55)",
        }}
      >
        <Fingerprint size={30} className="text-white" strokeWidth={1.75} />
      </motion.div>

      <h2 className="mb-1.5 text-[15px] font-semibold text-text-primary">
        Investigate this site's privacy policy
      </h2>
      <p className="mb-6 max-w-[260px] text-[12px] leading-relaxed text-text-secondary">
        Uncover its privacy score, key concerns, and hidden clues — in seconds.
      </p>

      <motion.button
        whileHover={{ scale: 1.03, boxShadow: "0 14px 32px -8px rgba(99,102,241,0.65)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onAnalyze}
        className="w-full rounded-2xl px-5 py-3 text-[13px] font-semibold text-white"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          boxShadow: "0 10px 26px -8px rgba(99, 102, 241, 0.55)",
        }}
      >
        Start Investigation
      </motion.button>
    </motion.div>
  );
}
