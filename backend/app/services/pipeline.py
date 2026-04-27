from app.services.face_detection import detect_faces
from app.services.eye_tracking import detect_gaze
from app.services.object_detection import detect_objects
from app.services.liveness import check_liveness

def analyze_frame(image_bytes):
    result = {}

    # Step 1: Detect faces
    face = detect_faces(image_bytes)
    result.update(face)

    # If no face → stop early (performance optimization)
    if not face["face_detected"]:
        return result

    # Step 2: Run other AI modules
    gaze = detect_gaze(image_bytes)
    obj = detect_objects(image_bytes)
    live = check_liveness(image_bytes)

    # Combine all results
    result.update(gaze)
    result.update(obj)
    result.update(live)

    # Step 3: Apply cheating rules
    violations = []

    # Multiple faces = cheating
    if face["face_count"] > 1:
        violations.append("Multiple faces detected")

    # Phone usage = cheating
    if obj["phone_detected"]:
        violations.append("Phone detected")

    # Looking away = suspicious
    if gaze["looking_away"]:
        violations.append("Looking away")

    # Attach violations list
    result["violations"] = violations

    return result