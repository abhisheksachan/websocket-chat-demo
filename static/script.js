/**
 * Connect - Multi-User Messaging Logic
 * Handles 4 concurrent users in a dashboard view
 */

const userSockets = {};
const activeRooms = {
    'A': 'Friends',
    'B': 'Friends',
    'C': 'Friends',
    'D': 'Private_CD'
};

function init() {
    ['A', 'B', 'C', 'D'].forEach(userId => {
        connectUser(userId);
    });
}

function connectUser(userId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws/${userId}`);

    ws.onopen = () => {
        document.getElementById(`app-${userId}`).querySelectorAll('.dot').forEach(d => d.classList.add('online'));
        console.log(`User ${userId} active.`);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        routeMessage(userId, data);
    };

    ws.onclose = () => {
        document.getElementById(`app-${userId}`).querySelectorAll('.dot').forEach(d => d.classList.remove('online'));
        setTimeout(() => connectUser(userId), 3000);
    };

    userSockets[userId] = ws;
}

function routeMessage(observerId, data) {
    const { sender_id, sender_name, room_id, message } = data;

    // Updated ID matching the new HTML structure: msgs-{userid}-{roomid}
    const containerId = `msgs-${observerId}-${room_id}`;
    const container = document.getElementById(containerId);

    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = `message ${sender_id === observerId ? 'sent' : 'received'}`;

    if (sender_id !== observerId) {
        msgEl.innerHTML = `<div class="msg-meta">${sender_name}</div>${message}`;
    } else {
        msgEl.textContent = message;
    }

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

function sendMessage(userId) {
    const input = document.getElementById(`input-${userId}`);
    const text = input.value.trim();
    const room = activeRooms[userId];
    const ws = userSockets[userId];

    if (text && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            room_id: room,
            message: text
        }));
        input.value = '';
    }
}

/**
 * Switch Rooms within the sidebar
 */
function switchRoom(userId, roomId) {
    activeRooms[userId] = roomId;

    // Update sidebar nav items
    const navItems = document.querySelectorAll(`.nav-item[data-user="${userId}"]`);
    navItems.forEach(n => {
        n.classList.toggle('active', n.getAttribute('data-room') === roomId);
    });

    // Update Header Text
    const header = document.getElementById(`header-room-${userId}`);
    header.textContent = roomId === 'Friends' ? '# Friends' : `@ ${roomId === 'Private_AB' ? (userId === 'A' ? 'Bravo' : 'Alpha') : (userId === 'C' ? 'Delta' : 'Charlie')}`;

    // Toggle viewports
    const viewports = document.querySelectorAll(`[id^="msgs-${userId}-"]`);
    viewports.forEach(v => {
        v.classList.toggle('hidden', v.id !== `msgs-${userId}-${roomId}`);
    });
}

window.onload = () => {
    init();
    ['A', 'B', 'C', 'D'].forEach(id => {
        document.getElementById(`input-${id}`).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(id);
        });
    });
};
