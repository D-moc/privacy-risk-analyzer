import { useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function PolicyInput({ label, inputType, setInputType, text, setText, url, setUrl }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6">
      <h2 className="text-xl font-semibold mb-4">{label}</h2>

      <div className="flex gap-5 mb-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            checked={inputType === "text"}
            onChange={() => setInputType("text")}
          />
          Paste text
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            checked={inputType === "url"}
            onChange={() => setInputType("url")}
          />
          Policy or homepage URL
        </label>
      </div>

      {inputType === "url" ? (
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full border-2 border-slate-300 rounded-2xl p-4 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        />
      ) : (
        <textarea
          rows="14"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste policy text..."
          className="w-full border-2 border-slate-300 rounded-2xl p-4 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        />
      )}
    </div>
  );
}

function Compare() {
  const [inputType1, setInputType1] = useState("text");
  const [inputType2, setInputType2] = useState("text");
  const [policy1Text, setPolicy1Text] = useState("");
  const [policy1Url, setPolicy1Url] = useState("");
  const [policy2Text, setPolicy2Text] = useState("");
  const [policy2Url, setPolicy2Url] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCompare = async () => {
    const policy1 = inputType1 === "url" ? policy1Url : policy1Text;
    const policy2 = inputType2 === "url" ? policy2Url : policy2Text;

    if (!policy1.trim() || !policy2.trim()) return;

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/compare`, {
        policy1,
        policy2,
      });

      if (response.data.error) {
        const details = [];
        if (response.data.policy1_error === "NOT_A_POLICY") details.push("Policy 1 doesn't look like a real privacy policy.");
        if (response.data.policy2_error === "NOT_A_POLICY") details.push("Policy 2 doesn't look like a real privacy policy.");
        alert(details.join(" ") || "Couldn't compare these policies.");
        return;
      }

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Couldn't reach the server. Please try again.");
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

              <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Paste text, or just a company's homepage or policy URL — the
                real privacy policy is found automatically either way.
              </p>
            </div>

            {/* INPUTS */}

            <div className="grid lg:grid-cols-2 gap-6">
              <PolicyInput
                label="Policy 1"
                inputType={inputType1}
                setInputType={setInputType1}
                text={policy1Text}
                setText={setPolicy1Text}
                url={policy1Url}
                setUrl={setPolicy1Url}
              />
              <PolicyInput
                label="Policy 2"
                inputType={inputType2}
                setInputType={setInputType2}
                text={policy2Text}
                setText={setPolicy2Text}
                url={policy2Url}
                setUrl={setPolicy2Url}
              />
            </div>

            {/* BUTTON */}

            <button
              onClick={handleCompare}
              disabled={loading}
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
                disabled:opacity-60
              "
            >
              {loading ? "Comparing..." : "Compare Policies"}
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
