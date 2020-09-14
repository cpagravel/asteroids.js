const HUD_HEIGHT = 80;

export class HUD {
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.yPos = 0;
    }

    draw() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, this.yPos, this.game.gameWidth, HUD_HEIGHT);

        this.ctx.font = "18px Arial";
        this.ctx.textAlign = "start";
        this.ctx.textBaseline = "top"
        this.ctx.fillStyle = "#fff";

        let score = Math.round(this.game.score);
        this.ctx.fillText(`Score: ${score}`, 10, this.yPos + 10); // text and position
    }
}