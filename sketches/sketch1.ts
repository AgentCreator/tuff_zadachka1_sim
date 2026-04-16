
// ============= ПАРАМЕТРИ
const springConstant = 1; // те саме що k в F=-kx
const dt = 1e-2; // одиниця часу. чим менше тим точніше, але повільніше
const springX = -350;
const air_coef = 1; // скільки відсотків швидкості маятника зберігається? (кожного dt)
const ballMass = 1;
const pendulumMass = 1;
const pendulumX = 0;
const pendulumL = 100;
const g = 9.81;
const energyConservedDuringCollision = 1;
const mu = 0.15;
const speedup = 10; // на скільки швидко запускається симуляція? щоб можна було мати малий dt і не чекати півроку до зіткнення

const ballState = { v: 0, x: -20 };
const pendState = { thetaV: 0, theta: Math.PI/2 };
// ============= ПАРЕМЕТРИ СКІНЧИЛИСЯ

let collisions = 0;
let shouldCollide = true;
let isDeforming = false;
const theta_0 = pendState.theta;
let savedVelocity = 0;
let savedVelocitySpring = 0;
let direction = 1;
let energyLostByMu = 0;


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
    const frictionA = mu * g
    if (ballState.v > 0) {
        ballState.v = Math.max(0, ballState.v - frictionA * dt);
    } else if (ballState.v < 0) {
        ballState.v = Math.min(0, ballState.v + frictionA * dt);
    }
    console.log(ballA)
    ballState.v += ballA * dt;
    ballState.x += ballState.v * dt;
    if (deform() < 0 && !isDeforming) {
        // console.log(savedVelocity);
        isDeforming = true;
        savedVelocitySpring = ballState.v;
        console.log("saved",ballState.v)
    }
    if (deform() == 0 && isDeforming) {
        isDeforming = false;
        console.log("new",ballState.v);
        ballState.v = -savedVelocitySpring;
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
    const dis = dist(
        ballState.x,
        0,
        pendulumX + pendulumL * sin(pendState.theta),
        -pendulumL + pendulumL * cos(pendState.theta),
    );
    if (dis >= 20) shouldCollide = true;
    if (dis <= 20 && shouldCollide) {
        energyLostByMu = ballMass * (savedVelocity * savedVelocity - ballState.v*ballState.v);
        console.log("collide", ++collisions);
        shouldCollide = false;
        const e = sqrt(energyConservedDuringCollision);


        const pendVelocityX = pendState.thetaV * pendulumL;
        const m1 = ballMass;
        const m2 = pendulumMass;
        const v1 = ballState.v;
        const v2 = pendVelocityX;

        const new_ball_speed = (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) /
            (m1 + m2);
        const new_pend_speed = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) /
            (m1 + m2);

        ballState.v = new_ball_speed;
        savedVelocity = new_ball_speed;
        pendState.thetaV = new_pend_speed / pendulumL;
        direction = Math.sign(pendState.thetaV);
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
    const velocity = sqrt(
        2*pendulumMass*g*pendulumL*(cos(pendState.theta) - cos(theta_0))
        -ballMass*savedVelocity*savedVelocity - energyLostByMu
    )
    /(pendulumL*sqrt(pendulumMass));

    

    if (Math.cos(pendState.theta) <= ((ballMass*savedVelocity*savedVelocity+energyLostByMu)/(2*pendulumMass*g*pendulumL)+Math.cos(theta_0))) {
        // console.log("direction switch")
        direction = -Math.sign(pendState.theta);
    }

    if (isNaN(velocity) || velocity == 0) {
        pendState.thetaV -= g / pendulumL * sin(pendState.theta) * dt;
    } else {
        pendState.thetaV = direction * velocity;
    }

    
    pendState.thetaV *= air_coef;
    pendState.theta += pendState.thetaV * dt;
}



