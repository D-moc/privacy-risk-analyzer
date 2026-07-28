import { createContext, useEffect, useState } from "react";
import { initExtensionAuthBridge } from "../extensionAuthBridge";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOAD USER FROM LOCAL STORAGE
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Auth Load Error:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // SYNC AUTH TOKEN TO THE CHROME EXTENSION (if installed)
  useEffect(() => {
    const unsubscribe = initExtensionAuthBridge();
    return unsubscribe;
  }, []);

  // LOGIN
  const login = (userData) => {
    setUser(userData);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;