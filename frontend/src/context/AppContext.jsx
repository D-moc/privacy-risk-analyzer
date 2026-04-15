import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

function AppProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");

  // 🔥 ADD THIS
  const [analysisData, setAnalysisData] = useState(null);

  // 🌙 THEME HANDLING
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        analysisData,       // 🔥 NEW
        setAnalysisData     // 🔥 NEW
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;