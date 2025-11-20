// ProtectedLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "./utils";
import Layout from "./layout";

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // Optional: verify token with backend
    fetch("http://localhost:5000/api/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setAuthenticated(true);
        } else {
          clearToken();
          navigate("/", { replace: true });
        }
      })
      .catch((err) => {
        console.error("Token verification failed:", err);
        clearToken();
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="p-6">Checking authentication…</div>;
  if (!authenticated) return null;

  return <Layout><Outlet /></Layout>;
}
