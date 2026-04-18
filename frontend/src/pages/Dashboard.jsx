import { useState, useContext } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Upload, Globe } from "lucide-react";

import RiskMeter from "../components/RiskMeter";
import InsightsGraph from "../components/InsightsGraph";
import Loader from "../components/Loader";

import { franc } from "franc";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";

import { AppContext } from "../context/AppContext";

function Dashboard() {
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const { analysisData, setAnalysisData } = useContext(AppContext);

  const detectLanguage = (text) => {
    const lang = franc(text || "");
    if (lang === "hin") return "hi";
    if (lang === "mar") return "mr";
    return "en";
  };

  const translateTo = async (text, targetLang) => {
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0].map((item) => item[0]).join("");
    } catch {
      return text;
    }
  };

  const translateToEnglish = async (text) => {
    return await translateTo(text, "en");
  };

  const extractPDFText = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }

        resolve(text);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const downloadReport = () => {
    if (!analysisData) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Privacy Risk Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Risk Score: ${analysisData.risk_score}`, 20, 40);

    doc.text("Summary:", 20, 60);
    doc.text(analysisData.summary, 20, 70, { maxWidth: 170 });

    doc.save("Privacy_Report.pdf");
  };

  const handleAnalyze = async () => {
    if (!input) return toast.error("Enter text or upload file");

    try {
      setAnalysisData(null);
      setLoading(true);

      const detectedLang = detectLanguage(input);
      setLanguage(detectedLang);

      const englishInput = await translateToEnglish(input);

      const res = await API.post("/analyze", {
        text: englishInput,
      });

      setAnalysisData(res.data);

    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f6f2] flex justify-center px-4 py-12">

      <div className="w-full max-w-3xl">

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Analyze Privacy Policies
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Paste or upload a policy to get instant insights
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border mb-6">

          <div className="flex justify-between items-center mb-4">

            <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition">
              <Upload size={16} />
              Upload
              <input
                type="file"
                hidden
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  setFileName(file.name);

                  if (file.type === "application/pdf") {
                    const pdfText = await extractPDFText(file);
                    setInput(pdfText);
                  } else {
                    const reader = new FileReader();
                    reader.onload = () => setInput(reader.result);
                    reader.readAsText(file);
                  }
                }}
              />
            </label>

            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Globe size={16} />
              <span className="text-sm">{language.toUpperCase()}</span>
            </div>

          </div>

          <textarea
            placeholder="Paste privacy policy here..."
            className="w-full border p-4 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={handleAnalyze}
            className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
          >
            {loading ? "Analyzing..." : "Analyze Policy"}
          </button>

        </div>

        {loading && <Loader />}

        {analysisData && !loading && (
          <div className="space-y-6">

            <div className="bg-white p-6 rounded-2xl shadow">
              <RiskMeter score={analysisData.risk_score} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-600">{analysisData.summary}</p>

              <button
                onClick={downloadReport}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download Report 📄
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <InsightsGraph data={analysisData.clauses} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;