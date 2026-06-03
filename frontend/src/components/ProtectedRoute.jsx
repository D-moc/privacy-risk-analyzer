import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } =
    useContext(AuthContext);

  // WAIT UNTIL AUTH STATE IS LOADED
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">

        <div className="flex flex-col items-center gap-4">

          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />

          <h2 className="text-white text-lg font-semibold">
            PrivacyLens
          </h2>

          <p className="text-slate-400 text-sm">
            Verifying authentication...
          </p>

        </div>

      </div>
    );
  }

  // USER NOT LOGGED IN
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // USER AUTHENTICATED
  return children;
}

export default ProtectedRoute;
