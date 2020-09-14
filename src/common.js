export function drawPolygon(ctx, vertices, strokeStyle = "#000", lineWidth = 1, fillStyle = null) {
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 0; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y)
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    ctx.closePath();
    ctx.lineWidth = 1;
}

export function drawLines(ctx, lines, strokeStyle = "#000", lineWidth = 1) {
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i < lines.length; i++) {
        ctx.moveTo(lines[i].p1.x, lines[i].p1.y);
        ctx.lineTo(lines[i].p2.x, lines[i].p2.y);
    }
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 1;
}

export function getAdjacentBoundingBoxes(boundingBox, game) {
    //boundingboxes are {x:, y:, width:, height:}
    let boundingBoxSets = [];
    let index = [-1, 0, 1];
    index.forEach(i => {
        index.forEach(j => {
            if (i*j == 0) {
                boundingBoxSets.push({
                    x: boundingBox.x + i*game.gameWidth,
                    y: boundingBox.y + j*game.gameHeight,
                    width: boundingBox.width,
                    height: boundingBox.height});
            }
        });
    });
    return boundingBoxSets;
}

export function getAdjacentLineSets(lines, game) {
    //lines are [{p1: {x: , y: }, p2: {x: , y: }}, ...]
    let lineSets = [];
    let index = [-1, 0, 1];
    index.forEach(i => {
        index.forEach(j => {
            if (i*j == 0) {
                let lineSet = [];
                for (let l = 0; l < lines.length; l++) {
                    let p1 = {x: lines[l].p1.x + i*game.gameWidth, y: lines[l].p1.y + j*game.gameHeight};
                    let p2 = {x: lines[l].p2.x + i*game.gameWidth, y: lines[l].p2.y + j*game.gameHeight};
                    lineSet.push({p1: p1, p2: p2});
                }
                lineSets.push(lineSet);
            }
        });
    });
    return lineSets;
}

export function getAdjacentVertexSets(vertices, game) {
    //vertices are [{x: , y: }, ...]
    let vertexSets = [];
    let index = [-1, 0, 1];
    index.forEach(i => {
        index.forEach(j => {
            if (i*j == 0) {
                let vertexSet = [];
                for (let v = 0; v < vertices.length; v++) {
                    vertexSet.push(
                        {x: vertices[v].x + i*game.gameWidth, y: vertices[v].y + j *game.gameHeight});
                }
                vertexSets.push(vertexSet);
            }
        });
    });
    return vertexSets;
}
