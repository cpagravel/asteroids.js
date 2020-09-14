import {drawLines} from "./common.js"

export const BULLET_RADIUS = 3;
export const BULLET_SPEED = 200;
const BULLET_DAMAGE = 10;
const LIFETIME = 4;
const SHOW_BOUNDING_BOX = false;

export class Bullet {
    constructor(x, y, velx, vely, damage) {
        this.pos = {x: x, y: y};
        this.velx = velx;
        this.vely = vely;

        this.damage = damage;
        this.lifetimeCounter = 0;
        this.markForDeletion = false;

        let vr = Math.sqrt(this.velx**2 + this.vely**2);
        let ratio = BULLET_RADIUS/vr;
        let a = {x:  ratio * this.velx, y:  ratio * this.vely};
        let b = {x: -ratio * this.velx, y: -ratio * this.vely};
        let c = {x: -ratio * this.vely, y:  ratio * this.velx};
        let d = {x:  ratio * this.vely, y: -ratio * this.velx};
        this.lineDeltas = [{p1: a, p2: b}, {p1: c, p2: d}];

        this.linesCache = [];
        this.linesCacheRefresh = true;

        this.verticesCache = [];
        this.verticesCacheRefresh = true;
    }

    boundingBox() {
        return {x: this.pos.x - BULLET_RADIUS, y: this.pos.y - BULLET_RADIUS,
            width: BULLET_RADIUS*2, height: BULLET_RADIUS*2};
    }

    lines() {
        if (this.linesCacheRefresh) {
            let lines = [];
            for (let i = 0; i < this.lineDeltas.length; i++) {
                let line = {
                    p1: {x: this.pos.x + this.lineDeltas[i].p1.x,
                        y: this.pos.y + this.lineDeltas[i].p1.y},
                    p2: {x: this.pos.x + this.lineDeltas[i].p2.x,
                        y: this.pos.y + this.lineDeltas[i].p2.y}};
                lines.push(line);
            }

            this.linesCache = lines;
            this.linesCacheRefresh = false;
        }
        return this.linesCache;
    }

    vertices() {
        if (this.verticesCacheRefresh) {
            let lines = this.lines();
            let vertices = [];
            lines.forEach(line => {
                vertices.push({x: line.p1.x, y: line.p1.y});
                vertices.push({x: line.p2.x, y: line.p2.y});
            });

            this.verticesCache = vertices;
            this.verticesCacheRefresh = false;
        }
        return this.verticesCache;
    }

    draw(ctx, game) {

        if (SHOW_BOUNDING_BOX) {
            ctx.fillStyle = "#000";
            let bb = this.boundingBox();
            ctx.fillRect(bb.x, bb.y, bb.width, bb.height);
        }

        drawLines(ctx, this.lines(), "#fff");
    }

    update(dt, game) {
        this.lifetimeCounter += dt;
        this.markForDeletion = (this.lifetimeCounter > LIFETIME);
        this.pos.x = this.velx*dt + this.pos.x;
        this.pos.y = this.vely*dt + this.pos.y;

        // wrap on game box
        this.pos.x = this.pos.x - (this.pos.x > game.gameWidth) * game.gameWidth + (this.pos.x < 0) * game.gameWidth;
        this.pos.y = this.pos.y - (this.pos.y > game.gameHeight) * game.gameHeight + (this.pos.y < 0) * game.gameHeight;

        this.linesCacheRefresh = true;
        this.verticesCacheRefresh = true;
    }
}
