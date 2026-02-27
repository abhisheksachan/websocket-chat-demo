from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import json
from typing import List, Dict, Set

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Define who belongs to which room
# "Friends" replaces the old "General"
ROOM_CONFIG = {
    "Friends": {"A", "B", "C"},
    "Private_AB": {"A", "B"},
    "Private_CD": {"C", "D"},
}

USER_NAMES = {
    "A": "Alpha",
    "B": "Bravo",
    "C": "Charlie",
    "D": "Delta"
}

class ConnectionManager:
    def __init__(self):
        self.active_users: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_users[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_users:
            del self.active_users[user_id]

    async def send_to_room(self, sender_id: str, room_id: str, message: str):
        if room_id not in ROOM_CONFIG: return
        
        subscribers = ROOM_CONFIG[room_id]
        payload = json.dumps({
            "sender_id": sender_id,
            "sender_name": USER_NAMES.get(sender_id, sender_id),
            "room_id": room_id,
            "message": message
        })

        for user_id in subscribers:
            if user_id in self.active_users:
                await self.active_users[user_id].send_text(payload)

manager = ConnectionManager()

@app.get("/")
async def get():
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            target_room = msg_data.get("room_id")
            message_text = msg_data.get("message")
            await manager.send_to_room(user_id, target_room, message_text)
    except WebSocketDisconnect:
        manager.disconnect(user_id)
