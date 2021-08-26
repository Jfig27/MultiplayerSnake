const { GRID_SIZE} = require("./constants")

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame() {
    const state = createGameState()
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            //position coordinates
            pos: { 
                x: 3,
                y: 10,
            },
            //velocity
            vel: {
                x: 1,
                y: 0,
            },
            //array for every segment in body of snake
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
            ],
        }, {
            pos: { 
                x: 9,
                y: 14,
            },
            //velocity
            vel: {
                x: 0,
                y: 0,
            },
            //array for every segment in body of snake
            snake: [
                {x: 11, y: 14},
                {x: 10, y: 14},
                {x: 9, y: 14},
            ],
        }],
        //coordinate for food
        food: {},
        //gameworld coordinate. 20 squares in grid
        gridsize: GRID_SIZE,
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    //update player pos based on velocity
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    //check if player one is out of bounds
    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2;
    }
    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return 1;
    }
    //make snake bigger if position is equal to food
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y ) {
        playerOne.snake.push({...playerOne.pos});
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        randomFood(state);
    }
    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y ) {
        playerTwo.snake.push({...playerTwo.pos});
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        randomFood(state);
    }


    if (playerOne.vel.x || playerOne.vel.y) {
        for(let cell of playerOne.snake) {
            //if one of the cells of the snake overlaps with another, the player loses
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y){
                return 2;
            }
        }
        //still in game so move snake by pushing array and removing last item
        playerOne.snake.push({...playerOne.pos})
        playerOne.snake.shift();
    }
    if (playerTwo.vel.x || playerTwo.vel.y) {
        for(let cell of playerTwo.snake) {
            //if one of the cells of the snake overlaps with another, the player loses
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y){
                return 1;
            }
        }
        //still in game so move snake by pushing array and removing last item
        playerTwo.snake.push({...playerTwo.pos})
        playerTwo.snake.shift();
    }
    //returning false because there is no winner
    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    }

    state.food = food;

    //place food anywehre except for snake
    for(let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }
    for(let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }
}

function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
        case 37: case 65: { //left
            return{x: -1, y: 0};
        }
        case 38: case 87: { //up
            return{x: 0, y: -1};
        }
        case 39: case 68: { //right
            return{x: 1, y: 0};
        }
        case 40: case 83: { //down
            return{x: 0, y: 1};
        }
    }
}