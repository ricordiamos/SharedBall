// game.js
// WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

// Object to store positions
const objects = {
    ball: { x: 400, y: 300 },
    A01: { x: 100, y: 100 },
    // Add A02-A20, B01-B20 with initial positions
    B01: { x: 600, y: 100 }
    // Add other objects as needed
};

// Initialize WebSocket
socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && objects[data.id]) {
        objects[data.id].x = data.x;
        objects[data.id].y = data.y;
        updatePosition(data.id, data.x, data.y);
    }
};

// Update DOM element position
function updatePosition(id, x, y) {
    const element = document.getElementById(id);
    if (element) {
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }
}

// Draggable functionality using interact.js
function makeDraggable(id) {
    interact(`#${id}`)
        .draggable({
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.style.left) || objects[id].x) + event.dx;
                    const y = (parseFloat(target.style.top) || objects[id].y) + event.dy;

                    objects[id].x = x;
                    objects[id].y = y;
                    target.style.left = `${x}px`;
                    target.style.top = `${y}px`;

                    // Send position update to server
                    socket.send(JSON.stringify({ id, x, y }));
                }
            }
        });
}

// Initialize draggables
['ball', 'A01', 'B01' /* Add other IDs */].forEach(id => {
    makeDraggable(id);
    updatePosition(id, objects[id].x, objects[id].y);
});

// Collision detection
function detectCollision() {
    const ball = document.getElementById('ball');
    const hitText = document.getElementById('hitText');
    const ballRect = ball.getBoundingClientRect();

    const areas = ['golx', 'goly', 'lateral1x', 'lateral2x' /* Add other areas */];
    areas.forEach(areaId => {
        const area = document.getElementById(areaId);
        const areaRect = area.getBoundingClientRect();

        if (isCollision(ballRect, areaRect)) {
            // Reset all areas
            areas.forEach(id => document.getElementById(id).style.background = 'gray');
            // Highlight current area
            area.style.background = 'yellow';
            hitText.textContent = areaId === 'golx' || areaId === 'goly' ? 'GOL!' : ' ';
        }
    });

    // Player collision with sound (simulated)
    ['A01', 'B01' /* Add other players */].forEach(playerId => {
        const player = document.getElementById(playerId);
        const playerRect = player.getBoundingClientRect();
        if (isCollision(ballRect, playerRect)) {
            // Play sound (requires audio files)
            new Audio(`sounds/${playerId}.mp3`).play();
        }
    });
}

function isCollision(rect1, rect2) {
    return rect1.left < rect2.right &&
           rect1.right > rect2.left &&
           rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top;
}

// Run collision detection on animation frame
function gameLoop() {
    detectCollision();
    requestAnimationFrame(gameLoop);
}
gameLoop();
