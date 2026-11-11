import json
from typing import Any
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # group_id -> dict[WebSocket, dict[str, Any]]
        self._rooms: dict[int, dict[WebSocket, dict[str, Any]]] = {}

    async def connect(self, websocket: WebSocket, group_id: int, user_info: dict[str, Any]):
        await websocket.accept()
        if group_id not in self._rooms:
            self._rooms[group_id] = {}
        self._rooms[group_id][websocket] = user_info

    def disconnect(self, websocket: WebSocket, group_id: int) -> dict[str, Any] | None:
        user_info = None
        if group_id in self._rooms:
            user_info = self._rooms[group_id].pop(websocket, None)
            if not self._rooms[group_id]:
                del self._rooms[group_id]
        return user_info

    async def broadcast_to_group(
        self,
        group_id: int,
        data: dict[str, Any],
        exclude: WebSocket | None = None,
    ):
        if group_id not in self._rooms:
            return
        dead: list[WebSocket] = []
        for ws in list(self._rooms[group_id].keys()):
            if exclude and ws == exclude:
                continue
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, group_id)


manager = ConnectionManager()
