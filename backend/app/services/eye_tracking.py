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
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
        )
        return tasks.vision.FaceLandmarker.create_from_options(options)
    except Exception:
        return None


def _build_face_mesh():
    """Return legacy MediaPipe face mesh when available, otherwise None."""
    solutions = getattr(mp, "solutions", None)
    if solutions is None:
        return None

    return solutions.face_mesh.FaceMesh()


mp_mesh = _build_face_mesh()
task_face_landmarker = _build_face_landmarker()

def detect_gaze(image_bytes):
    if task_face_landmarker is None and mp_mesh is None:
        return {
            "looking_away": False
        }

    np_arr = np.frombuffer(image_bytes, np.uint8)

    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        return {
            "looking_away": False
        }

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    looking_away = False

    if task_face_landmarker is not None:
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        task_result = task_face_landmarker.detect(mp_image)
        if task_result.face_landmarks:
            # Placeholder logic for now.
            looking_away = False
    else:
        results = mp_mesh.process(rgb)
        if results.multi_face_landmarks:
            # Placeholder logic for now.
            looking_away = False

    return {
        "looking_away": looking_away
    }