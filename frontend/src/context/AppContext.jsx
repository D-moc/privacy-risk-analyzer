import { createContext, useState } from "react";

export const AppContext = createContext();

function AppProvider({ children }) {

  // 🌐 Language state
  const [language, setLanguage] = useState("en");

  // 📊 Analysis data state
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        analysisData,
        setAnalysisData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;