"use strict";

// classes
class Ball{
    constructor(x, y, radius){
        this.x = x; // ball x position
        this.y = y; // ball y position
        this.radius = radius; // ball radius
    }

    horizontalCollision(canvasWidth, dx) {
        if(this.x + dx > canvasWidth-this.radius || this.x + dx < this.radius){
            return true;
        }
        return false;
    }

    topCollision(dy){
        // if(this.y + dy > canvasHeight-this.radius || this.y + dy < this.radius){ // vertical, top y bottom
        //     return true;
        // }
        if(this.y + dy < this.radius){
            return true;
        }
        return false;
    }

    bottomCollision(canvasHeight, dy, paddleHeight){
        if(this.y + dy > (canvasHeight-this.radius)-paddleHeight){
            return true;
        }
        return false;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        ctx.fill();
    }
}

class Paddle{
    constructor(height, width, x){
        this.height = height;
        this.width = width;
        this.x = (x-this.width)/2;
    }

    moveRight(canvasWidth){
        if(this.x < canvasWidth-this.width){
            this.x += 5;
        }
    }

    moveLeft(){
        if(this.x > 0){
            this.x -= 5;
        }
    }

    draw(ctx, canvasHeight){
        ctx.fillRect(this.x, canvasHeight-this.height, this.width, this.height);
    }
}

class Brick{
    static rowCount; // filas
    static columnCount; // columnas
    static width; // ancho
    static height; // alto
    static padding; // padding del ladrillo, espacio de separacion entre ladrillos
    static offsetTop; // margin arriba
    static offsetLeft; // margin a la izquierda

    constructor(x, y){
        this.x = x;
        this.y = y;
        this.status = 1; // 1 = visible, 0 = invisible (destruido)
    }

    draw(ctx){
        ctx.fillRect(this.x, this.y, Brick.width, Brick.height);
    }
}

// variables
let canvas, ctx;
let ball;
let dx, dy;
let paddle;
let rightPressed;
let leftPressed;
let bricks;
let gameInterval;
let score;
let lives;

// cuerpo
window.addEventListener("load", ()=>{
    // canvas config
    canvas = document.getElementById("canvas");
    if(canvas.getContext){
        ctx = canvas.getContext("2d"); // getting canvas context

        // score and lives
        score = 0;
        lives = 3;

        // defining ball
        ball = new Ball(canvas.width/2, canvas.height-30, 10);

        dx = -1; // ball x movement
        dy = -2; // ball y movement
        
        // deffining paddle
        paddle = new Paddle(10, 75, canvas.width);

        // paddle events
        rightPressed = false;
        leftPressed = false;
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener("mousemove", mouseMoveHandler, false);

        // bricks
        Brick.rowCount = 3;
        Brick.columnCount = 5;
        Brick.width = 75;
        Brick.height = 20;
        Brick.padding = 10;
        Brick.offsetTop = 30;
        Brick.offsetLeft = 30;
        setBricks();

        // setting drawing animations
        ctx.fillStyle = "#0095DD";
        ctx.font = "16px Arial";
        // draw(); para requestAnimationFrame
        gameInterval = setInterval(draw, 20);
    }
}, false);

// funciones
function setBricks() {
    bricks = [];
    for(let row = 0; row<Brick.rowCount; row++){
        bricks[row] = [];
        for(let col = 0; col<Brick.columnCount; col++){
            bricks[row][col] = new Brick((col*(Brick.width+Brick.padding))+Brick.offsetLeft, // x = (numero columna * (ancho del ladrillo + padding del ladrillo)) + margen izquierdo del ladrillo 
                (row*(Brick.height+Brick.padding))+Brick.offsetTop); // y = (numero fila * (altura del ladrillo + padding del ladrillo)) + margen superior del ladrillo
        }
    }
}

function keyDownHandler(e) {
    let evento = e || window.event; // compatibilidad

    if(evento.keyCode == 39){ // fecha derecha
        rightPressed = true;
    } else if(evento.keyCode == 37){ // fecha izquierda
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    let evento = e || window.event; // compatibilidad

    if(evento.keyCode == 39){ // fecha derecha
        rightPressed = false;
    } else if(evento.keyCode == 37){ // fecha izquierda
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    let evento = e || window.event; // compatibilidad
    let relativeX = evento.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width){
        // if(relativeX < canvas.width/2){
            // mitad izquierda
            // paddle.x = relativeX;
        // } else {
            // mitad derecha
            paddle.x = relativeX - paddle.width/2;
        // }
        
    }
}

function drawScore() {
    ctx.fillText("Score: "+score, 8, 20);
}

function drawLives() {
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

function draw(){
    // let redraw = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bricks.map((rowBricks)=>{
        rowBricks.map((brick)=>{
            if(brick.status){
                brick.draw(ctx);
                if((ball.x + ball.radius) > brick.x // colision parte izquierda brick 
                    && (ball.x - ball.radius) < brick.x+Brick.width // colision parte derecha brick
                    && (ball.y + ball.radius) > brick.y // colision parte superior brick
                    && (ball.y - ball.radius) < brick.y+Brick.height) { //colision parte inferior brick
                    // colision
                    dy = -dy;
                    brick.status = 0; // el ladrillo desaparece
                    if(++score == Brick.rowCount*Brick.columnCount){ // ha ganado
                        // redraw = false;
                        alert("Has ganado");
                    }
                }
            }
            
        });
    });

    drawScore();
    drawLives();
    ball.draw(ctx);
    paddle.draw(ctx, canvas.height);
    if(ball.horizontalCollision(canvas.width, dx)){ // colision con las paredes izquierda o derecha
        dx = -dx;
    }

    if(ball.topCollision(dy)){
        // colision contra la pared superior
        dy = -dy;
    } else if(ball.bottomCollision(canvas.height, dy, paddle.height)){
        // va a colisionar contra la pared inferior
        if((ball.x+ball.radius) > paddle.x // parte izquierda pala
            && (ball.x-ball.radius) < paddle.x+paddle.width){ // parte derecha pala
            // colision de la pala con la bola, resultado: rebota y vuelve a subir (restar) en el eje y
            dy = -dy;
        } else {
            // la pala no ha colisionado, resultado: la bola ha caido
            lives--; // pierde una vida
            if(lives){
                // si aun hay vidas (lives > 0)
                ball.x = canvas.width/2;
                ball.y = canvas.height-30;
                dx = 2;
                dy = -2;
                paddle.x = (canvas.width-paddle.width)/2;
            } else {
                // sin vidas (0)
                clearInterval(gameInterval);
                // redraw = false;
                alert("la bola se ha caido");
            }
        }   
    } else {
        if(rightPressed){ // movimiento a la izquierda
            paddle.moveRight(canvas.width);
        }
    
        if(leftPressed){ // movimiento a la derecha
            paddle.moveLeft();
        }
    
        ball.x += dx;
        ball.y += dy;
    }
    // if(redraw) requestAnimationFrame(draw); // setInterval es mas compatible
}