const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const shootButton = document.getElementById("shootButton");
const restartButton = document.getElementById("restartButton");

// --------------------------------------------------
// CANVAS
// --------------------------------------------------

canvas.width = 1000;
canvas.height = 600;


// --------------------------------------------------
// GAME VARIABLES
// --------------------------------------------------

let score = 0;

let mouseX = 500;
let mouseY = 300;

let isShooting = false;

let scoredThisShot = false;


// --------------------------------------------------
// PHYSICS
// --------------------------------------------------

const gravity = 0.35;


// --------------------------------------------------
// BALL
// --------------------------------------------------

const ball = {

    x: 150,
    y: 500,

    radius: 20,

    velocityX: 0,
    velocityY: 0,

    color: "#f97316"
};


// --------------------------------------------------
// HOOP
// --------------------------------------------------

const hoop = {

    x: 760,
    y: 230,

    width: 110,

    rimRadius: 8,

    backboardWidth: 15,
    backboardHeight: 150
};


// --------------------------------------------------
// RESET BALL
// --------------------------------------------------

function resetBall() {

    ball.x = 150;
    ball.y = 500;

    ball.velocityX = 0;
    ball.velocityY = 0;

    isShooting = false;

    scoredThisShot = false;
}


// --------------------------------------------------
// MOUSE POSITION
// --------------------------------------------------

canvas.addEventListener("mousemove", function(event) {

    const rect = canvas.getBoundingClientRect();

    mouseX =
        (event.clientX - rect.left)
        * (canvas.width / rect.width);

    mouseY =
        (event.clientY - rect.top)
        * (canvas.height / rect.height);

});


// --------------------------------------------------
// SHOOT
// --------------------------------------------------

function shoot() {

    if (isShooting) {
        return;
    }

    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;

    const distance = Math.sqrt(
        dx * dx + dy * dy
    );

    if (distance === 0) {
        return;
    }

    // Shooting strength
    const power = 0.18;

    ball.velocityX = dx * power;
    ball.velocityY = dy * power;

    isShooting = true;

    scoredThisShot = false;
}


// --------------------------------------------------
// CLICK CANVAS TO SHOOT
// --------------------------------------------------

canvas.addEventListener("click", shoot);


// --------------------------------------------------
// SHOOT BUTTON
// --------------------------------------------------

shootButton.addEventListener("click", shoot);


// --------------------------------------------------
// RESTART BUTTON
// --------------------------------------------------

restartButton.addEventListener("click", function() {

    score = 0;

    scoreElement.textContent = score;

    resetBall();

});


// --------------------------------------------------
// COLLISION WITH FLOOR
// --------------------------------------------------

function checkFloorCollision() {

    const floorY = canvas.height - 60;

    if (ball.y + ball.radius >= floorY) {

        ball.y = floorY - ball.radius;

        ball.velocityY *= -0.55;

        ball.velocityX *= 0.85;

        // Stop tiny movements
        if (Math.abs(ball.velocityY) < 1) {
            ball.velocityY = 0;
        }
    }
}


// --------------------------------------------------
// COLLISION WITH BACKBOARD
// --------------------------------------------------

function checkBackboardCollision() {

    const boardX = hoop.x + hoop.width;

    const boardTop = hoop.y - 80;

    const boardBottom = hoop.y + 70;

    if (

        ball.x + ball.radius > boardX &&

        ball.x - ball.radius < boardX + hoop.backboardWidth &&

        ball.y > boardTop &&

        ball.y < boardBottom

    ) {

        ball.x = boardX - ball.radius;

        ball.velocityX *= -0.7;
    }
}


// --------------------------------------------------
// DISTANCE BETWEEN TWO POINTS
// --------------------------------------------------

function distanceBetween(x1, y1, x2, y2) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(
        dx * dx + dy * dy
    );
}


// --------------------------------------------------
// RIM COLLISION
// --------------------------------------------------

function checkRimCollision() {

    const leftRimX = hoop.x;
    const rightRimX = hoop.x + hoop.width;

    const rimY = hoop.y;

    // Left rim
    checkRimPointCollision(
        leftRimX,
        rimY
    );

    // Right rim
    checkRimPointCollision(
        rightRimX,
        rimY
    );
}


// --------------------------------------------------
// RIM POINT COLLISION
// --------------------------------------------------

function checkRimPointCollision(rimX, rimY) {

    const distance = distanceBetween(
        ball.x,
        ball.y,
        rimX,
        rimY
    );

    const minimumDistance =
        ball.radius + hoop.rimRadius;

    if (distance < minimumDistance) {

        const nx =
            (ball.x - rimX) / distance;

        const ny =
            (ball.y - rimY) / distance;

        ball.x =
            rimX + nx * minimumDistance;

        ball.y =
            rimY + ny * minimumDistance;

        const velocity =
            ball.velocityX * nx +
            ball.velocityY * ny;

        ball.velocityX -=
            1.7 * velocity * nx;

        ball.velocityY -=
            1.7 * velocity * ny;

        ball.velocityX *= 0.75;
        ball.velocityY *= 0.75;
    }
}


// --------------------------------------------------
// SCORE DETECTION
// --------------------------------------------------

function checkScore() {

    const hoopLeft = hoop.x;
    const hoopRight = hoop.x + hoop.width;
    const hoopY = hoop.y;

    // Ball must pass downward through the hoop
    if (

        !scoredThisShot &&

        ball.x > hoopLeft + 10 &&

        ball.x < hoopRight - 10 &&

        ball.y > hoopY &&

        ball.y < hoopY + 20 &&

        ball.velocityY > 0

    ) {

        score++;

        scoreElement.textContent = score;

        scoredThisShot = true;
    }
}


// --------------------------------------------------
// UPDATE PHYSICS
// --------------------------------------------------

function update() {

    if (isShooting) {

        // Apply gravity
        ball.velocityY += gravity;

        // Move ball
        ball.x += ball.velocityX;

        ball.y += ball.velocityY;

        // Collisions
        checkFloorCollision();

        checkBackboardCollision();

        checkRimCollision();

        checkScore();


        // If ball leaves screen
        if (

            ball.x < -100 ||

            ball.x > canvas.width + 100 ||

            ball.y > canvas.height + 100

        ) {

            resetBall();
        }
    }
}


// --------------------------------------------------
// DRAW COURT
// --------------------------------------------------

function drawCourt() {

    // Sky
    ctx.fillStyle = "#87CEEB";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Court floor
    ctx.fillStyle = "#D99A5B";

    ctx.fillRect(
        0,
        canvas.height - 60,
        canvas.width,
        60
    );


    // Court line
    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(
        0,
        canvas.height - 60
    );

    ctx.lineTo(
        canvas.width,
        canvas.height - 60
    );

    ctx.stroke();


    // Three-point style arc
    ctx.beginPath();

    ctx.arc(
        150,
        canvas.height - 60,
        180,
        Math.PI,
        Math.PI * 2
    );

    ctx.stroke();


    // Floor center line
    ctx.beginPath();

    ctx.moveTo(
        canvas.width / 2,
        canvas.height - 60
    );

    ctx.lineTo(
        canvas.width / 2,
        canvas.height
    );

    ctx.stroke();
}


// --------------------------------------------------
// DRAW HOOP
// --------------------------------------------------

function drawHoop() {

    const boardX = hoop.x + hoop.width;

    const boardTop = hoop.y - 80;


    // Pole
    ctx.fillStyle = "#333";

    ctx.fillRect(
        boardX + 5,
        boardTop,
        15,
        300
    );


    // Backboard
    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        boardX,
        boardTop,
        hoop.backboardWidth,
        hoop.backboardHeight
    );


    // Backboard border
    ctx.strokeStyle = "#222";

    ctx.lineWidth = 5;

    ctx.strokeRect(
        boardX,
        boardTop,
        hoop.backboardWidth,
        hoop.backboardHeight
    );


    // Backboard target
    ctx.strokeStyle = "#e63946";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        boardX - 45,
        hoop.y - 35,
        45,
        55
    );


    // Rim
    ctx.strokeStyle = "#e63946";

    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(
        hoop.x,
        hoop.y
    );

    ctx.lineTo(
        hoop.x + hoop.width,
        hoop.y
    );

    ctx.stroke();


    // Rim circles
    ctx.fillStyle = "#e63946";

    ctx.beginPath();

    ctx.arc(
        hoop.x,
        hoop.y,
        hoop.rimRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        hoop.x + hoop.width,
        hoop.y,
        hoop.rimRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Net
    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 2;

    for (let i = 0; i <= 6; i++) {

        const x =
            hoop.x + (hoop.width / 6) * i;

        ctx.beginPath();

        ctx.moveTo(x, hoop.y);

        ctx.lineTo(
            hoop.x + hoop.width / 2,
            hoop.y + 60
        );

        ctx.stroke();
    }

    // Horizontal net lines
    for (let i = 1; i <= 3; i++) {

        ctx.beginPath();

        ctx.moveTo(
            hoop.x + i * 10,
            hoop.y + i * 15
        );

        ctx.lineTo(
            hoop.x + hoop.width - i * 10,
            hoop.y + i * 15
        );

        ctx.stroke();
    }
}


// --------------------------------------------------
// DRAW BALL
// --------------------------------------------------

function drawBall() {

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";

    ctx.beginPath();

    ctx.ellipse(
        ball.x,
        canvas.height - 65,
        ball.radius,
        5,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Basketball
    ctx.fillStyle = ball.color;

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Basketball outline
    ctx.strokeStyle = "#5a2500";

    ctx.lineWidth = 3;

    ctx.stroke();


    // Basketball lines
    ctx.strokeStyle = "#5a2500";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius * 0.8,
        -Math.PI / 2,
        Math.PI / 2
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius * 0.8,
        Math.PI / 2,
        Math.PI * 1.5
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        ball.x - ball.radius,
        ball.y
    );

    ctx.quadraticCurveTo(
        ball.x,
        ball.y - 8,
        ball.x + ball.radius,
        ball.y
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        ball.x - ball.radius,
        ball.y
    );

    ctx.quadraticCurveTo(
        ball.x,
        ball.y + 8,
        ball.x + ball.radius,
        ball.y
    );

    ctx.stroke();
}


// --------------------------------------------------
// DRAW AIMING LINE
// --------------------------------------------------

function drawAimLine() {

    if (isShooting) {
        return;
    }

    ctx.strokeStyle =
        "rgba(255,255,255,0.7)";

    ctx.lineWidth = 3;

    ctx.setLineDash([8, 8]);

    ctx.beginPath();

    ctx.moveTo(
        ball.x,
        ball.y
    );

    ctx.lineTo(
        mouseX,
        mouseY
    );

    ctx.stroke();

    ctx.setLineDash([]);


    // Aim point
    ctx.fillStyle = "rgba(255,255,255,0.8)";

    ctx.beginPath();

    ctx.arc(
        mouseX,
        mouseY,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// --------------------------------------------------
// DRAW
// --------------------------------------------------

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawCourt();

    drawHoop();

    drawAimLine();

    drawBall();
}


// --------------------------------------------------
// GAME LOOP
// --------------------------------------------------

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);
}


// --------------------------------------------------
// KEYBOARD
// --------------------------------------------------

document.addEventListener("keydown", function(event) {

    if (event.code === "Space") {

        event.preventDefault();

        shoot();
    }

    if (event.key.toLowerCase() === "r") {

        score = 0;

        scoreElement.textContent = score;

        resetBall();
    }
});


// --------------------------------------------------
// START GAME
// --------------------------------------------------

resetBall();

gameLoop();
