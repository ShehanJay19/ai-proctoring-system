from ultralytics import YOLO
import cv2
import numpy as np


model = YOLO("yolov8n.pt")

def detect_objects(image_bytes):
    
    np_arr = np.frombuffer(image_bytes, np.uint8)

    
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

   
    results = model(img)

    phone_detected = False

    
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])   # class ID

         
            if cls == 67:
                phone_detected = True

    return {
        "phone_detected": phone_detected
    }