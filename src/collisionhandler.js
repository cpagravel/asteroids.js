import {getAdjacentBoundingBoxes, getAdjacentLineSets, getAdjacentVertexSets} from "./common.js"

export class CollisionHandler {
    constructor(game, ship, asteroids, bullets) {
        this.game = game;
        this.ship = ship;
        this.asteroids = asteroids;
        this.bullets = bullets;
    }

    //Line in polygon test credit: W Randolph Franklin, Prof, Rensselaer Polytechnic Institute @ https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
    _pointInPolygon(verts, point) {
        let i, j, c;
        i = j = c = 0;
        for (i = 0, j = verts.length - 1; i < verts.length; j = i++) {
            if ( ((verts[i].y > point.y) != (verts[j].y > point.y)) &&
                (point.x < (verts[j].x - verts[i].x) * (point.y - verts[i].y) / (verts[j].y - verts[i].y) + verts[i].x))
                c = !c;
        }
        return c;
    }

    //credit: Dan Fox @ https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    _detectLineIntersection(line1, line2) {
        var det, gamma, lambda;
        det = (line1.p2.x - line1.p1.x) * (line2.p2.y - line2.p1.y) - (line2.p2.x - line2.p1.x) * (line1.p2.y - line1.p1.y);
        if (det === 0) {
            return false;
        } else {
            lambda = ((line2.p2.y - line2.p1.y) * (line2.p2.x - line1.p1.x) + (line2.p1.x - line2.p2.x) * (line2.p2.y - line1.p1.y)) / det;
            gamma = ((line1.p1.y - line1.p2.y) * (line2.p2.x - line1.p1.x) + (line1.p2.x - line1.p1.x) * (line2.p2.y - line1.p1.y)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    };

    //Credit: ZorbaTHut @ http://gamedev.stackexchange.com/a/587
    _detectBoxIntersection(boxA, boxB) { // broad phase stuff
        return ((Math.abs((boxA.x + boxA.width/2) - (boxB.x + boxB.width/2)) * 2 < (boxA.width + boxB.width)) &&
            (Math.abs((boxA.y + boxA.height/2) - (boxB.y + boxB.height/2)) * 2 < (boxA.height + boxB.height)))
    }

    _narrowPhaseBulletCollisionDetection(bullet, asteroid) {
        let bulletLines = getAdjacentLineSets(bullet.lines(), this.game).flat();
        let verts = asteroid.vertices();
        for (let j = 0; j < bulletLines.length; j++) {
            if (this._pointInPolygon(verts, bulletLines[j].p1) || this._pointInPolygon(verts, bulletLines[j].p2)) {
                return true;
            }
        }
        return false;
    }

    handleBulletCollisions() {
        //broad phase detection
        for (let i = 0; i < this.bullets.length; i++) {
            for (let j = 0; j < this.asteroids.length; j++) {
                let aBoundingBoxes = getAdjacentBoundingBoxes(this.asteroids[j].boundingBox(), this.game);
                let bulletBoundingBox = this.bullets[i].boundingBox();
                for (let aBoxIndex = 0; aBoxIndex < aBoundingBoxes.length; aBoxIndex++) {
                    if (this._detectBoxIntersection(aBoundingBoxes[aBoxIndex], bulletBoundingBox)) {
                        // narrow phase
                        if (this._narrowPhaseBulletCollisionDetection(this.bullets[i], this.asteroids[j])) {
                            //collision
                            this.asteroids[j].health -= this.bullets[i].damage;
                            this.asteroids[j].animateDamage = true;
                            if (this.asteroids[j].health < 0) {
                                this.asteroids[j].markForDeletion = true;
                                this.game.score += this.asteroids[j].maxHealth;
                            }
                            this.bullets[i].markForDeletion = true;
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    handleShipCollision() {
        let shipBoundingBoxes = getAdjacentBoundingBoxes(this.ship.boundingBox(), this.game);
        let shipLines = getAdjacentLineSets(this.ship.lines(), this.game).flat();
        for (let a = 0; a < this.asteroids.length; a++) {
            for (let shipBoxIndex = 0; shipBoxIndex < shipBoundingBoxes.length; shipBoxIndex++) {
                if (this._detectBoxIntersection(shipBoundingBoxes[shipBoxIndex], this.asteroids[a].boundingBox())) {
                    //narrow phase
                    let aLines = this.asteroids[a].lines();
                    for (let sLine = 0; sLine < shipLines.length; sLine++) {
                        for (let aLine = 0; aLine < aLines.length; aLine++) {
                            if (this._detectLineIntersection(shipLines[sLine], aLines[aLine])) {
                                // ship Collision
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}
