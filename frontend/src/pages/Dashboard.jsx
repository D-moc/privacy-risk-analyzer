import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import Loader from "../components/Loader";
import RiskMeter from "../components/RiskMeter";
import InsightsGraph from "../components/InsightsGraph";

function Dashboard() {
  const [policyText, setPolicyText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Dummy data for UI preview
  const mockInsights = {
    data_collection: [1, 2, 3, 4, 5],
    third_party_sharing: [1, 2],
    cookies_tracking: [1, 2, 3, 4],
    user_rights: [1, 2, 3],
  };

  const handleAnalyze = () => {
    setLoading(true);
    setShowResults(false);

    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <div className="ml-0 lg:ml-72">

        <Navbar />

        <main className="pt-28 px-8 pb-8">

          <div className="max-w-7xl mx-auto">

            {/* HEADER */}

            <div className="mb-10">

              <span className="inline-flex px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium border border-cyan-100">
                Dashboard
              </span>

              <h1 className="mt-5 text-5xl font-bold text-slate-900">
                Privacy Policy Analyzer
              </h1>

              <p className="mt-4 text-lg text-slate-600 max-w-3xl">
                Paste a privacy policy or upload a policy document
                and receive AI-powered privacy insights, risk scores,
                and simplified summaries.
              </p>

            </div>

            {/* ANALYZER CARD */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Analyze Privacy Policy
              </h2>

              {/* TEXT AREA */}

              <textarea
                rows="10"
                value={policyText}
                onChange={(e) =>
                  setPolicyText(e.target.value)
                }
                placeholder="Paste privacy policy text here..."
                className="
                  w-full
                  border
                  border-slate-200
                  rounded-2xl
                  p-4
                  resize-none
                  focus:outline-none
                  focus:ring-2
                  focus:ring-cyan-500
                "
              />

              {/* FILE UPLOAD */}

              <div className="mt-6">

                <label
                  className="
                    flex
                    items-center
                    justify-center
                    w-full
                    border-2
                    border-dashed
                    border-slate-300
                    rounded-2xl
                    py-8
                    cursor-pointer
                    hover:border-cyan-500
                    transition
                  "
                >
                  <div className="text-center">

                    <p className="font-medium text-slate-700">
                      Upload Privacy Policy File
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      PDF, DOC, DOCX, TXT
                    </p>

                    {selectedFile && (
                      <p className="mt-3 text-cyan-600 font-medium">
                        {selectedFile.name}
                      </p>
                    )}

                  </div>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) =>
                      setSelectedFile(
                        e.target.files[0]
                      )
                    }
                  />

                </label>

              </div>

              {/* ANALYZE BUTTON */}

              <button
                onClick={handleAnalyze}
                className="
                  mt-6
                  px-6
                  py-3
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  text-white
                  font-medium
                  hover:opacity-90
                  transition
                "
              >
                Analyze Policy
              </button>

            </div>

            {/* LOADER */}

            {loading && (
              <div className="mt-10">
                <Loader />
              </div>
            )}

            {/* RESULTS */}

            {showResults && !loading && (
              <>

                {/* TOP CARDS */}

                <div className="grid lg:grid-cols-2 gap-8 mt-10">

                  {/* RISK */}

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

                    <RiskMeter score={67} />

                  </div>

                  {/* GRAPH */}

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      Policy Insights
                    </h3>

                    <InsightsGraph
                      data={mockInsights}
                    />

                  </div>

                </div>

                {/* AI SUMMARY */}

                <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

                  <h2 className="text-2xl font-bold text-slate-900 mb-5">
                    AI Summary
                  </h2>

                  <p className="text-slate-600 leading-relaxed">
                    This privacy policy collects user
                    information including email address,
                    location data, device identifiers,
                    and browsing activity. The policy
                    indicates that certain information
                    may be shared with third-party
                    partners for analytics and advertising
                    purposes. Users are provided access
                    to data deletion and privacy control
                    mechanisms.
                  </p>

                </div>

              </>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;