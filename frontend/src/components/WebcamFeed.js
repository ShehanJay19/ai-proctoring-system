import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const WebcamFeed = ({ token, examId }) => {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const faceStatus = result?.face_detected ? "Face detected" : "No face detected";
  const backendLabel = result?.face_detection_backend || "Waiting for scan";

  // Capture and send frame every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      captureAndSend();
    }, 3000);

    return () => clearInterval(interval);
  }, [token, examId]);

  const captureAndSend = async () => {
    if (!webcamRef.current) return;

    if (!webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
      return;
    }

    // Take screenshot from webcam
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;

    if (!token) {
      setError("Please log in first to get a token.");
      return;
    }

    // Convert base64 → blob
    const blob = await fetch(imageSrc).then(res => res.blob());

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      setIsAnalyzing(true);
      setError("");
      const response = await axios.post(
        `http://127.0.0.1:8000/analyze?exam_id=${examId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data ?? {});
    } catch (error) {
      console.error("Error sending frame:", error);
      setError(error.message || "Failed to analyze frame");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "16px" }}>
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
            Webcam Scanner
          </p>
          <h3 style={{ margin: "6px 0 0" }}>Live capture in progress</h3>
          <p style={{ margin: "6px 0 0", color: "#556070" }}>
            A frame is captured every 3 seconds and sent to the backend for monitoring.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              backgroundColor: isAnalyzing ? "#fff4e5" : "#e7f8ef",
              color: isAnalyzing ? "#8a5b00" : "#146c43",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            {isAnalyzing ? "Analyzing frame" : "Monitoring active"}
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
            Exam #{examId}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1.4fr) minmax(260px, 0.9fr)",
          gap: "16px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            padding: "14px",
            borderRadius: "18px",
            backgroundColor: "#0b1220",
            border: "1px solid #182235",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.22)",
          }}
        >
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
            style={{ width: "100%", borderRadius: "14px", display: "block" }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gap: "12px",
            padding: "16px",
            borderRadius: "18px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div>
            <h4 style={{ margin: 0 }}>Current scan</h4>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>Backend model and current frame status.</p>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Face status</div>
              <div style={{ fontWeight: 800, marginTop: "6px" }}>{faceStatus}</div>
            </div>
            <div style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Detection backend</div>
              <div style={{ fontWeight: 800, marginTop: "6px" }}>{backendLabel}</div>
            </div>
          </div>

          {error ? (
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
              {error}
            </div>
          ) : null}

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              border: "1px solid #dbeafe",
            }}
          >
            <div style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 700, marginBottom: "6px" }}>Status</div>
            <div style={{ color: "#0f172a", fontWeight: 600 }}>
              {isAnalyzing ? "A new frame is being analyzed." : "Waiting for the next capture cycle."}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "18px",
          borderRadius: "18px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <h4 style={{ margin: 0 }}>Latest analysis result</h4>
          <span style={{ color: "#64748b", fontSize: "13px" }}>Updated every scan</span>
        </div>

        {result ? (
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Face detected</div>
                <div style={{ fontWeight: 800, marginTop: "6px" }}>{String(result.face_detected)}</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Face count</div>
                <div style={{ fontWeight: 800, marginTop: "6px" }}>{result.face_count}</div>
              </div>
              <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Backend</div>
                <div style={{ fontWeight: 800, marginTop: "6px" }}>{result.face_detection_backend}</div>
              </div>
            </div>

            <div style={{ padding: "14px", borderRadius: "14px", backgroundColor: "#0f172a", color: "white" }}>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>Violations</div>
              <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "8px" }}>
                {result.violations ? result.violations : "None"}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, color: "#64748b" }}>
            {isAnalyzing ? "Analyzing frame..." : "Waiting for the first analysis result..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;