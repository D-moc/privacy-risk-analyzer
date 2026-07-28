import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  ScanLine,
  ArrowRight,
  Mail,
  MapPin,
  CreditCard,
  Activity,
  Smartphone,
  Cookie,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";

const CATEGORY_ICONS = {
  "Contact Info": Mail,
  Location: MapPin,
  "Financial Info": CreditCard,
  "Browsing & Usage Activity": Activity,
  "Device & Identifiers": Smartphone,
  "Cookies & Tracking": Cookie,
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_scans: 0,
    threats_found: 0,
    privacy_score: 100,
  });
  const [recentScans, setRecentScans] = useState([]);
  const [ledgerRollup, setLedgerRollup] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };
      const base = import.meta.env.VITE_API_URL;

      const [statsRes, historyRes, ledgerRes] = await Promise.all([
        axios.get(`${base}/api/stats`, { headers }),
        axios.get(`${base}/api/history`, { headers }),
        axios.get(`${base}/api/ledger`, { headers }),
      ]);

      setStats(statsRes.data);
      setRecentScans((historyRes.data || []).slice(0, 5));

      const entries = Array.isArray(ledgerRes.data) ? ledgerRes.data : [];
      const rollup = Object.keys(CATEGORY_ICONS).map((category) => ({
        category,
        total: entries.filter((e) => e.category === category).length,
      }));
      setLedgerRollup(rollup);
    } catch (error) {
      console.error("Dashboard overview error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskStyle = (risk) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "High":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-28 px-6 md:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-5xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                  Your privacy activity at a glance — recent scans and what
                  companies hold your data.
                </p>
              </div>

              <button
                onClick={() => navigate("/scan")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:opacity-90 transition"
              >
                <ScanLine size={18} />
                Start a New Scan
              </button>
            </motion.div>

            {/* Stat cards */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <StatCard icon={<FileText size={22} />} label="Total Scans" value={stats.total_scans} />
              <StatCard icon={<AlertTriangle size={22} />} label="Threats Found" value={stats.threats_found} />
              <StatCard icon={<ShieldCheck size={22} />} label="Privacy Score" value={stats.privacy_score} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent scans (from History) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Recent Scans</h2>
                  <button
                    onClick={() => navigate("/history")}
                    className="flex items-center gap-1 text-sm text-cyan-600 font-semibold hover:underline"
                  >
                    View all
                    <ArrowRight size={14} />
                  </button>
                </div>

                {recentScans.length === 0 ? (
                  <p className="p-6 text-slate-500 text-sm">
                    No scans yet — start one to see it here.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentScans.map((report) => (
                      <div key={report.id} className="px-6 py-4 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{report.policy_name}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskStyle(report.risk_level)}`}
                        >
                          {report.risk_level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Ledger rollup preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Data Ledger</h2>
                  <button
                    onClick={() => navigate("/ledger")}
                    className="flex items-center gap-1 text-sm text-cyan-600 font-semibold hover:underline"
                  >
                    View all
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {ledgerRollup.map((r) => {
                    const Icon = CATEGORY_ICONS[r.category];
                    return (
                      <div key={r.category} className="px-6 py-4 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-700">
                          <Icon size={16} className="text-cyan-600" />
                          {r.category}
                        </span>
                        <span className="font-semibold text-slate-900">{r.total}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
}

export default Dashboard;
