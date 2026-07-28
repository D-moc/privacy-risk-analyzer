import { CheckCircle2 } from "lucide-react";

export default function AuthStrip({ auth, onSignIn }) {
  return (
    <div className="mx-4 mb-3 flex items-center justify-between rounded-xl bg-white/4 px-3 py-2">
      <span className="flex items-center gap-1.5 text-[10px] text-text-secondary">
        {auth && <CheckCircle2 size={11} className="text-success" />}
        {auth ? `Signed in as ${auth.email || "you"} · saved to history` : "Sign in to save scans"}
      </span>
      <button onClick={onSignIn} className="text-[10px] font-semibold text-accent-blue hover:underline">
        {auth ? "Dashboard" : "Sign in"}
      </button>
    </div>
  );
}
