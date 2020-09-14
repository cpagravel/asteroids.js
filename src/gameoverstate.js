import {PlayState} from "./playstate.js"

const KEYCODE = {
    ENTER: 13,
};

export class GameOverState {
    constructor() {
        this._keyDownListenerHandle = this._keyDownListener.bind(this);
    }

    init(game) {
        this.game = game;
        this.gameWidth = this.game.gameWidth;
        this.gameHeight = this.game.gameHeight;
        this.ctx = this.game.ctx;

        setTimeout(() => {
            this.ctx.font = "40px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "top"
            this.ctx.fillStyle = "#000";
            let headingSize = this.ctx.measureText("GAMEOVER");
            let headingHeight = headingSize.actualBoundingBoxAscent + headingSize.actualBoundingBoxDescent;
            let headingWidth = headingSize.width;
            this.ctx.fillRect(this.gameWidth/2 - headingWidth/2, this.gameHeight/6, headingWidth, headingHeight);
            this.ctx.fillStyle = "#fff";
            this.ctx.fillText("GAMEOVER", this.gameWidth/2, this.gameHeight/6); // text and position
        }, 500);

        this._inputHandlers();
    }

    _inputHandlers() {
        document.addEventListener("keydown", this._keyDownListenerHandle);
    }

    _keyDownListener(event) {
        switch(event.keyCode) {
            case KEYCODE.ENTER:
                this.game.requestState(new PlayState(0));
                break;
        }
    }

    cleanUp() {
        document.removeEventListener("keydown", this._keyDownListenerHandle);
        this.game.score = 0;
        this.game.asteroids.splice(0, this.game.asteroids.length);
        this.game.ship.bullets.splice(0, this.game.ship.bullets.length);
    }

    draw() {

    }

    update(dt) {

    }
}