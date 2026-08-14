import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

export default function LoadingScreen({ message }) {
  return (
    <div className="mx-4 flex flex-1 flex-col items-center justify-center rounded-3xl glass px-6 py-8">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #6366F1, #8B5CF6, #3B82F6, #6366F1)",
            filter: "blur(1px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-[3px] rounded-full bg-bg-primary" />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          <Search size={20} className="text-white" />
        </motion.div>
      </div>

      <div className="mb-4 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6, #3B82F6)" }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="text-[12.5px] font-medium text-text-secondary"
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
