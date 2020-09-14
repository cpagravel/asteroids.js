import {Bullet, BULLET_SPEED} from "./bullet.js"
import {drawLines, drawPolygon, getAdjacentVertexSets} from "./common.js"

const BULLET_MAX = 1000;
const STOP_THRESH = 0.09;
const SHIP_WIDTH = 10;
const SHIP_LENGTH = 20;
const DEFAULT_THRUST_FORCE = 1500;
const DEFAULT_VELOCITY_DECAY = 0.98;
const DEFAULT_DRAG_FACTOR = 0.01; // 0.01 is good
const DEFAULT_TURN_THETA = 0.08;
const DEFAULT_FIRING_RATE = 10;

export class Ship {
    constructor(x, y, theta) {
        this.pos = {x: x, y: y};
        this.vel = {x: 0, y: 0};
        this.accel = {x: 0, y: 0};
        this.theta = theta;
        this.points = [];
        this.markForDeletion = false;

        this.linesCacheRefresh = true;

        //firing
        this.bullets = [];
        this.bulletDamage = 2;
        this.firingMode = 0; // 0 off, 1 regular, 2 burst?
        this.firingRate = DEFAULT_FIRING_RATE;
        this.firingCounter = 1/this.firingRate;

        //movement
        this.turnDir = 0;
        this.thruster = 0;
        this.dragFactor = DEFAULT_DRAG_FACTOR;
        this.turnTheta = DEFAULT_TURN_THETA;
        this.velocityDecay = DEFAULT_VELOCITY_DECAY;
        this.thrustForce = DEFAULT_THRUST_FORCE;
    }

    break() {
        this.vel.x *= 0.6;
        this.vel.y *= 0.6;
    }

    boundingBox() {
        return {x: this.pos.x - SHIP_LENGTH, y: this.pos.y - SHIP_LENGTH, width: SHIP_LENGTH*2, height: SHIP_LENGTH*2}
    }

    _setPoints() {
        //Ship points
        let a = {x: this.pos.x + Math.cos(this.theta + Math.PI/2)*SHIP_WIDTH/2,
            y: this.pos.y + Math.sin(this.theta + Math.PI/2)*SHIP_WIDTH/2};
        let b = {x: this.pos.x - Math.cos(this.theta + Math.PI/2)*SHIP_WIDTH/2,
            y: this.pos.y - Math.sin(this.theta + Math.PI/2)*SHIP_WIDTH/2};
        let c = {x: this.pos.x + Math.cos(this.theta)*SHIP_LENGTH,
            y: this.pos.y + Math.sin(this.theta)*SHIP_LENGTH};
        this.points = [a, b, c];
    }

    lines() {
        if (this.linesCacheRefresh) {
            let vertices = this.vertices();
            let lines = [];
            let vLength = vertices.length;
            for (let i = 0; i < vLength; i++) {
                let line = {
                    p1: {x: vertices[i].x, y: vertices[i].y},
                    p2: {x: vertices[(i+1)%vLength].x, y: vertices[(i+1)%vLength].y}};
                lines.push(line);
            }
            this.linesCache = lines;
        }
        return this.linesCache;
    }

    vertices() {
        return this.points;
    }

    draw(ctx, game) {
        if (!this.points.length)
            this._setPoints();
        let vertexSets = getAdjacentVertexSets(this.vertices(), game);
        for (let i = 0; i < vertexSets.length; i++) {
            drawPolygon(ctx, vertexSets[i], "#fff");
        }
    }

    firing(firingMode) {
        this.firingMode = firingMode;
    }

    thrust(thrustMode) {
        this.thruster = thrustMode;
    }

    turn(dir) {
        this.turnDir = dir;
    }

    update(dt, game) {
        // handle firing rates
        this.firingCounter = (this.firingCounter > 1/this.firingRate) ? 1/this.firingRate : this.firingCounter + dt;
        if (this.firingMode == 1 && this.firingCounter > 1/this.firingRate) {
            if (this.bullets.length < BULLET_MAX) {
                let velx = Math.cos(this.theta)*BULLET_SPEED + this.vel.x;
                let vely = Math.sin(this.theta)*BULLET_SPEED + this.vel.y;
                this.bullets.push(new Bullet(
                    this.pos.x + Math.cos(this.theta)*SHIP_LENGTH,
                    this.pos.y + Math.sin(this.theta)*SHIP_LENGTH, velx, vely, this.bulletDamage));
            }
            this.firingCounter -= (1/this.firingRate);
        }

        this.theta = this.theta + this.turnTheta*this.turnDir;

        this.pos.x = this.pos.x + this.vel.x*dt + 0.5*this.accel.y*(dt**2);
        this.pos.y = this.pos.y + this.vel.y*dt + 0.5*this.accel.y*(dt**2);

        // wrap on game box
        this.pos.x = this.pos.x - (this.pos.x > game.gameWidth) * game.gameWidth + (this.pos.x < 0) * game.gameWidth;
        this.pos.y = this.pos.y - (this.pos.y > game.gameHeight) * game.gameHeight + (this.pos.y < 0) * game.gameHeight;

        this.vel.x = this.vel.x + this.accel.x*dt;
        this.vel.y = this.vel.y + this.accel.y*dt;

        this.vel.x = (Math.abs(this.vel.x) < STOP_THRESH ? 0 : this.vel.x);
        this.vel.y = (Math.abs(this.vel.y) < STOP_THRESH ? 0 : this.vel.y);

        let xDrag = (this.vel.x**2)*this.dragFactor*Math.sign(this.vel.x);
        let yDrag = (this.vel.y**2)*this.dragFactor*Math.sign(this.vel.y);

        this.accel.x = this.thruster*this.thrustForce*Math.cos(this.theta) - xDrag;
        this.accel.y = this.thruster*this.thrustForce*Math.sin(this.theta) - yDrag;

        this.vel.x *= this.velocityDecay;
        this.vel.y *= this.velocityDecay;

        //Ship points
        this._setPoints();

        this.linesCacheRefresh = true;
    }
}
