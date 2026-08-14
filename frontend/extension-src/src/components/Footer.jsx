import { motion } from "framer-motion";
import { Download, ExternalLink, ScrollText, Sparkles } from "lucide-react";

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ago`;
}

export default function Footer({ analyzedAt, onDownload, onOpenDashboard, onOpenLedger }) {
  return (
    <div className="mx-4 mb-3">
      <div className="mb-2 flex gap-2">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDownload}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/6 py-2 text-[11px] font-medium text-text-primary hover:bg-white/10"
        >
          <Download size={12} />
          Download
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenDashboard}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/6 py-2 text-[11px] font-medium text-text-primary hover:bg-white/10"
        >
          <ExternalLink size={12} />
          Dashboard
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenLedger}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/6 py-2 text-[11px] font-medium text-text-primary hover:bg-white/10"
        >
          <ScrollText size={12} />
          Ledger
        </motion.button>
      </div>
      <div className="flex items-center justify-between px-0.5 text-[9.5px] text-text-secondary/70">
        <span>{analyzedAt ? `Case opened ${timeAgo(analyzedAt)}` : ""}</span>
        <span className="flex items-center gap-1">
          <Sparkles size={9} />
          AI Detective · v2.0.0
        </span>
      </div>
    </div>
  );
}
