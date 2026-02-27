// WebSocket connections for both users
let ws1, ws2;

function connect(userId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws/${userId}`);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        displayMessage(data, userId);
    };

    ws.onclose = () => {
        console.log(`Connection closed for User ${userId}. Reconnecting...`);
        setTimeout(() => connect(userId), 2000);
    };

    return ws;
}

// Initial connections
ws1 = connect(1);
ws2 = connect(2);

function displayMessage(data, observerId) {
    const messagesDiv = document.getElementById(`messages-${observerId}`);
    const messageEl = document.createElement('div');

    // Determine the type of message for the current observer
    if (data.sender_id === "System") {
        messageEl.className = 'message system';
    } else if (data.sender_id === observerId) {
        messageEl.className = 'message sent';
    } else {
        messageEl.className = 'message received';
    }

    messageEl.textContent = data.message;
    messagesDiv.appendChild(messageEl);

    // Auto-scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage(userId) {
    const input = document.getElementById(`input-${userId}`);
    const message = input.value.trim();

    if (message) {
        const ws = (userId === 1) ? ws1 : ws2;
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            input.value = '';
        } else {
            alert('WebSocket is not connected. Please wait or refresh.');
        }
    }
}

// Handle Enter key for inputs
document.getElementById('input-1').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(1);
});

document.getElementById('input-2').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(2);
});
