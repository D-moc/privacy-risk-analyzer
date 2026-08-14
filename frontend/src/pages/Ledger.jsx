import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  CreditCard,
  Activity,
  Smartphone,
  Cookie,
  ChevronLeft,
  Building2,
} from "lucide-react";
import { auth } from "../firebase";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const CATEGORY_ICONS = {
  "Contact Info": Mail,
  Location: MapPin,
  "Financial Info": CreditCard,
  "Browsing & Usage Activity": Activity,
  "Device & Identifiers": Smartphone,
  "Cookies & Tracking": Cookie,
};

const CATEGORY_ORDER = Object.keys(CATEGORY_ICONS);

function Ledger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ledger`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEntries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const rollup = CATEGORY_ORDER.map((category) => {
    const companies = entries.filter((e) => e.category === category);

    return {
      category,
      total: companies.length,
      shared: companies.filter((e) => e.disposition === "shared").length,
    };
  });

  const drillDown = activeCategory
    ? entries
        .filter((e) => e.category === activeCategory)
        .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Ledger...
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
              className="mb-10"
            >
              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                Data Exposure Ledger
              </h1>

              <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                Every company you've scanned, grouped by the kind of data they
                told you they collect — built automatically from your scan
                history, across the extension and the website.
              </p>
            </motion.div>

            {!activeCategory ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rollup.map((r, i) => {
                  const Icon = CATEGORY_ICONS[r.category];

                  return (
                    <motion.button
                      key={r.category}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => r.total > 0 && setActiveCategory(r.category)}
                      disabled={r.total === 0}
                      className="text-left bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-cyan-200 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                        <Icon size={22} />
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        {r.category}
                      </h3>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {r.total}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {r.total === 0
                          ? "No companies scanned yet"
                          : `companies hold this${
                              r.shared ? ` · ${r.shared} share it further` : ""
                            }`}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <h2 className="text-xl font-semibold text-slate-900">
                    {activeCategory}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-6 py-4">Company</th>
                        <th className="text-left px-6 py-4">Disposition</th>
                        <th className="text-left px-6 py-4">Last Seen</th>
                        <th className="text-left px-6 py-4">Scans</th>
                      </tr>
                    </thead>

                    <tbody>
                      {drillDown.map((entry) => (
                        <tr
                          key={entry.company}
                          className="border-t border-slate-100 hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4 font-medium text-slate-800">
                            <span className="flex items-center gap-2">
                              <Building2 size={16} className="text-slate-400" />
                              {entry.company}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                entry.disposition === "shared"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {entry.disposition === "shared"
                                ? "Shared with third parties"
                                : "Collected"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {entry.last_seen
                              ? new Date(entry.last_seen).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {entry.scan_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {entries.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center mt-8">
                <Building2 size={50} className="mx-auto text-slate-300" />

                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  No data yet
                </h3>

                <p className="mt-2 text-slate-500">
                  Scan a few sites from the extension or the dashboard — this
                  page fills in automatically.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Ledger;
