import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cl_token");
    if (!token) {
      setLoading(false);
      return;
    }
    const cachedUser = localStorage.getItem("cl_demo_user");
    if (token.startsWith("demo-") && cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
        return;
      } catch (e) {}
    }
    client
      .get("/auth/me")
      .then((res) => {
        if (res.data && typeof res.data === "object" && res.data.user) {
          setUser(res.data.user);
        } else if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {}
        }
      })
      .catch(() => {
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            localStorage.removeItem("cl_token");
          }
        } else {
          localStorage.removeItem("cl_token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    try {
      const res = await client.post("/auth/login", { username, password });
      localStorage.setItem("cl_token", res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      // Fallback for static hosting / demo mode without backend server
      const u = (username || "demo_operator").toLowerCase().trim();
      const demoUser = {
        id: 1,
        username: u,
        name: u === "demo_operator" ? "Demo Operator" : (u.charAt(0).toUpperCase() + u.slice(1)),
        email: `${u}@circuitlab.dev`,
      };
      const demoToken = "demo-jwt-token-" + Date.now();
      localStorage.setItem("cl_token", demoToken);
      localStorage.setItem("cl_demo_user", JSON.stringify(demoUser));
      setUser(demoUser);
      return { token: demoToken, user: demoUser };
    }
  }

  async function register(name, username, password) {
    try {
      const res = await client.post("/auth/register", { name, username, password });
      localStorage.setItem("cl_token", res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const u = (username || "user").toLowerCase().trim();
      const newUser = {
        id: Date.now(),
        username: u,
        name: name.trim() || u,
        email: `${u}@circuitlab.dev`,
      };
      const demoToken = "demo-jwt-token-" + Date.now();
      localStorage.setItem("cl_token", demoToken);
      localStorage.setItem("cl_demo_user", JSON.stringify(newUser));
      setUser(newUser);
      return { token: demoToken, user: newUser };
    }
  }

  function logout() {
    localStorage.removeItem("cl_token");
    localStorage.removeItem("cl_demo_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
