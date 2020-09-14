import {drawPolygon, getAdjacentVertexSets} from "./common.js"

const ASTEROID_SIZES = [20, 40, 50];
const ASTEROID_POINTS = 8;
const ANGLE_VARIANCE = 0.35; // 20 degrees
export const ASTEROID_RADIUS_VARIANCE = 20;
const HEALTH_FACTOR = 5;
const SHOW_BOUNDING_BOX = false;

export class Asteroid {
    constructor(x, y, velx, vely, size, health) {
        this.pos = {x: x, y: y};
        this.vel = {x: velx, y: vely};
        this.radius = ASTEROID_SIZES[size];

        this.deltas = [];
        let thetaDelta = (2*Math.PI)/ASTEROID_POINTS;
        let randomOffset = Math.random()*Math.PI*2;
        for (let i = 0; i < ASTEROID_POINTS; i ++) {
            let tempAngle = thetaDelta * i + randomOffset + ANGLE_VARIANCE * Math.random();
            let tempRadius = this.radius + ASTEROID_RADIUS_VARIANCE * Math.random();
            let delta = {
                x: tempRadius * Math.cos(tempAngle),
                y: tempRadius * Math.sin(tempAngle)
            };
            this.deltas.push(delta);
        }

        this.maxHealth = health;
        this.health = health;
        this.markForDeletion = false;

        //animation
        this.animateDamage = false;
        this.animationCounter = 0;

        //caches
        this.verticesCache = [];
        this.verticesCacheRefresh = true;

        this.linesCache = [];
        this.linesCacheRefresh = true;
    }

    boundingBox() {
        let maxRadius = this.radius + ASTEROID_RADIUS_VARIANCE;
        return {x: this.pos.x - maxRadius, y: this.pos.y - maxRadius,
            width: maxRadius*2, height: maxRadius*2};
    }

    lines() {
        if (this.linesCacheRefresh) {
            let lines = [];
            let vertices = this.vertices();
            let vLength = vertices.length;
            for (let i = 0; i < vLength; i++) {
                lines.push(
                    {
                        p1: {x: vertices[i].x, y: vertices[i].y},
                        p2: {x: vertices[(i + 1) % vLength].x, y: vertices[(i + 1) % vLength].y}});
            }
            this.linesCache = lines;
            this.linesCacheRefresh = false;
        }
        return this.linesCache;
    }

    vertices() {
        if (this.verticesCacheRefresh) {
            let vertices = [];
            for (let i = 0; i < this.deltas.length; i++) {
                vertices.push(
                    {x: this.pos.x + this.deltas[i].x, y: this.pos.y + this.deltas[i].y});
            }
            this.verticesCache = vertices;
            this.verticesCacheRefresh = false;
        }
        return this.verticesCache;
    }

    draw(ctx, game) {
        if (!this.deltas.length)
            return;

        // show bounding box
        if (SHOW_BOUNDING_BOX) {
            ctx.fillStyle = "#0f09";
            let bb = this.boundingBox();
            ctx.fillRect(bb.x, bb.y, bb.width, bb.height);
        }

        let vertexSets = getAdjacentVertexSets(this.vertices(), game);
        //calc color and linewidth
        let percentage = this.health/this.maxHealth;
        const minWidth = 2;
        const maxWidth = 8;
        let lineWidth = minWidth + (maxWidth - minWidth)*percentage;
        const minColor = 7;
        const maxColor = 15;
        let color = Math.round(minColor + (maxColor - minColor)*percentage);

        for (let i = 0; i < vertexSets.length; i++) {
            drawPolygon(ctx, vertexSets[i], "#" + color.toString(16).repeat(3), lineWidth);
        }
    }

    update(dt, game) {
        this.pos.x = this.pos.x + this.vel.x * dt;
        this.pos.y = this.pos.y + this.vel.y * dt;

        // wrap on game box
        this.pos.x = this.pos.x - (this.pos.x > game.gameWidth) * game.gameWidth + (this.pos.x < 0) * game.gameWidth;
        this.pos.y = this.pos.y - (this.pos.y > game.gameHeight) * game.gameHeight + (this.pos.y < 0) * game.gameHeight;
        this.verticesCacheRefresh = true;
        this.linesCacheRefresh = true;

        //animation
        this.animationCounter = (this.animationCounter < 0) ? this.animationCounter : this.animationCounter - dt;
    }
}
