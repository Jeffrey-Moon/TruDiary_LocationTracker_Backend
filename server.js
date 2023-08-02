const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const routes = require('./routes');
const User = require('./user');
const Chat = require('./chat');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.use('/api', routes);

const httpServer = http.createServer(app);

// Create a WebSocket server on port 5000
const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', ws => {
    ws.on('message', async message => {
        try {
            const data = JSON.parse(message);
            const chat = new Chat({
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
            });
            await chat.save();

            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } catch (err) {
            console.error(err);
        }
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});

const port = process.env.PORT || 5000;
httpServer.listen(port, () => console.log(`Listening on port ${port}...`));
