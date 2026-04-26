import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const WebcamFeed = () => {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Capture and send frame every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      captureAndSend();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const captureAndSend = async () => {
    if (!webcamRef.current) return;

    if (!webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
      return;
    }

    // Take screenshot from webcam
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;

    // Convert base64 → blob
    const blob = await fetch(imageSrc).then(res => res.blob());

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      setIsAnalyzing(true);
      setError("");
      const response = await axios.post(
        "http://127.0.0.1:8000/analyze",
        formData
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
    <div style={{ textAlign: "center" }}>
      <h2>AI Proctoring System</h2>

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
      />

      <div style={{ marginTop: "20px" }}>
        <h3>Result:</h3>
        {error ? (
          <p style={{ color: "crimson", fontWeight: 600 }}>{error}</p>
        ) : result ? (
          <pre>{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p>{isAnalyzing ? "Analyzing..." : "Waiting for first analysis result..."}</p>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;