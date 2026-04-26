import cv2
import mediapipe as mp
import numpy as np
from pathlib import Path


MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "face_landmarker.task"


def _build_face_landmarker():
    """Return MediaPipe Tasks face landmarker when model is present."""
    if not MODEL_PATH.exists():
        return None

    tasks = getattr(mp, "tasks", None)
    if tasks is None:
        return None

    try:
        base_options = tasks.BaseOptions(model_asset_path=str(MODEL_PATH))
        options = tasks.vision.FaceLandmarkerOptions(
            base_options=base_options,
            num_faces=5,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
        )
        return tasks.vision.FaceLandmarker.create_from_options(options)
    except Exception:
        return None


def _build_face_detector():
    """Return legacy MediaPipe detector when available, otherwise None."""
    solutions = getattr(mp, "solutions", None)
    if solutions is None:
        return None

    return solutions.face_detection.FaceDetection(
        model_selection=0,
        min_detection_confidence=0.5,
    )


task_face_landmarker = _build_face_landmarker()
mp_face = _build_face_detector()


def _build_haar_face_detector():
    """Create OpenCV Haar cascade detector as a robust fallback."""
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    detector = cv2.CascadeClassifier(cascade_path)
    if detector.empty():
        return None
    return detector


haar_face = _build_haar_face_detector()

def detect_faces(image_bytes):
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    if task_face_landmarker is not None:
        backend = "mediapipe_tasks_face_landmarker"
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        task_result = task_face_landmarker.detect(mp_image)
        face_count = len(task_result.face_landmarks) if task_result.face_landmarks else 0
    elif mp_face is not None:
        backend = "mediapipe_solutions_face_detection"
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = mp_face.process(rgb)
        face_count = len(results.detections) if results.detections else 0
    elif haar_face is not None:
        backend = "opencv_haar_cascade_fallback"
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = haar_face.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
        face_count = len(faces)
    else:
        return {
            "face_detected": False,
            "face_count": 0,
            "face_detection_backend": "none",
            "violations": "Face detection unavailable: no compatible detector loaded",
        }

    violation = None
    if face_count == 0:
        violation = "No face detected"
    elif face_count > 1:
        violation = "Multiple faces detected"

    return {
        "face_detected": face_count > 0,
        "face_count": face_count,
        "face_detection_backend": backend,
        "violations": violation,
    }