import {PlayState} from "./playstate.js"

const KEYCODE = {
    ENTER: 13,
    Z: 90,
}

export class IntroState {
    constructor() {
        this._keyDownListenerHandle = this._keyDownListener.bind(this);
    }

    init(game) {
        this.game = game;
        this.ctx = this.game.ctx;
        this.hudCanvas = this.game.hudCanvas;
        this.animationHandler = this.game.animationHandler;
        this.hud = this.game.hud;

        this.asteroids = this.game.asteroids;
        this.ship = this.game.ship;
        this.gameWidth = this.game.gameWidth;
        this.gameHeight = this.game.gameHeight;

        // intro scene
        this.ctx.fillStyle = "#000f";
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.animationHandler.openingScene();
    }

    cleanUp() {
        document.removeEventListener("keydown", this._keyDownListenerHandle);
        //remove bullets created in animation
        this.ship.bullets.splice(0, this.ship.bullets.length);
    }

    _inputHandlers() {
        document.addEventListener("keydown", this._keyDownListenerHandle);
    }

    _keyDownListener(event) {
        switch(event.keyCode) {
            case KEYCODE.ENTER:
                this.game.requestState(new PlayState());
                break;
        }
    }

    draw() {
        this.ctx.fillStyle = "#000f";

        //entities
        this.ship.draw(this.ctx, this.game);
        for (let i = 0; i < this.ship.bullets.length; i++) {
            this.ship.bullets[i].draw(this.ctx, this.game);
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
    }
}