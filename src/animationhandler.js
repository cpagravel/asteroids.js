import {drawPolygon, getAdjacentVertexSets} from "./common.js"

export class AnimationHandler {
    constructor(game, ship, asteroids, bullets) {
        this.game = game;
        this.ship = ship;
        this.asteroids = asteroids;
        this.bullets = bullets;
        this.ctx = this.game.ctx;

        this.gameWidth = this.game.gameWidth;
        this.gameHeight = this.game.gameHeight;
    }

    openingScene() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        this.ship.pos.x = this.game.gameWidth/2
        this.ship.pos.y = this.game.gameHeight/2;
        this.ship.theta = -Math.PI/2;
        let oldValues = {};
        for (const prop in this.ship) {
            oldValues[prop] = this.ship[prop];
        }
        this.ship.thrustForce = 1500;
        this.ship.dragFactor = 0.000001;

        let dt = 1/20; // affects speed of rotation animation
        this.ship.turnTheta = Math.PI*2/24;
        this.ship.turn(1);

        // rotate ship animation
        for (let i = 0; i < 24; i++) {
            setTimeout(this.game.gameState.draw.bind(this.game.gameState), dt*1000*i);
            setTimeout(this.game.gameState.update.bind(this.game.gameState, dt), dt*1000*i);
        }
        let endShipRotateTime = dt*1000*23;
        // create bullets
        setTimeout(() => {
            this.ship.theta = -Math.PI/2;
            this.ship.firingRate = 2400;
            this.ship.firing(1);
            for (let i = 0; i < 24; i++) {
                this.ship.update(dt, this.game);
            }
        }, endShipRotateTime);

        setTimeout(() => {
            this.ship.turn(0);
            this.ship.firing(0);
        }, endShipRotateTime);

        // fire bullets
        let bulletStartTime = endShipRotateTime + 400;
        // Increase the perceived framerate, but draw a lot more often and quickly so the lines are smoother
        // and to make the duration short
        dt = 1/160;
        let speedFactorIncrease = 6;
        let bulletAnimationLength = 700;
        for (let i = 0; i < bulletAnimationLength; i++) {
            setTimeout(this.game.gameState.draw.bind(this.game.gameState), bulletStartTime + dt*1000*i/speedFactorIncrease);
            setTimeout(this.game.gameState.update.bind(this.game.gameState, dt), bulletStartTime + dt*1000*i/speedFactorIncrease);
        }
        let endTime = bulletStartTime + dt*1000*bulletAnimationLength/speedFactorIncrease;

        // draw Banners
        setTimeout(() => {
            this.ctx.font = "60px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "top"
            this.ctx.fillStyle = "#000";
            let headingSize = this.ctx.measureText("ASTEROIDS");
            let headingHeight = headingSize.actualBoundingBoxAscent + headingSize.actualBoundingBoxDescent;
            let headingWidth = headingSize.width;
            this.ctx.fillRect(this.gameWidth/2 - headingWidth/2, this.gameHeight/6, headingWidth, headingHeight);
            this.ctx.fillStyle = "#fff";
            this.ctx.fillText("ASTEROIDS", this.gameWidth/2, this.gameHeight/6); // text and position
            this.ctx.font = "20px Arial";
            let infoTextSize = this.ctx.measureText("Press Enter to Continue");
            let infoTextWidth = infoTextSize.width;
            let infoTextHeight = infoTextSize.actualBoundingBoxAscent + infoTextSize.actualBoundingBoxDescent;
            this.ctx.fillStyle = "#000";
            this.ctx.fillRect(this.gameWidth/2 - infoTextWidth/2, this.gameHeight/2 + 80, infoTextWidth, infoTextHeight);
            this.ctx.fillStyle = "#fff";
            this.ctx.fillText("Press Enter to Continue", this.gameWidth/2, this.gameHeight/2 + 80);
        }, endTime + 300);

        setTimeout(() => {
            for (const prop in oldValues) {
                this.ship[prop] = oldValues[prop];
            }
            this.game.gameState._inputHandlers();
        }, endTime + 300);
    }

    drawAsteroidHits() {
        for (let i = 0; i < this.asteroids.length; i++) {
            if (this.asteroids[i].animateDamage) {
                this.asteroids[i].animationCounter = 0.05;
                this.asteroids[i].animateDamage = false;
            }
            if (this.asteroids[i].animationCounter > 0) {
                let aVertexSets = getAdjacentVertexSets(this.asteroids[i].vertices(), this.game);
                for (let j = 0; j < aVertexSets.length; j++) {
                    drawPolygon(this.ctx, aVertexSets[j], "#f00");
                }
            }
        }
    }
}