import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { renderMarkdown } from "../lib/markdown";

export default function FloatingAskAI({ chatLog, asking, onAsk }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    onAsk(value.trim());
    setValue("");
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute bottom-32 right-4 z-40 flex max-h-[300px] w-[270px] flex-col rounded-2xl border border-white/10 p-3 shadow-2xl"
            style={{ background: "#0f1523", boxShadow: "0 20px 50px -12px rgba(0,0,0,0.7)" }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-text-primary">Ask about this policy</span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-text-secondary hover:bg-white/10"
              >
                <X size={11} />
              </button>
            </div>

            {chatLog.length > 0 && (
              <div className="mb-2 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                {chatLog.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[88%] rounded-xl px-2.5 py-1.5 text-[10.5px] leading-snug ${
                      m.role === "user" ? "self-end text-white" : "self-start bg-white/6 text-text-secondary"
                    }`}
                    style={m.role === "user" ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" } : {}}
                    dangerouslySetInnerHTML={m.role === "ai" ? { __html: renderMarkdown(m.text) } : undefined}
                  >
                    {m.role === "user" ? m.text : undefined}
                  </div>
                ))}
                {asking && (
                  <div className="self-start rounded-xl bg-white/6 px-2.5 py-1.5 text-[10.5px] text-text-secondary">
                    Thinking…
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-1.5">
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="e.g. Do they sell my data?"
                className="min-w-0 flex-1 rounded-lg bg-white/6 px-2.5 py-2 text-[11px] text-text-primary placeholder:text-text-secondary/70 outline-none focus:ring-1 focus:ring-accent-indigo"
              />
              <button
                onClick={submit}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        className="absolute bottom-16 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          boxShadow: "0 8px 24px -6px rgba(99, 102, 241, 0.6)",
        }}
        aria-label="Ask AI about this policy"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X size={19} /> : <MessageCircle size={19} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
