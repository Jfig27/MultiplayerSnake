// const { reset } = require("nodemon");
// import io  from "socket.io-client";
// const io = require('socket.io-client');

const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';
const SNAKE_COLOR_2 = 'red';

const socket = io('https://murmuring-sierra-96339.herokuapp.com/');

socket.on("message", () => {
    console.log("heyyy -from client");
});
socket.on("message", data => {
    console.log(data);
})

socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});
  

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('TooManyPlayers', handleTooManyPlayers);


const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame(){
    socket.emit('newGame');
    init();
}

function joinGame(){
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    canvas = document.getElementById('gameArea');
    ctx = canvas.getContext('2d');

    //set canvas size
    canvas.width = canvas.height = 600;

    //paint canvas with color
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) {
    console.log(e.keyCode);
    socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    //splits 600px canvas into 20 segments
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOR;
    //convert food position from gamespace to pixel space
    //then make width and height of square to be that size
    ctx.fillRect(food.x * size, food.y * size, size, size)

    paintplayer(state.players[0], size, SNAKE_COLOR);
    paintplayer(state.players[1], size, SNAKE_COLOR_2);
}

function paintplayer(playerState, size, color) {
    const snake = playerState.snake;

    ctx.fillStyle = color;
    //loop through snake cells/body
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleGameState(gameState){
    if(!gameActive){
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive){
        return;
    }
    data = JSON.parse(data);

    if (data.winner === playerNumber) {
        alert("You win!")
    } else {
    alert("You lose.")
    }
    gameActive = false;
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame(){
    reset();
    alert('Unknown game code')
}

function handleTooManyPlayers(){
    reset();
    alert("This game is already in progress")
}

function reset(){
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = 'block';
    gameScreen.style.display = "none";
}