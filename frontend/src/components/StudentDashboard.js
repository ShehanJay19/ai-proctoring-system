import React from "react";
import WebcamFeed from "./WebcamFeed";

const StudentDashboard = ({ token, examId }) => {
  return (
    <div
      style={{
        display: "grid",
        gap: "18px",
        padding: "18px",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>
            Student Proctoring
          </p>
          <h2 style={{ margin: "6px 0 0" }}>Exam #{examId}</h2>
          <p style={{ margin: "6px 0 0", color: "#556070" }}>
            Keep your face visible and stay centered in the camera frame.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              backgroundColor: "#e7f8ef",
              color: "#146c43",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            Monitoring active
          </span>
          <span
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            Token secured
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#0f172a", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.75 }}>Capture cadence</div>
          <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px" }}>Every 3s</div>
        </div>
        <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#1d4ed8", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>Detection</div>
          <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px" }}>AI monitoring</div>
        </div>
        <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#0f766e", color: "white" }}>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>Status</div>
          <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px" }}>Live session</div>
        </div>
      </div>

      <div
        style={{
          padding: "18px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <WebcamFeed token={token} examId={examId} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <strong>Before you begin</strong>
          <p style={{ margin: "8px 0 0", color: "#556070" }}>Use a front-facing camera, keep your face centered, and avoid turning away from the screen.</p>
        </div>
        <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <strong>What is recorded</strong>
          <p style={{ margin: "8px 0 0", color: "#556070" }}>The system stores detected violations for this exam and shares them with the teacher dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
