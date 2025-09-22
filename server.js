const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        // Broadcast position to all clients
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });
    ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://localhost:8080');
