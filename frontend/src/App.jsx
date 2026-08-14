import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";

import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import About from "./pages/About";
import Team from "./pages/Team";
import Assistant from "./pages/Assistant";
import Compare from "./pages/Compare";
import Contact from "./pages/Contact";
import History from "./pages/History";
import Ledger from "./pages/Ledger";
import Extension from "./pages/Extension";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminModelLab from "./pages/AdminModelLab";

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <AnimatePresence mode="wait">
        <Routes>
          {/* Default */}
          <Route path="/" element={<Login />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />


          {/*Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Scan (moved out of Dashboard — this is the actual scan input + results page) */}
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <Scan />
              </ProtectedRoute>
            }
          />


          {/* About */}
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />

          {/* Team */}
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            }
          />

          {/* AI Assistant */}
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            }
          />

           {/* Compare */}
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <Compare />
              </ProtectedRoute>
            }
          />

          {/* Contact */}
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />

          {/* History */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          {/* Data Exposure Ledger */}
          <Route
            path="/ledger"
            element={
              <ProtectedRoute>
                <Ledger />
              </ProtectedRoute>
            }
          />

          {/* Admin (separate login, not linked from the regular Sidebar) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/model-lab"
            element={
              <AdminRoute>
                <AdminModelLab />
              </AdminRoute>
            }
          />

          {/* Chrome Extension */}
          <Route
            path="/extension"
            element={
              <ProtectedRoute>
                <Extension />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
