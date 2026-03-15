// Start coding with P5 here!
// Have a look at the P5 Reference: https://p5js.org/reference/
// Click the P5 button at the top to run your sketch! ⤴

// =============
const springConstant = 1;
const dt = .001; 
let springX = -350;
const air_coef = 1;
const ground_coef = 1;
const ballMass = 1;
const pendulumMass = 1;
const pendulumX = 0;
const pendulumL = 100;
const g = 9.81;
const energyConservedDuringCollision = 1;
const speedup = 1000;

let ballState = { v: 0, x: -20 };
let pendState = { thetaV: 0, theta: PI / 2 };
// =============
let collisions = 0;
let shouldCollide = true;
let isDeforming = false;
let savedVelocity = 0;


function setup() {
    resizeCanvas(800, 400, WEBGL);
    frameRate(120);
}

function deform() {
    return min(0, ballState.x - springX);
}

function springBallAcceleration() {
    const deformation = deform();
    //-kx=ma
    //a=-kx/m
    // console.log(deformation)
    return -springConstant * deformation / ballMass;
}

function drawBallSpring() {
    rect(springX + deform() - 10, -25, -20, 50);
    circle(ballState.x, 0, 20);

    const ballA = springBallAcceleration();
    ballState.v += ballA * dt;
    ballState.v *= ground_coef;
    ballState.x += ballState.v * dt;
    if (deform() < 0 && !isDeforming) {
        isDeforming = true;
        savedVelocity = ballState.v;
        console.log("saved",ballState.v)
    }
    if (deform() == 0 && isDeforming) {
        isDeforming = false;
        console.log("new",ballState.v);
        ballState.v = -savedVelocity;
    }

}

function draw() {
    translate(width / 2, height / 2);
    for(let i=0;i<speedup;i++) {
        background("white");
        fill("white");
        drawBallSpring();
        drawPendulum();
        ballCollision();
        // clear();
    }
}

function ballCollision() {
    const pendVelocityX = pendState.thetaV * pendulumL;
    const dis = dist(
        ballState.x,
        0,
        pendulumX + pendulumL * sin(pendState.theta),
        -pendulumL + pendulumL * cos(pendState.theta),
    );
    if (dis >= 20) shouldCollide = true;
    if (dis <= 20 && shouldCollide) {
        console.log("collide", ++collisions);
        shouldCollide = false;
        const e = sqrt(energyConservedDuringCollision);

        const m1 = ballMass;
        const m2 = pendulumMass;
        const v1 = ballState.v;
        const v2 = pendVelocityX;

        const new_ball_speed = (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) /
            (m1 + m2);
        const new_pend_speed = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) /
            (m1 + m2);

        ballState.v = new_ball_speed;
        pendState.thetaV = new_pend_speed / pendulumL;
    }
}

function drawPendulum() {
    fill("black");
    circle(pendulumX, -pendulumL, 10);
    circle(
        pendulumL * sin(pendState.theta),
        -pendulumL + pendulumL * cos(pendState.theta),
        20,
    );
    line(
        pendulumX,
        -pendulumL,
        pendulumX + pendulumL * sin(pendState.theta),
        -pendulumL + pendulumL * cos(pendState.theta),
    );

    // console.log(pendState.theta);

    pendState.thetaV -= g / pendulumL * sin(pendState.theta) * dt;
    pendState.thetaV *= air_coef;
    pendState.theta += pendState.thetaV * dt;
}
