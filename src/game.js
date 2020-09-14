import {Asteroid} from "./asteroid.js"
import {AnimationHandler} from "./animationhandler.js"
import {CollisionHandler} from "./collisionhandler.js"
import {Ship} from "./ship.js"
import {HUD} from "./hud.js"

export const GAME_FPS = 60;

export const GAMESTATE = {
    OPENING: -1,
    RUN: 0,
    PAUSE: 1,
    STOP: 2,
    WAIT_FOR_INPUT: 3,
}


export class Game {
    constructor(gameWidth, gameHeight, ctx, hudCanvas) {
        this.ctx = ctx;
        this.hudCanvas = hudCanvas;
        this.hud = new HUD(this, this.hudCanvas);
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.score = 0;
        this.lives = 3;
        this.level = 0;

        //tasks
        this.gameStateTask = setInterval(this.handleStateQueue.bind(this), 1/5);
        this.updateTask = null;
        this.drawTask = null;

        //entities
        this.asteroids = [];
        this.ship = new Ship(this.gameHeight*2, this.gameWidth*2, -Math.PI/2); // offscreen

        //handlers
        this.collisionHandler = new CollisionHandler(this, this.ship, this.asteroids, this.ship.bullets);
        this.animationHandler = new AnimationHandler(this, this.ship, this.asteroids, this.ship.bullets);

        //special effects
        this.drawMode = false;
        this.invertCanvas = false;

        //state handling
        this.stateRequestQueue = [];
    }

    _startTasks() {
        if (this.updateTask == null) {
            this.updateTask = setInterval(this.update.bind(this), 1000/GAME_FPS);
        }
        if (this.drawTask == null) {
            this.drawTask = requestAnimationFrame(this.draw.bind(this));
        }
    }

    _stopTasks() {
        if (this.updateTask != null) {
            clearInterval(this.updateTask);
            this.updateTask = null;
        }
        if (this.drawTask != null) {
            cancelAnimationFrame(this.drawTask);
            this.drawTask = null;
        }
    }

    requestState(state) {
        this.stateRequestQueue.push(state);
    }

    handleStateQueue() {
        if (this.stateRequestQueue.length) {
            let state = this.stateRequestQueue.shift();
            console.log(state.constructor.name);
            if (this.gameState != null) {
                this._stopTasks();
                this.gameState.cleanUp();
            }
            this.gameState = state;
            this.gameState.init(this); // _startTasks should be called inside init
        }
    }

    draw() {
        this.gameState.draw();
        requestAnimationFrame(this.draw.bind(this));
    }

    update() {
        let dt = 1/GAME_FPS;
        this.gameState.update(dt);
    }
}
