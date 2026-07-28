import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, FlaskConical, LayoutDashboard } from "lucide-react";

function AdminModelLab() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const runTest = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const token = localStorage.getItem("adminToken");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/ml-test`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Request failed — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">PrivacyLens — Model Lab</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manually test the trained models before deciding whether to integrate them
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="px-8 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={16} className="text-cyan-400" />
            <h2 className="font-semibold">Paste a policy clause or paragraph</h2>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="e.g. We may share your information with third-party advertisers and business partners..."
            className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={runTest}
            disabled={loading || !text.trim()}
            className="mt-4 px-5 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-400 transition disabled:opacity-50"
          >
            {loading ? "Running..." : "Run Test"}
          </button>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </motion.div>

        {result && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Model A */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <h3 className="font-semibold mb-1 text-sm">Model A — Practices (OPP-115)</h3>
              <p className="text-xs text-slate-500 mb-3">Trained classifier, not Groq</p>
              {result.practice_model_status ? (
                <p className="text-amber-400 text-sm">{result.practice_model_status}</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {result.practice_predictions.slice(0, 6).map((p) => (
                    <li key={p.category} className="flex justify-between">
                      <span className="text-slate-300">{p.category}</span>
                      <span
                        className={p.probability >= 0.5 ? "text-cyan-400 font-semibold" : "text-slate-500"}
                      >
                        {(p.probability * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Model B */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <h3 className="font-semibold mb-1 text-sm">Model B — Severity (ToS;DR)</h3>
              <p className="text-xs text-slate-500 mb-3">Trained classifier, not Groq</p>
              {result.severity_model_status ? (
                <p className="text-amber-400 text-sm">{result.severity_model_status}</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {result.severity_prediction.map((p) => (
                    <li key={p.severity} className="flex justify-between">
                      <span className="text-slate-300 capitalize">{p.severity}</span>
                      <span
                        className={
                          p.probability === Math.max(...result.severity_prediction.map((x) => x.probability))
                            ? "text-cyan-400 font-semibold"
                            : "text-slate-500"
                        }
                      >
                        {(p.probability * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Groq, for comparison */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <h3 className="font-semibold mb-1 text-sm">Groq (current pipeline)</h3>
              <p className="text-xs text-slate-500 mb-3">What the live app says today</p>
              {result.groq_findings.length === 0 ? (
                <p className="text-slate-500 text-sm">No findings returned</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {result.groq_findings.map((f, i) => (
                    <li key={i} className="border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
                      <p className="text-slate-200">{f.label}</p>
                      <p className="text-xs text-slate-500 capitalize">{f.severity}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminModelLab;
