import { motion } from "framer-motion";
import { RefreshCw, Globe } from "lucide-react";

export default function SiteRow({ domain, favicon, status, onRescan, spinning }) {
  return (
    <div className="mx-4 mb-3 flex items-center gap-2.5 rounded-2xl px-3 py-2.5 glass">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg-tertiary">
        {favicon ? (
          <img src={favicon} alt="" className="h-4 w-4" />
        ) : (
          <Globe size={13} className="text-text-secondary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-text-primary">
          {domain || "Unknown page"}
        </p>
        <p className="text-[10px] text-text-secondary">{status}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRescan}
        className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-white/8 hover:text-text-primary transition-colors"
        aria-label="Re-scan"
      >
        <motion.span
          animate={spinning ? { rotate: 360 } : { rotate: 0 }}
          transition={spinning ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          className="flex"
        >
          <RefreshCw size={13} />
        </motion.span>
      </motion.button>
    </div>
  );
}
