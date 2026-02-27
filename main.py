from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import json
from typing import List

# WebSocket chat backend
app = FastAPI()


# Mount the static directory to serve CSS and JS
app.mount("/static", StaticFiles(directory="static"), name="static")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def get():
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_info = {
                "sender_id": client_id,
                "message": data
            }
            await manager.broadcast(json.dumps(message_info))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Optional: notify others a user left
        await manager.broadcast(json.dumps({
            "sender_id": "System",
            "message": f"User {client_id} left the chat"
        }))
