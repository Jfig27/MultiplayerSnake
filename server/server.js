
const express = require("express");
const socketio = require('socket.io');
const http = require('http')
const app = express();
const server = http.createServer(app);
const io = socketio(server, {cors: {origin: "*"}});
const {initGame, gameLoop, getUpdatedVelocity} = require('./game');
const {FRAME_RATE} = require('./constants');
const { makeid } = require('./utils')

app.get('/', (req, res) => {
    res.json("API is working!")
} )

const state = {};
const clientRooms = {};

io.on("connection", client => {
    // socket.send("Hello! -from server");
    // socket.emit('init', {data: "hello world!"})

    // socket.emit("message", (data) =>{
    //     console.log(data);
    // })

    


    client.on('keydown', handleKeyDown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms[roomName];

        let allUsers;
        if (room) {
          allUsers = room.sockets;
        }
        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            client.emit('unknownCode');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers')
            return;
        }

        clientRooms[client.id] = roomName;
        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(roomName);
    }

    function handleNewGame(){
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName)

        state[roomName] = initGame();

        client.join(roomName);
        //player number who created room
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeyDown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName){
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch(e){
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
});

function startGameInterval(roomName){
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
    //emit to all clients in room
    io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
    io.sockets.in(room)
    .emit('gameOver', JSON.stringify({winner}));
}

server.listen(process.env.PORT || 3000);