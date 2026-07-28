import { Navigate } from "react-router-dom";

// Parallel to ProtectedRoute.jsx, but checks the separate admin token
// (Part 0 of the admin login) instead of Firebase's AuthContext. Real
// enforcement still happens server-side on every /api/admin/* call —
// this is only a UX gate, not the security boundary.
function AdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;
