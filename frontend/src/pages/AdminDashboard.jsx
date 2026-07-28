import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  Users,
  ScanLine,
  LogOut,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BadgeCheck,
  FlaskConical,
  Cpu,
  Download,
  UserCheck,
  XCircle,
  BarChart3,
} from "lucide-react";

const PIE_COLORS = ["#06b6d4", "#f59e0b", "#ef4444", "#22c55e", "#8b5cf6"];

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.error) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
        return;
      }

      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading admin analytics...
      </div>
    );
  }

  const sourceMixData = data
    ? Object.entries(data.source_mix).map(([name, value]) => ({ name, value }))
    : [];

  const surfaceSplitData = data
    ? Object.entries(data.surface_split || {}).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">PrivacyLens — Admin Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Cross-user platform data, operator view only</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/model-lab")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm"
          >
            <FlaskConical size={14} />
            Model Lab
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

      <main className="px-8 py-8 max-w-7xl mx-auto">
        {/* Executive summary — plain-English conclusions, not just charts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-cyan-400" />
            <h2 className="font-semibold text-cyan-100">Executive Summary</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-200">
            {data.executive_summary.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-cyan-400">•</span>
                {line}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ===================== USERS & GROWTH ===================== */}
        <SectionLabel icon={<UserCheck size={15} />} title="Users & Growth" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={<UserCheck size={20} />}
            label="Registered Users"
            value={data.total_registered_users ?? "—"}
          />
          <StatCard icon={<Download size={20} />} label="Extension Downloads" value={data.total_downloads} />
          <StatCard
            icon={<XCircle size={20} />}
            label="Scan Failure Rate"
            value={
              data.failure_rate.failure_rate_pct === null
                ? "—"
                : `${data.failure_rate.failure_rate_pct}%`
            }
          />
          <StatCard icon={<ScanLine size={20} />} label="Total Scan Attempts" value={data.failure_rate.total_attempts} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Extension vs website split */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-cyan-400" />
              <h2 className="font-semibold">Extension vs Website</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Where scan attempts actually come from — informs where to invest
              further dev effort.
            </p>
            {surfaceSplitData.length === 0 ? (
              <p className="text-slate-500 text-sm">No scan attempts logged yet</p>
            ) : (
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={surfaceSplitData} dataKey="value" nameKey="name" outerRadius={80} label>
                      {surfaceSplitData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Failure/rejection breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-red-400" />
              <h2 className="font-semibold">Scan Failures</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Attempts where no usable privacy policy was found — a
              NOT_A_POLICY rejection, a fetch failure, or a timeout. Only
              successful scans were ever tracked before this.
            </p>
            {data.failure_rate.total_attempts === 0 ? (
              <p className="text-slate-500 text-sm">No scan attempts logged yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-green-400">{data.failure_rate.succeeded}</p>
                  <p className="text-xs text-slate-500 mt-1">Succeeded</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-400">{data.failure_rate.failed}</p>
                  <p className="text-xs text-slate-500 mt-1">Failed / rejected</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ===================== ANALYTICS ===================== */}
        <SectionLabel icon={<BarChart3 size={15} />} title="Analytics" />

        {/* Top stat cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <StatCard icon={<ScanLine size={20} />} label="Total Scans" value={data.total_scans} />
          <StatCard icon={<Users size={20} />} label="Unique Users" value={data.unique_users} />
          <StatCard
            icon={<ShieldAlert size={20} />}
            label="Domains Never ToS;DR-Covered"
            value={data.coverage_gap.length}
          />
        </div>

        {/* Model cross-check — real production track record, not just the training-time test-set numbers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={16} className="text-cyan-400" />
            <h2 className="font-semibold">Model Cross-Check</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            How often our own trained severity model agrees with Groq on AI-sourced
            findings — the real-world track record of reducing reliance on Groq alone,
            not just the training-time test-set score.
          </p>
          {data.model_cross_check.agreement_rate === null ? (
            <p className="text-slate-500 text-sm">No AI-sourced findings checked yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-bold text-cyan-400">
                  {data.model_cross_check.agreement_rate}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Agreement rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-200">
                  {data.model_cross_check.verified_agree}
                </p>
                <p className="text-xs text-slate-500 mt-1">Findings agreed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400">
                  {data.model_cross_check.verified_disagree}
                </p>
                <p className="text-xs text-slate-500 mt-1">Findings disagreed</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Policy drift — the one insight unique to having historical data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6"
        >
          <h2 className="font-semibold mb-1">Policy Drift</h2>
          <p className="text-xs text-slate-500 mb-4">
            Domains scanned more than once, comparing the two most recent scans — did this
            company's actual policy get worse or better since we last checked.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-red-400 text-sm font-semibold">
                <TrendingUp size={14} />
                Got Worse
              </div>
              {data.policy_drift.worsened.length === 0 ? (
                <p className="text-slate-500 text-sm">None yet</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {data.policy_drift.worsened.map((row) => (
                      <tr key={row.policy_name} className="border-t border-slate-800">
                        <td className="py-2 text-slate-200">{row.policy_name}</td>
                        <td className="py-2 text-right text-red-400 font-semibold">
                          {row.previous_score} → {row.latest_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-green-400 text-sm font-semibold">
                <TrendingDown size={14} />
                Got Better
              </div>
              {data.policy_drift.improved.length === 0 ? (
                <p className="text-slate-500 text-sm">None yet</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {data.policy_drift.improved.map((row) => (
                      <tr key={row.policy_name} className="border-t border-slate-800">
                        <td className="py-2 text-slate-200">{row.policy_name}</td>
                        <td className="py-2 text-right text-green-400 font-semibold">
                          {row.previous_score} → {row.latest_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </motion.div>

        {/* Best performers — proof-of-concept for a paid "Privacy Verified" badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl border border-green-900/40 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <BadgeCheck size={16} className="text-green-400" />
            <h2 className="font-semibold">Best Performers — "Privacy Verified" Candidates</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Domains that have never scored above "Low" risk across every scan — the mechanism
            that would decide who qualifies for a paid Privacy Verified badge on their own site.
          </p>
          {data.best_performers.length === 0 ? (
            <p className="text-slate-500 text-sm">None yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="text-left font-medium pb-2">Domain</th>
                  <th className="text-right font-medium pb-2">Avg Score</th>
                  <th className="text-right font-medium pb-2">Scans</th>
                </tr>
              </thead>
              <tbody>
                {data.best_performers.map((row) => (
                  <tr key={row.policy_name} className="border-t border-slate-800">
                    <td className="py-2 text-slate-200">{row.policy_name}</td>
                    <td className="py-2 text-right text-green-400 font-semibold">{row.avg_score}</td>
                    <td className="py-2 text-right text-slate-400">{row.scans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Worst offenders */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-400" />
              <h2 className="font-semibold">Worst Offenders</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Most frequently scanned as "High" risk across all users — lead list for
              compliance outreach or content material.
            </p>
            <table className="w-full text-sm">
              <tbody>
                {data.worst_offenders.length === 0 && (
                  <tr>
                    <td className="text-slate-500 py-2">No high-risk scans yet</td>
                  </tr>
                )}
                {data.worst_offenders.map((row) => (
                  <tr key={row.policy_name} className="border-t border-slate-800">
                    <td className="py-2 text-slate-200">{row.policy_name}</td>
                    <td className="py-2 text-right text-red-400 font-semibold">
                      {row.high_risk_scans}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Coverage gap */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-amber-400" />
              <h2 className="font-semibold">ToS;DR Coverage Gap</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Scanned only via our own AI, never matched in ToS;DR's human-reviewed
              database — prioritize these for manual ToS;DR submission.
            </p>
            <table className="w-full text-sm">
              <tbody>
                {data.coverage_gap.length === 0 && (
                  <tr>
                    <td className="text-slate-500 py-2">No gaps found yet</td>
                  </tr>
                )}
                {data.coverage_gap.map((row) => (
                  <tr key={row.policy_name} className="border-t border-slate-800">
                    <td className="py-2 text-slate-200">{row.policy_name}</td>
                    <td className="py-2 text-right text-amber-400 font-semibold">
                      {row.ai_only_scans}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Scans per day */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-cyan-400" />
              <h2 className="font-semibold">Scans Per Day</h2>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scans_per_day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Source mix */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
          >
            <h2 className="font-semibold mb-4">Source Mix (ToS;DR vs AI)</h2>
            <p className="text-xs text-slate-500 mb-4">
              Every "ai" scan is a paid Groq call — tracks real cost exposure as usage grows.
            </p>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceMixData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {sourceMixData.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Dark pattern frequency */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
        >
          <h2 className="font-semibold mb-1">Platform-Wide Dark Pattern Frequency</h2>
          <p className="text-xs text-slate-500 mb-4">
            Which manipulative patterns show up most across every scanned site — a
            unique "state of privacy policies" data point.
          </p>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dark_pattern_frequency} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="pattern"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {data.dark_pattern_frequency.length === 0 && (
            <p className="text-slate-500 text-sm mt-3">No dark patterns detected across any scan yet.</p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-cyan-400">{icon}</span>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </h2>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}

export default AdminDashboard;
