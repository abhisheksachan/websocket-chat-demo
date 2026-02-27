# Nexus Chat | Real-time WebSocket Demo

A premium, real-time chat application demonstrating the power of WebSockets using **FastAPI** and **Vanilla CSS**.

![Nexus Chat Screenshot](./static/preview.png)

## 🚀 Features

- **Real-time Synchronization**: Messages are broadcasted instantly to all connected clients using WebSockets.
- **Dual User Interface**: A split-screen view to simulate two users interacting in real-time.
- **Modern Aesthetics**: Glassmorphism design with sleek gradients and smooth animations.
- **Fast & Lightweight**: Built with FastAPI for high performance and minimal overhead.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, WebSockets (`websockets` library).
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+).
- **Containerization**: Docker & Docker Compose.

## 🏃 Running Locally

### Option 1: Using Python (Native)
1. Initialize virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Option 2: Using Docker 🐳
Run the entire app in a containerized environment:
```bash
docker compose up --build
```
Access the app at [http://localhost:8000](http://localhost:8000)

## 📂 Project Structure
- `main.py`: FastAPI backend and WebSocket logic.
- `static/`: Contains HTML, CSS, and JS assets.
- `Dockerfile`: Container configuration.
- `docker-compose.yml`: Multi-container orchestration.
