import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  AlertTriangle,
  Clock,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function History() {
  const reports = [
    {
      id: 1,
      name: "Google Privacy Policy",
      risk: "Low",
      score: 88,
      date: "2026-06-03",
    },
    {
      id: 2,
      name: "Instagram Privacy Policy",
      risk: "Medium",
      score: 62,
      date: "2026-06-01",
    },
    {
      id: 3,
      name: "Discord Privacy Policy",
      risk: "High",
      score: 34,
      date: "2026-05-29",
    },
  ];

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

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <div className="ml-0 lg:ml-72">

        <Navbar />

        <main className="pt-28 px-8 pb-8">

          <div className="max-w-7xl mx-auto">

            {/* Header */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <span className="inline-flex px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium border border-cyan-100">
                Scan History
              </span>

              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                Privacy Analysis History
              </h1>

              <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                View all previously analyzed privacy policies,
                generated reports, and risk assessments.
              </p>
            </motion.div>

            {/* Stats */}

            <div className="grid md:grid-cols-4 gap-6 mb-8">

              <StatCard
                icon={<FileText size={22} />}
                title="Total Reports"
                value="24"
              />

              <StatCard
                icon={<Shield size={22} />}
                title="Safe Policies"
                value="12"
              />

              <StatCard
                icon={<AlertTriangle size={22} />}
                title="Risk Alerts"
                value="7"
              />

              <StatCard
                icon={<Clock size={22} />}
                title="Last Scan"
                value="Today"
              />

            </div>

            {/* Reports Table */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Reports
                </h2>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Policy
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Risk
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Score
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {report.name}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskStyle(
                              report.risk
                            )}`}
                          >
                            {report.risk}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {report.score}/100
                        </td>

                        <td className="px-6 py-4 text-slate-500">
                          {report.date}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            </motion.div>

            {/* Empty State */}

            {reports.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center mt-8">

                <FileText
                  size={50}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  No Reports Yet
                </h3>

                <p className="mt-2 text-slate-500">
                  Start analyzing privacy policies to
                  build your history.
                </p>

              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </h3>
    </div>
  );
}

export default History;