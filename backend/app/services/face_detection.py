import cv2
import mediapipe as mp
import numpy as np

mp_face=mp.solutions.face_detection.FaceDetection(
    model_selection=0,
    min_detection_confidence=0.5
)

def detect_faces(image_bytes):
    np_arr=np.frombuffer(image_bytes, np.uint8)
    img=cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = mp_face.process(rgb)
    
    face_count=len(results.detections) if results.detections else 0
    
    violation=None
    if face_count == 0:
        violation="No face detected"
    elif face_count > 1:
        violation="Multiple faces detected"
    
    return {
        "face_detected": face_count>0,
        "face_count": face_count,
        "violations": violation
    }