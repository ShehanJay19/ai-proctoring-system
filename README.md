# 📌 AI Exam Proctoring System

An AI-powered online exam proctoring system that monitors students in real-time using computer vision and detects suspicious behavior such as multiple faces, phone usage, and gaze deviation.

---

## 🚀 Features

* 👤 Face Detection
  Detects whether a student is present and flags cases with no face or multiple faces.

* 👁️ Eye Gaze Tracking
  Identifies if the student is looking away from the screen.

* 📱 Phone Detection
  Uses object detection to identify mobile phone usage during exams.

* 🧠 Modular AI Pipeline
  Scalable architecture combining multiple AI models into a single pipeline.

* 🌐 REST API (FastAPI)
  Provides an API endpoint (`/analyze`) for processing image frames.

* ⚡ Real-Time Monitoring Ready
  Designed to work with live webcam frames by sending images at intervals.

---

## 🧠 Tech Stack

**Backend**

* Python
* FastAPI
* OpenCV
* MediaPipe
* YOLOv8 (Ultralytics)

**Concepts Used**

* Face Detection
* Facial Landmark Tracking
* Object Detection
* Rule-Based Decision System

---

## 🏗️ Architecture

```
Image Input → Face Detection → Gaze Detection → Object Detection → Liveness Check → Violation Engine → Output
```

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── main.py
│   ├── services/
│   │   ├── face_detection.py
│   │   ├── eye_tracking.py
│   │   ├── object_detection.py
│   │   ├── liveness.py
│   │   └── pipeline.py
```

---

## 📡 API Endpoint

### POST `/analyze`

Upload an image frame for analysis.

### Example Response

```
{
  "face_detected": true,
  "face_count": 1,
  "looking_away": false,
  "phone_detected": true,
  "is_live": true,
  "violations": ["Phone detected"]
}
```

---

## ⚙️ Setup Instructions

```
git clone https://github.com/your-username/ai-proctoring-system
cd ai-proctoring-system/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📌 Future Improvements

* 🔐 Authentication system (JWT)
* 👨‍🏫 Teacher dashboard with real-time alerts
* 🔴 WebSocket-based live monitoring
* 🧠 Advanced liveness detection (blink/head movement)
* 📊 Violation scoring system

---

## 🎯 Goal

To build a scalable, real-world AI proctoring system using modern backend architecture and computer vision techniques.

---

## ⚠️ Disclaimer

This project is for educational and research purposes only. It should not be used in high-stakes environments without further validation and testing.
