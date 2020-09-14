import {Game} from "./game.js"
import {IntroState} from "./introstate.js"

let gameCanvas = document.getElementById("gameScreen");
let gameCtx = gameCanvas.getContext("2d");
let hudCanvas = document.getElementById("hudScreen");
let hudCtx = hudCanvas.getContext("2d");

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
gameCanvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(gameCanvas, evt);
    var message = '' + mousePos.x.toFixed(1) + ', ' + mousePos.y.toFixed(1);
    document.getElementById('coord_label').innerHTML = message
}, false);

var GAME_HEIGHT = gameCanvas.height;
var GAME_WIDTH = gameCanvas.width;

gameCtx.fillStyle = "#fff";
hudCtx.fillStyle = "#fff";
gameCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

let game = new Game(GAME_WIDTH, GAME_HEIGHT, gameCtx, hudCanvas);
game.requestState(new IntroState());
