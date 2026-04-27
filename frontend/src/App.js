import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [examId, setExamId] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const savedExamId = localStorage.getItem("exam_id");
    if (savedExamId) {
      setExamId(Number(savedExamId) || 1);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login", null, {
        params: {
          email,
          password,
        },
      });

      const accessToken = response.data.access_token;
      const userRole = response.data.role || "student";
      setToken(accessToken);
      setRole(userRole);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("role", userRole);
    } catch (error) {
      setLoginError(
        error.response?.data?.detail || error.response?.data?.error || error.message || "Login failed"
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  const handleExamIdChange = (event) => {
    const value = Number(event.target.value) || 1;
    setExamId(value);
    localStorage.setItem("exam_id", String(value));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background:
          "radial-gradient(circle at top left, rgba(29, 78, 216, 0.14), transparent 32%), radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
      }}
    >
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#64748b" }}>
            AI Proctoring Platform
          </p>
          <h1 style={{ margin: "10px 0 0", fontSize: "42px", lineHeight: 1.1 }}>Secure exam monitoring</h1>
          <p style={{ margin: "12px auto 0", maxWidth: "640px", color: "#556070", fontSize: "16px" }}>
            Log in to start a protected exam session, monitor webcam frames, and review live cheating alerts in real time.
          </p>
        </div>

        {!token ? (
          <div
            style={{
              maxWidth: "1120px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                padding: "28px",
                borderRadius: "24px",
                background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 60%, #0f766e 100%)",
                color: "white",
                boxShadow: "0 24px 60px rgba(15, 23, 42, 0.22)",
                display: "grid",
                gap: "18px",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.75 }}>
                  Protected session
                </p>
                <h2 style={{ margin: "10px 0 0", fontSize: "32px", lineHeight: 1.1 }}>Enter the monitoring console</h2>
                <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.82)" }}>
                  Teachers can review violations and live alerts. Students enter a guided webcam monitoring view once signed in.
                </p>
              </div>

              <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
                <div style={{ padding: "14px", borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>Teacher view</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "8px" }}>Live dashboard</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>Student view</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "8px" }}>Camera monitoring</div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleLogin}
              style={{
                display: "grid",
                gap: "14px",
                padding: "28px",
                borderRadius: "24px",
                backgroundColor: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "26px" }}>Login</h2>
                <p style={{ margin: "8px 0 0", color: "#556070" }}>
                  Use your registered email and password to access the platform.
                </p>
              </div>

              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Email</span>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    fontSize: "15px",
                  }}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    fontSize: "15px",
                  }}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)",
                  color: "white",
                  fontWeight: 800,
                  cursor: loginLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 12px 30px rgba(29, 78, 216, 0.28)",
                }}
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>

              {loginError ? (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: "#fff1f2",
                    color: "#9f1239",
                    border: "1px solid #fecdd3",
                    fontWeight: 600,
                  }}
                >
                  {loginError}
                </div>
              ) : null}
            </form>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
                padding: "16px 18px",
                borderRadius: "18px",
                backgroundColor: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>
                  Session control
                </p>
                <h2 style={{ margin: "6px 0 0", fontSize: "24px" }}>Authenticated workspace</h2>
                <p style={{ margin: "6px 0 0", color: "#556070" }}>
                  {role === "teacher" ? "Teacher mode enabled. Review live alerts and stored violations." : "Student mode enabled. Webcam monitoring is active."}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: "999px",
                    backgroundColor: role === "teacher" ? "#eff6ff" : "#e7f8ef",
                    color: role === "teacher" ? "#1d4ed8" : "#146c43",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  {role === "teacher" ? "Teacher access" : "Student access"}
                </span>
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: "999px",
                    backgroundColor: "#f8fafc",
                    color: "#334155",
                    border: "1px solid #e2e8f0",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  Exam #{examId}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "white",
                    color: "#0f172a",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </div>

              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  minWidth: "170px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Exam ID</span>
                <input
                  type="number"
                  min="1"
                  value={examId}
                  onChange={handleExamIdChange}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    fontSize: "15px",
                    backgroundColor: "white",
                  }}
                />
              </label>
            </div>

            {role === "teacher" ? (
              <TeacherDashboard token={token} examId={examId} onLogout={handleLogout} />
            ) : (
              <StudentDashboard token={token} examId={examId} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;