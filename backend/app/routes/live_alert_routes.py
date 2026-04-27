from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.auth.dependencies import decode_access_token
from app.realtime import alert_manager

router = APIRouter()


@router.websocket("/ws/violations/{exam_id}")
async def violation_alerts_socket(websocket: WebSocket, exam_id: int):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = decode_access_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    if payload.get("role") != "teacher":
        await websocket.close(code=1008)
        return

    await alert_manager.connect(exam_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        alert_manager.disconnect(exam_id, websocket)
