from collections import defaultdict

from fastapi import WebSocket


class AlertManager:
    def __init__(self):
        self._connections = defaultdict(set)

    async def connect(self, exam_id: int, websocket: WebSocket):
        await websocket.accept()
        self._connections[exam_id].add(websocket)

    def disconnect(self, exam_id: int, websocket: WebSocket):
        connections = self._connections.get(exam_id)
        if not connections:
            return

        connections.discard(websocket)
        if not connections:
            self._connections.pop(exam_id, None)

    async def broadcast(self, exam_id: int, payload: dict):
        connections = list(self._connections.get(exam_id, set()))
        for websocket in connections:
            await websocket.send_json(payload)


alert_manager = AlertManager()
