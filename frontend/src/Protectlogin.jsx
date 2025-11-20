import { Navigate } from "react-router-dom";
import { getToken } from "./utils";

export default function ProtectedLogin({ children }) {
  const token = getToken();

  // If user is logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
