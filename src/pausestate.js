import {PlayState} from "./playstate.js";

const KEYCODE = {
    ENTER: 13,
};

export class PauseState {
    constructor() {
        this._keyDownListenerHandle = this._keyDownListener.bind(this);
    }

    init(game) {
        this.game = game;
        this.ctx = this.game.ctx;
        this.gameWidth = this.game.gameWidth;
        this.gameHeight = this.game.gameHeight;

        this.ctx.font = "40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top"
        this.ctx.fillStyle = "#000";
        let headingSize = this.ctx.measureText("PAUSE");
        let headingHeight = headingSize.actualBoundingBoxAscent + headingSize.actualBoundingBoxDescent;
        let headingWidth = headingSize.width;
        this.ctx.fillRect(this.gameWidth/2 - headingWidth/2, this.gameHeight/6, headingWidth, headingHeight);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("PAUSE", this.gameWidth/2, this.gameHeight/6); // text and position

        this._inputHandlers();
    }

    _inputHandlers() {
        document.addEventListener("keydown", this._keyDownListenerHandle);
    }

    _keyDownListener(event) {
        switch(event.keyCode) {
            case KEYCODE.ENTER:
                this.game.requestState(new PlayState(null));
                break;
        }
    }

    cleanUp() {
        document.removeEventListener("keydown", this._keyDownListenerHandle);
    }

    draw() {

    }

    update(dt) {

    }
}