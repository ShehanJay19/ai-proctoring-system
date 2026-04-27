import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const TeacherDashboard = ({ token, examId, onLogout }) => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [socketStatus, setSocketStatus] = useState("connecting");

  const wsUrl = useMemo(() => {
    const queryToken = encodeURIComponent(token);
    return `ws://127.0.0.1:8000/ws/violations/${examId}?token=${queryToken}`;
  }, [examId, token]);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      setLoadingSummary(true);
      setSummaryError("");

      try {
        const response = await axios.get(`http://127.0.0.1:8000/violations/${examId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted) {
          setSummary(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setSummaryError(
            error.response?.data?.detail || error.message || "Failed to load violations summary"
          );
        }
      } finally {
        if (isMounted) {
          setLoadingSummary(false);
        }
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [examId, token]);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setSocketStatus("connected");
    };

    socket.onerror = () => {
      setSocketStatus("error");
    };

    socket.onclose = () => {
      setSocketStatus("disconnected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveAlerts((currentAlerts) => [
        {
          id: `${data.exam_id}-${data.student_id}-${Date.now()}`,
          ...data,
        },
        ...currentAlerts,
      ]);

      setSummary((currentSummary) => {
        if (!currentSummary) {
          return currentSummary;
        }

        const updatedStudents = [...currentSummary.students];
        const studentIndex = updatedStudents.findIndex((student) => student.student_id === data.student_id);

        if (studentIndex >= 0) {
          const targetStudent = updatedStudents[studentIndex];
          updatedStudents[studentIndex] = {
            ...targetStudent,
            violation_count: targetStudent.violation_count + 1,
            violations: [
              {
                id: Date.now(),
                violation_type: data.violation_type,
              },
              ...targetStudent.violations,
            ],
          };
        } else {
          updatedStudents.unshift({
            student_id: data.student_id,
            name: null,
            email: null,
            violation_count: 1,
            violations: [
              {
                id: Date.now(),
                violation_type: data.violation_type,
              },
            ],
          });
        }

        return {
          ...currentSummary,
          total_violations: currentSummary.total_violations + 1,
          students: updatedStudents,
        };
      });
    };

    return () => socket.close();
  }, [wsUrl]);

  const totalStudents = summary?.students?.length || 0;
  const totalViolations = summary?.total_violations || 0;

  const socketBadgeStyles = {
    connected: { backgroundColor: "#e7f8ef", color: "#146c43" },
    connecting: { backgroundColor: "#fff4e5", color: "#8a5b00" },
    disconnected: { backgroundColor: "#f1f3f5", color: "#495057" },
    error: { backgroundColor: "#fde8e8", color: "#b42318" },
  };

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          padding: "18px 20px",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>
            Teacher Monitor
          </p>
          <h2 style={{ margin: "6px 0 0" }}>Exam #{examId}</h2>
          <p style={{ margin: "6px 0 0", color: "#556070" }}>Live monitoring, dashboard summary, and instant violation alerts.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              ...socketBadgeStyles[socketStatus],
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "currentColor",
              }}
            />
            WebSocket {socketStatus}
          </span>
          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: "10px 16px",
              border: "1px solid #d0d5dd",
              borderRadius: "10px",
              backgroundColor: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {summaryError ? (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "12px",
            backgroundColor: "#fff1f2",
            color: "#9f1239",
            border: "1px solid #fecdd3",
          }}
        >
          {summaryError}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        <div style={{ padding: "16px", borderRadius: "14px", backgroundColor: "#0f172a", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.75 }}>Total Violations</div>
          <div style={{ fontSize: "30px", fontWeight: 800, marginTop: "8px" }}>{totalViolations}</div>
        </div>
        <div style={{ padding: "16px", borderRadius: "14px", backgroundColor: "#1d4ed8", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>Students Flagged</div>
          <div style={{ fontSize: "30px", fontWeight: 800, marginTop: "8px" }}>{totalStudents}</div>
        </div>
        <div style={{ padding: "16px", borderRadius: "14px", backgroundColor: "#0f766e", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>Live Alerts</div>
          <div style={{ fontSize: "30px", fontWeight: 800, marginTop: "8px" }}>{liveAlerts.length}</div>
        </div>
      </div>

      <section style={{ padding: "18px", border: "1px solid #e5e7eb", borderRadius: "16px", backgroundColor: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
          <h3 style={{ margin: 0 }}>Live Alerts</h3>
          <span style={{ color: "#64748b", fontSize: "13px" }}>Incoming websocket feed</span>
        </div>
        {liveAlerts.length === 0 ? (
          <p style={{ margin: 0, color: "#64748b" }}>No live alerts yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "0", listStyle: "none", display: "grid", gap: "10px" }}>
            {liveAlerts.map((alert) => (
              <li
                key={alert.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <strong>Student #{alert.student_id}</strong>
                <span style={{ color: "#b42318", fontWeight: 700 }}>{alert.violation_type}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ padding: "18px", border: "1px solid #e5e7eb", borderRadius: "16px", backgroundColor: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
          <h3 style={{ margin: 0 }}>Exam Summary</h3>
          <span style={{ color: "#64748b", fontSize: "13px" }}>Grouped by student</span>
        </div>
        {loadingSummary ? (
          <p style={{ margin: 0 }}>Loading summary...</p>
        ) : summary ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {summary.students.length === 0 ? (
              <p style={{ margin: 0, color: "#64748b" }}>No violations recorded yet.</p>
            ) : (
              summary.students.map((student) => (
                <div
                  key={student.student_id}
                  style={{
                    padding: "14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: "16px" }}>{student.name || `Student #${student.student_id}`}</strong>
                      <p style={{ margin: "6px 0 0", color: "#64748b" }}>{student.email || "No email"}</p>
                    </div>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "fit-content",
                      }}
                    >
                      {student.violation_count} violations
                    </span>
                  </div>

                  <ul style={{ margin: "12px 0 0", paddingLeft: "18px" }}>
                    {student.violations.map((violation) => (
                      <li key={violation.id} style={{ marginBottom: "4px" }}>{violation.violation_type}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#64748b" }}>No summary loaded yet.</p>
        )}
      </section>
    </div>
  );
};

export default TeacherDashboard;
