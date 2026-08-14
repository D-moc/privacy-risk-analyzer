import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrivacyLens } from "./lib/usePrivacyLens";
import Header from "./components/Header";
import SiteRow from "./components/SiteRow";
import HeroCard from "./components/HeroCard";
import LoadingScreen from "./components/LoadingScreen";
import ErrorState from "./components/ErrorState";
import PrivacyScoreCard from "./components/PrivacyScoreCard";
import DataPractices from "./components/DataPractices";
import SummaryCard from "./components/SummaryCard";
import KeyConcerns from "./components/KeyConcerns";
import DetailsPanel from "./components/DetailsPanel";
import FloatingAskAI from "./components/FloatingAskAI";
import Footer from "./components/Footer";
import AuthStrip from "./components/AuthStrip";
import SettingsPanel from "./components/SettingsPanel";

function summaryText(analysis) {
  const privacyScore = 100 - analysis.risk_score;
  const critical = (analysis.findings || []).filter((f) => f.severity === "critical").length;
  if (privacyScore < 50) {
    return `This policy raises real concerns${critical ? `, including ${critical} serious issue${critical > 1 ? "s" : ""}` : ""}. Worth reading before you continue.`;
  }
  if (privacyScore < 80) {
    return "Some data practices here are worth a closer look.";
  }
  return "This policy looks respectful of your privacy overall.";
}

export default function App() {
  const pl = usePrivacyLens();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-bg-primary">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <SiteRow
        domain={pl.tab.domain}
        favicon={pl.tab.favicon}
        status={
          pl.view === "loading"
            ? "Investigating…"
            : pl.view === "results"
            ? "Case closed"
            : pl.view === "error"
            ? "Investigation failed"
            : "Ready to investigate"
        }
        onRescan={pl.scan}
        spinning={pl.view === "loading"}
      />

      <div className="flex flex-1 flex-col overflow-y-auto pb-2">
        {/* Deliberately not wrapped in AnimatePresence: the view can flip
            idle -> loading -> error within milliseconds (e.g. an instant
            "connection refused" if the backend isn't running), which is
            faster than AnimatePresence's exit/enter sequencing can track
            in either "wait" or default mode — both left stale or stacked
            content on screen. Plain conditional rendering is instant and
            always correct; each screen already fades itself in below. */}
        {pl.view === "idle" && <HeroCard onAnalyze={pl.scan} />}

        {pl.view === "loading" && <LoadingScreen message={pl.loadingMessage} />}

        {pl.view === "error" && (
          <ErrorState title={pl.error.title} message={pl.error.message} onRetry={pl.scan} />
        )}

        {pl.view === "results" && pl.analysis && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <PrivacyScoreCard riskScore={pl.analysis.risk_score} />

            <SummaryCard
              text={summaryText(pl.analysis)}
              citation={
                pl.analysis.source === "tosdr"
                  ? {
                      text: `Source: ToS;DR community review (grade ${pl.analysis.tosdr_rating || "?"})`,
                      url: pl.analysis.tosdr_service_url,
                    }
                  : null
              }
            />

            <KeyConcerns findings={pl.analysis.findings} source={pl.analysis.source} />

            <DataPractices dataPractices={pl.analysis.data_practices} />

            <DetailsPanel analysis={pl.analysis} />

            <Footer
              analyzedAt={pl.analyzedAt}
              onDownload={pl.downloadReport}
              onOpenDashboard={() => pl.goToWebApp(pl.auth ? "/history" : "/login")}
              onOpenLedger={() => pl.goToWebApp(pl.auth ? "/ledger" : "/login")}
            />
          </motion.div>
        )}
      </div>

      <AuthStrip auth={pl.auth} onSignIn={() => pl.goToWebApp(pl.auth ? "/history" : "/login")} />

      {pl.view === "results" && (
        <FloatingAskAI chatLog={pl.chatLog} asking={pl.asking} onAsk={pl.ask} />
      )}

      <AnimatePresence>
        {settingsOpen && (
          <SettingsPanel
            settings={pl.settings}
            updateSettings={pl.updateSettings}
            auth={pl.auth}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
