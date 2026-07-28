import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Download, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";

import Loader from "../components/Loader";
import RiskMeter from "../components/RiskMeter";
import InsightsGraph from "../components/InsightsGraph";
import API from "../services/api";
import { auth } from "../firebase";

function Scan() {
  const [policyText, setPolicyText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();
  const [policyName, setPolicyName] = useState("");
  const [policyUrl, setPolicyUrl] = useState("");
  const [inputType, setInputType] = useState("text");

  const handleAnalyze = async () => {
    if (!policyName.trim()) {
      alert("Please enter policy name");
      return;
    }

    if (!policyUrl.trim() && !policyText.trim() && !selectedFile) {
      alert("Please provide a URL, policy text, or upload a file.");
      return;
    }
    try {
      setLoading(true);
      setShowResults(false);

      const formData = new FormData();

      formData.append("policy_name", policyName);

      formData.append("input", policyUrl || policyText);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const token =
  await auth.currentUser.getIdToken();

    const response = await API.post(
  "/analyze",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        "multipart/form-data",
    },
  }
);

      if (response.data.error === "NOT_A_POLICY") {
        alert(
          "This doesn't look like a privacy policy. Please paste the site's actual privacy policy text, or its policy page URL."
        );
        return;
      }

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      setAnalysis(response.data);
      console.log(response.data);

      setShowResults(true);
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("PrivacyLens AI Report", 20, 20);

    doc.setFontSize(11);

    const lines = doc.splitTextToSize(analysis.privacy_report, 170);

    doc.text(lines, 20, 35);

    doc.save(`${policyName || "PrivacyLens_Report"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 lg:ml-72">
        <Navbar />

        <main className="pt-28 px-6 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* HEADER */}

            <div className="mb-12">
              <h1 className="text-5xl font-bold text-slate-900">
                Privacy Policy Analyzer
              </h1>

              <p className="mt-4 text-lg text-slate-600 max-w-8xl">
                Paste a privacy policy or upload a policy document and receive
                AI-powered privacy insights, risk scores, and simplified
                summaries.
              </p>
            </div>

            {/* ANALYZER CARD */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Analyze Privacy Policy
              </h2>

              <div className="space-y-4 mb-6">
                {/* POLICY NAME */}

                <input
                  type="text"
                  placeholder="Policy Name"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  className="
      w-full
      border
      border-slate-200
      rounded-2xl
      px-4
      py-3
    "
                />

                {/* CHOOSE INPUT METHOD */}

                <div className="mt-4">
                  <p className="font-medium text-slate-700 mb-3">
                    Choose Input Method
                  </p>

                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="text"
                        checked={inputType === "text"}
                        onChange={(e) => setInputType(e.target.value)}
                      />
                      Paste Policy Text
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="url"
                        checked={inputType === "url"}
                        onChange={(e) => setInputType(e.target.value)}
                      />
                      Privacy Policy URL
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="file"
                        checked={inputType === "file"}
                        onChange={(e) => setInputType(e.target.value)}
                      />
                      Upload File
                    </label>
                  </div>
                </div>

                {/* URL INPUT */}

                {inputType === "url" && (
                  <input
                    type="text"
                    placeholder="https://example.com/privacy"
                    value={policyUrl}
                    onChange={(e) => setPolicyUrl(e.target.value)}
                    className="
        w-full
        border
        border-slate-200
        rounded-2xl
        px-4
        py-3
      "
                  />
                )}

                {/* TEXT INPUT */}

                {inputType === "text" && (
                  <textarea
                    rows="10"
                    value={policyText}
                    onChange={(e) => setPolicyText(e.target.value)}
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
                )}

                {/* FILE INPUT */}

                {inputType === "file" && (
                  <div
                    className="
        border-2
        border-dashed
        border-slate-300
        rounded-2xl
        p-8
        text-center
      "
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />

                    {selectedFile && (
                      <p className="mt-3 text-cyan-600 font-medium">
                        {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ANALYZE BUTTON */}

              <button
                onClick={handleAnalyze}
                className="
                  mt-6
                  px-6
                  py-3
                  rounded-xl
                  bg-linear-to-r
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

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-w-0">
                    <RiskMeter score={analysis?.risk_score || 0} />
                  </div>

                  {/* GRAPH */}

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      Policy Insights
                    </h3>

                    {/* <InsightsGraph data={analysis?.bert_labels || {}} /> */}
                    <InsightsGraph data={analysis?.insights || {}} />
                  </div>
                </div>
                {/* PRIVACYLENS AI REPORT */}

                {analysis?.privacy_report && (
                  <div className="mt-8 bg-white rounded-3xl border border-cyan-100 shadow-sm overflow-hidden">
                    {/* HEADER */}

                    <div className="px-8 py-5 border-b border-slate-100 bg-linear-to-r from-cyan-50 to-blue-50">
                      <h2 className="text-2xl font-bold text-slate-900">
                        PrivacyLens AI Report
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        AI-generated privacy assessment based on detected risks,
                        tracking practices, and policy findings.
                      </p>
                    </div>

                    {/* REPORT */}

                    <div className="p-8">
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown
                          components={{
                            h2: ({ children }) => (
                              <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
                                {children}
                              </h2>
                            ),

                            strong: ({ children }) => (
                              <strong className="font-semibold text-slate-900">
                                {children}
                              </strong>
                            ),

                            p: ({ children }) => (
                              <p className="text-slate-700 leading-7 mb-4">
                                {children}
                              </p>
                            ),

                            li: ({ children }) => (
                              <li className="text-slate-700 mb-2">
                                {children}
                              </li>
                            ),
                          }}
                        >
                          {analysis.privacy_report}
                        </ReactMarkdown>
                      </div>

                      {/* ACTION BUTTONS */}

                      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
                        <button
                          onClick={downloadPDF}
                          className="
                              flex
                              items-center
                              gap-2
                              px-5
                              py-3
                              rounded-xl
                              border
                              border-slate-200
                              hover:bg-slate-50
                              transition
                            "
                        >
                          <Download size={18} />
                          Download Report
                        </button>

                        <button
                          onClick={() =>
                            navigate("/assistant", {
                              state: {
                                report: analysis?.privacy_report,
                                risk: analysis?.risk_score,
                                clauses: analysis?.clauses,
                                darkPatterns: analysis?.dark_patterns,
                              },
                            })
                          }
                          className="
            flex
            items-center
            gap-2
            px-5
            py-3
            rounded-xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            text-white
            hover:opacity-90
            transition
          "
                        >
                          <Bot size={18} />
                          Ask AI About This Policy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {analysis?.dark_patterns?.length > 0 && (
                  <div className="mt-8 bg-white rounded-3xl border border-red-200 shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-5">
                      Dark Patterns Detected
                    </h2>

                    <div className="space-y-3">
                      {analysis.dark_patterns.map((item, index) => (
                        <div
                          key={index}
                          className="
              flex
              items-center
              gap-3
              bg-red-50
              border
              border-red-100
              rounded-xl
              px-4
              py-3
            "
                        >
                          <span className="text-red-500">⚠</span>

                          <span className="text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Scan;
