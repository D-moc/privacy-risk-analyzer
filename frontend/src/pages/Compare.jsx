import { useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Compare() {
  const [policy1, setPolicy1] = useState("");
  const [policy2, setPolicy2] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCompare = async () => {
    if (!policy1.trim() || !policy2.trim()) return;

    try {
      setLoading(true);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/compare`, {
        policy1,
        policy2,
      });

      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-28 px-6 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* HEADER */}

            <div className="text-center mb-12">
  <h1 className="text-5xl font-bold text-slate-900">
                Compare Privacy Policies
              </h1>

              <p className="
      mt-5
      text-lg
      text-slate-600
      max-w-3xl
      mx-auto
      leading-relaxed
    ">
                Compare two privacy policies and identify which one is more
                privacy-friendly.
              </p>
            </div>

            {/* INPUTS */}

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Policy 1</h2>

                <textarea
                  rows="14"
                  value={policy1}
                  onChange={(e) => setPolicy1(e.target.value)}
                  placeholder="Paste first policy..."
                  className="
  w-full
  border-2
  border-slate-300
  rounded-2xl
  p-4
  bg-white
  resize-none
  focus:outline-none
  focus:ring-2
  focus:ring-cyan-500
  focus:border-cyan-500
"
                />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Policy 2</h2>

                <textarea
                  rows="14"
                  value={policy2}
                  onChange={(e) => setPolicy2(e.target.value)}
                  placeholder="Paste second policy..."
                  className="
  w-full
  border-2
  border-slate-300
  rounded-2xl
  p-4
  bg-white
  resize-none
  focus:outline-none
  focus:ring-2
  focus:ring-cyan-500
  focus:border-cyan-500
"
                />
              </div>
            </div>

            {/* BUTTON */}

            <button
              onClick={handleCompare}
              className="
                mt-8
                px-6
                py-3
                rounded-md
                bg-linear-to-r
                from-cyan-500
                to-blue-600
                text-white
                font-medium
                hover:opacity-90
                transition
              "
            >
              Compare Policies
            </button>

            {/* LOADING */}

            {loading && (
              <div className="mt-8 text-slate-600">Comparing policies...</div>
            )}

            {/* RESULTS */}

            {result && !loading && (
              <div className="mt-10 space-y-8">
                {/* SCORES */}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-8">
                    <h3 className="text-xl font-bold mb-3">Policy 1</h3>

                    <p className="text-5xl font-bold text-cyan-600">
                      {result.policy1.risk_score}
                    </p>

                    <p className="mt-2 text-slate-500">Risk Score</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 p-8">
                    <h3 className="text-xl font-bold mb-3">Policy 2</h3>

                    <p className="text-5xl font-bold text-cyan-600">
                      {result.policy2.risk_score}
                    </p>

                    <p className="mt-2 text-slate-500">Risk Score</p>
                  </div>
                </div>

                {/* WINNER */}

                <div className="bg-white rounded-3xl border border-green-200 p-8">
                  <h2 className="text-2xl font-bold text-green-600">
                    Comparison Result
                  </h2>

                  <p className="mt-4 text-lg text-slate-700">
                    Winner:
                    <span className="font-bold ml-2">{result.winner}</span>
                  </p>

                  <p className="mt-3 text-slate-600">
                    The policy with the lower risk score is considered more
                    privacy-friendly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Compare;
