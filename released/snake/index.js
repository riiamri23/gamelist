const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const headX = 10;
const headY = 10;
const parts = [];

const appleX = 5;
const appleY = 5;
const tileCount = 20;
const tileSize = canvas.width / tileCount - 2;
let velocityX = 0;
let velocityY = 0;


const speed = 7;

const gulpSound = new Audio("assets/gulp.mp3");
const gameOverSound = new Audio("assets/game-over.mp3")

class SnakeParts{
    constructor(X,Y){
        this.X = X;
        this.Y = Y;
    }
}

class Snake{
    constructor(headX, headY, tileCount, tileSize, color, parts){
        this.headX = headX;
        this.headY = headY;
        this.tileCount = tileCount;
        this.tileSize = tileSize;
        this.color = color;
        this.parts = parts;
        this.tailLength = 0;
    }

    draw = function(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.headX * this.tileCount
            , this.headY * this.tileCount
            , this.tileSize
            , this.tileSize
        );
        this.drawTail();


        ctx.closePath();
    }

    addTail = function(isCollision){
        if(isCollision) this.tailLength++;
    }

    drawTail = function(){
        for(let i=0;i < this.parts.length;i++){
            const snakePart = this.parts[i];
            ctx.fillStyle = "grey";
            ctx.fillRect(
                snakePart.X * this.tileCount
                ,snakePart.Y * this.tileCount
                , this.tileSize
                , this.tileSize
            );
        }
        this.parts.push(new SnakeParts(this.headX, this.headY));

        while(this.parts.length > this.tailLength)
            this.parts.shift();
    }

    changePosition = function(velocityX, velocityY){
        this.headX = this.headX + velocityX;
        this.headY = this.headY + velocityY;
    }
}

class Apple{
    constructor(appleX, appleY, tileCount, tileSize){
        this.appleX = appleX;
        this.appleY = appleY;
        this.tileCount = tileCount;
        this.tileSize = tileSize;

    }

    draw = function(){
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(this.appleX * this.tileCount, this.appleY * this.tileCount, this.tileSize, this.tileSize);
        ctx.closePath();
    }

    randomAppear = function(isCollision){
        if(isCollision){
            this.appleX = Math.floor(Math.random() * tileCount);
            this.appleY = Math.floor(Math.random() * tileCount);
        }
        this.draw();
    }
}

class Score{
    constructor(totalScore){
        this.totalScore = totalScore;
    }

    draw = function(){
        ctx.fillStyle = "white";
        ctx.font = "10px Verdana";
        ctx.fillText("Score " + this.totalScore, 0, 10);
    }

    drawHighestScore = function(){
        ctx.fillStyle = "white";
        ctx.font = "10px Verdana";
        const highestScore = localStorage.getItem("highestScore") !== null ? localStorage.getItem("highestScore") : 0;

        ctx.fillText("Highest Score " + highestScore, canvas.width-100, 10);
    }

    incScore = function(isCollision){
        if(isCollision) this.totalScore++;
    }

    setHighestScore = function(){
        localStorage.setItem("highestScore", this.totalScore);
    }
}
const snake = new Snake(
    headX,
    headY,
    tileCount,
    tileSize,
    "white",
    parts,
);

const apple = new Apple(
    appleX,
    appleY,
    tileCount,
    tileSize
);

const score = new Score(0);

function checkGameOver(snake){
    let isOver = false;

    // check collidate with wall;
    if(snake.headX < 0 
        || snake.headX === tileCount 
        || snake.headY < 0 
        || snake.headY === tileCount
        ) isOver = true;

    // check collidate with tail;
    for(let i = 0; i < snake.parts.length; i++)
        if(snake.headX === snake.parts[i].X 
            && snake.headY === snake.parts[i].Y
            ) isOver = true;

    if(isOver){
        // create label on screen
        ctx.fillStyle = "white";
        ctx.font = "50px Verdana";
        
        ctx.fillText("Game Over", canvas.width / 6.5, canvas.height / 2);
    }

    return isOver;
}

checkOnCollision = function(snake, apple){
    if(snake.headX === apple.appleX 
        && snake.headY === apple.appleY
        ) {
            gulpSound.play();
            return true;
        }
    
    return false;
}


function clearScreen(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

document.body.addEventListener('keydown', keyDown);

function keyDown(event){
    if(event.keyCode === 38){ // up
        if(velocityY === 1) return;
        velocityX = 0;
        velocityY = -1;
    }
    if(event.keyCode === 40){ // down
        if(velocityY === -1) return;
        velocityX = 0;
        velocityY = 1;
    }

    if(event.keyCode === 37){ // left
        if(velocityX === 1) return;
        velocityX = -1;
        velocityY = 0;
    }
    if(event.keyCode === 39){ // right
        if(velocityX === -1) return;
        velocityX = 1;
        velocityY = 0;
    }

    
}

function drawGame(){
    snake.changePosition(velocityX, velocityY);

    // check game over
    let isOver = checkGameOver(snake);
    if(isOver) {
        gameOverSound.play();

        score.setHighestScore();
        score.drawHighestScore();
        return;
    }
    clearScreen();

    snake.draw();
    score.draw();
    score.drawHighestScore();

    let collision = checkOnCollision(snake, apple);
    apple.randomAppear(collision);
    snake.addTail(collision);
    score.incScore(collision);

    setTimeout(drawGame, 1000/speed);
}

drawGame();
