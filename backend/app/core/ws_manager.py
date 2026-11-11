import json
from typing import Any
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # group_id -> dict[WebSocket, dict[str, Any]]
        self._rooms: dict[int, dict[WebSocket, dict[str, Any]]] = {}
        # user_id -> set[WebSocket]
        self._user_sockets: dict[int, set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, group_id: int, user_info: dict[str, Any]):
        await websocket.accept()
        if group_id not in self._rooms:
            self._rooms[group_id] = {}
        self._rooms[group_id][websocket] = user_info

        user_id = user_info.get("user_id")
        if user_id:
            self._user_sockets.setdefault(user_id, set()).add(websocket)

    def disconnect(self, websocket: WebSocket, group_id: int) -> tuple[dict[str, Any] | None, bool]:
        """Disconnects websocket. Returns (user_info, is_completely_offline)."""
        user_info = None
        if group_id in self._rooms:
            user_info = self._rooms[group_id].pop(websocket, None)
            if not self._rooms[group_id]:
                del self._rooms[group_id]

        is_completely_offline = False
        if user_info and "user_id" in user_info:
            uid = user_info["user_id"]
            if uid in self._user_sockets:
                self._user_sockets[uid].discard(websocket)
                if not self._user_sockets[uid]:
                    del self._user_sockets[uid]
                    is_completely_offline = True

        return user_info, is_completely_offline

    def is_user_online(self, user_id: int) -> bool:
        return bool(self._user_sockets.get(user_id))

    def get_online_user_ids_in_group(self, group_id: int) -> list[int]:
        if group_id not in self._rooms:
            return []
        return list({info["user_id"] for info in self._rooms[group_id].values() if "user_id" in info})

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
