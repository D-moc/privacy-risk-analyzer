import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Upload, Globe } from "lucide-react";

import RiskMeter from "../components/RiskMeter";
import InsightsGraph from "../components/InsightsGraph";
import Loader from "../components/Loader";

import { franc } from "franc";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";

function Dashboard() {
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🌍 Detect language
  const detectLanguage = (text) => {
    const lang = franc(text || "");
    if (lang === "hin") return "hi";
    if (lang === "mar") return "mr";
    return "en";
  };

  // 🌐 Translate
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

  // 📄 Extract PDF text
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

  // 📥 Download PDF report
  const downloadReport = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Privacy Risk Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Risk Score: ${result.risk_score}`, 20, 40);

    doc.text("Summary:", 20, 60);
    doc.text(result.summary, 20, 70, { maxWidth: 170 });

    if (result.dark_patterns?.length > 0) {
      doc.text("Dark Patterns:", 20, 120);
      result.dark_patterns.forEach((item, i) => {
        doc.text(`- ${item}`, 20, 130 + i * 10);
      });
    }

    doc.save("Privacy_Report.pdf");
  };

  const handleAnalyze = async () => {
    if (!input) return toast.error("Enter text or upload file");

    try {
      setLoading(true);

      // 🔥 Auto detect language
      const detectedLang = detectLanguage(input);
      setLanguage(detectedLang);

      // 🔥 Convert input → English
      const englishInput = await translateToEnglish(input);

      // 🔥 Backend call
      const res = await API.post("/analyze", {
        text: englishInput,
      });

      let summary = res.data.summary;

      // 🔥 Convert output → user language
      if (detectedLang !== "en") {
        summary = await translateTo(summary, detectedLang);
      }

      setResult({
        ...res.data,
        summary,
      });

    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-6">

      <h1 className="text-3xl font-bold mb-6">Privacy Risk Analyzer</h1>

      {/* INPUT CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-md border mb-6">

        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">

          {/* FILE UPLOAD */}
          <label className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border cursor-pointer">
            <Upload size={16} />
            Upload File

            <input
              type="file"
              accept=".txt,.pdf"
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

          {/* FILE NAME */}
          {fileName && (
            <span className="text-xs text-gray-500">{fileName}</span>
          )}

          {/* LANGUAGE */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border">
            <Globe size={16} />
            <span className="text-sm">{language.toUpperCase()}</span>
          </div>

        </div>

        <textarea
          placeholder="Paste policy or URL..."
          className="w-full border p-4 rounded-xl h-40"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          className="mt-5 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700"
        >
          {loading ? "Analyzing..." : "Analyze Policy"}
        </button>

      </div>

      {loading && <Loader />}

      {/* RESULTS */}
      {result && !loading && (
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow">
            <RiskMeter score={result.risk_score} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-semibold mb-2">Summary</h2>
            <p className="text-gray-600">{result.summary}</p>

            <button
              onClick={downloadReport}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Download Report 📄
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow col-span-2">
            <InsightsGraph data={result.clauses} />
          </div>

          {result.dark_patterns?.length > 0 && (
            <div className="bg-red-50 p-6 rounded-2xl border col-span-2">
              <h2 className="text-red-600 font-semibold mb-2">
                ⚠️ Dark Patterns
              </h2>
              <ul>
                {result.dark_patterns.map((d, i) => (
                  <li key={i}>• {d}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default Dashboard;