import {Asteroid} from "./asteroid.js";
import {PauseState} from "./pausestate.js";
import {GameOverState} from "./gameoverstate.js";


const KEYCODE = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    P: 80,
    Z: 90,
};

const ASTEROID_PLACEMENT_VARIANCE = 40;
const ASTEROID_MAX_SPEED = 25;
const ASTEROID_PLACEMENT_RADIUS = 300;
const NUM_ASTEROIDS = 5;

export class PlayState {
    constructor(level = null) {
        this.level = level;

        this._keyDownListenerHandle = this._keyDownListener.bind(this);
        this._keyUpListenerHandle = this._keyUpListener.bind(this);
    }

    init(game) {
        this.game = game;
        this.ctx = this.game.ctx;
        this.hudCanvas = this.game.hudCanvas;
        this.animationHandler = this.game.animationHandler;
        this.collisionHandler = this.game.collisionHandler;
        this.hud = this.game.hud;

        this.asteroids = this.game.asteroids;
        this.ship = this.game.ship;
        this.gameWidth = this.game.gameWidth;
        this.gameHeight = this.game.gameHeight;

        // create level if necessary
        if (this.level != null) {
            this.game.level = this.level;
            this._clearAsteroids();
            this._clearBullets();
            this.ship.pos.x = this.gameWidth/2;
            this.ship.pos.y = this.gameHeight/2;
            this._createAsteroids(Math.round(NUM_ASTEROIDS*1.2));
        } else {
            this.level = this.game.level;
        }

        this.game._startTasks();

        // load event listeners
        this._inputHandlers();
    }

    cleanUp() {
        // unload event listeners
        document.removeEventListener("keydown", this._keyDownListenerHandle);
        document.removeEventListener("keyup", this._keyUpListenerHandle);
    }

    _clearAsteroids() {
        this.asteroids.splice(0, this.asteroids.length);
    }

    _clearBullets() {
        this.ship.bullets.splice(0, this.ship.bullets.length);
    }

    _inputHandlers() {
        document.addEventListener("keydown", this._keyDownListenerHandle);
        document.addEventListener("keyup", this._keyUpListenerHandle);
    }

    _keyDownListener(event) {
        switch (event.keyCode) {
            case KEYCODE.LEFT:
                this.game.ship.turn(-1);
                break;
            case KEYCODE.RIGHT:
                this.game.ship.turn(1);
                break;
            case KEYCODE.UP:
                this.game.ship.thrust(1);
                break;
            case KEYCODE.DOWN:
                this.game.ship.thrust(-1);
                break;
            case KEYCODE.Z:
                this.game.ship.firing(1);
                break;
            case KEYCODE.ENTER:
                this.game.requestState(new PauseState());
                break;
        }
    }

    _keyUpListener(event) {
        switch (event.keyCode) {
            case KEYCODE.LEFT:
                this.game.ship.turn(0);
                break;
            case KEYCODE.RIGHT:
                this.game.ship.turn(0);
                break;
            case KEYCODE.UP:
                this.game.ship.thrust(0);
                break;
            case KEYCODE.DOWN:
                this.game.ship.thrust(0);
                break;
            case KEYCODE.Z:
                this.game.ship.firing(0);
                break;
        }
    }

    _createAsteroids(num) {
        let center = {x: this.gameWidth/2, y: this.gameHeight/2};
        for (let i = 0; i < num; i++) {
            let tempTheta = Math.random() * 2* Math.PI;
            let tempRadius = ASTEROID_PLACEMENT_VARIANCE * Math.random() + ASTEROID_PLACEMENT_RADIUS;
            let asteroid = new Asteroid(
                center.x + tempRadius * Math.cos(tempTheta),
                center.y + tempRadius * Math.sin(tempTheta),
                Math.random()*ASTEROID_MAX_SPEED,
                Math.random()*ASTEROID_MAX_SPEED, 2, this.level*10);
            this.asteroids.push(asteroid);
        }
    }

    _setupLevel(numAsteroids) {
        this.ship.pos = {x: this.gameWidth/2, y: this.gameHeight/2};
        this.ship.theta = -Math.PI/2;
        this._createAsteroids(numAsteroids);
    }

    draw() {
        this.ctx.fillStyle = "#000f";
        // console.log("here billy");
        // Special effects
        if (!this.drawMode)
            // this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        //entities
        this.ship.draw(this.ctx, this);
        for (let i = 0; i < this.ship.bullets.length; i++) {
            this.ship.bullets[i].draw(this.ctx, this);
        }
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].draw(this.ctx, this);
        }

        this.animationHandler.drawAsteroidHits();

        this.hud.draw();

        // Special effects
        if (this.invertCanvas) {
            var imgData = this.ctx.getImageData(0, 0, this.gameWidth, this.gameHeight);
            for (let i = 0; i < imgData.data.length; i += 4) {
                imgData.data[i] = 255-imgData.data[i];
                imgData.data[i + 1] = 255-imgData.data[i + 1];
                imgData.data[i + 2] = 255-imgData.data[i + 2];
            }
            this.ctx.putImageData(imgData, 0, 0);
        }
    }

    update(dt) {
        this.ship.update(dt, this.game);
        for (let i = this.ship.bullets.length - 1; i > -1; i--) {
            this.ship.bullets[i].update(dt, this.game);
        }
        for (let i = this.asteroids.length -1 ; i > -1; i--) {
            this.asteroids[i].update(dt, this.game);
        }
        if (this.collisionHandler.handleShipCollision()) {
            this.game.requestState(new GameOverState());
        }
        this.collisionHandler.handleBulletCollisions();

        for (let i = this.ship.bullets.length - 1; i > -1; i--) {
            if (this.ship.bullets[i].markForDeletion) {
                this.ship.bullets.splice(i,1);
            }
        }
        for (let i = this.asteroids.length - 1; i > -1; i--) {
            if (this.asteroids[i].markForDeletion) {
                this.asteroids.splice(i,1);
            }
        }
        if (!this.asteroids.length) {
            this.game._stopTasks();
            this.game.score += 100*(2**(2.4*Math.log(this.level)));
            this.game.requestState(new PlayState(this.level + 1));
        }
    }
}