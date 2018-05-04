const VERTEX_DIAMETER = 32;

ctx = canvas.getContext("2d");
editing = true;

function lineSegmentsIntersect(s1, e1, s2, e2) {
    let a_dx = e1.x - s1.x;
    let a_dy = e1.y - s1.y;
    let b_dx = e2.x - s2.x;
    let b_dy = e2.y - s2.y;
    let s = (-a_dy * (s1.x - s2.x) + a_dx * (s1.y - s2.y)) / (-b_dx * a_dy + a_dx * b_dy);
    let t = (+b_dx * (s1.y - s2.y) - b_dy * (s1.x - s2.x)) / (-b_dx * a_dy + a_dx * b_dy);
    return (s > 0 && s < 1 && t > 0 && t < 1);
}

function quadSelfIntersects(quad) {
    return (lineSegmentsIntersect(quad[0], quad[1], quad[2], quad[3]) || lineSegmentsIntersect(quad[1], quad[2], quad[3], quad[0]));
}

function fixQuad(quad) {
    while (quadSelfIntersects(quad)) {
        quad = quad.slice(1).concat(quad[0]);

        let temp = quad[0];
        quad[0] = quad[1];
        quad[1] = temp;
    }

    return quad;
}

//points = Array(4).fill().map( i => ({ x:canvas.width/4+Math.random()*canvas.width/2, y:canvas.height/4+Math.random()*canvas.height/2 }) );
points = [{x: canvas.width / 2 - 96, y: canvas.height / 2 - 96}, {
    x: canvas.width / 2 + 96,
    y: canvas.height / 2 - 96
}, {x: canvas.width / 2 - 96, y: canvas.height / 2 + 96}, {x: canvas.width / 2 + 96, y: canvas.height / 2 + 96}];
points = fixQuad(points);

mouse = {};
mouse.x = 0;
mouse.y = 0;
mouse.down = false;
mouse.downPrev = false;
mouse.grab = false;
mouse.grabPoint = null;
mouse.grabOffset = {x: 0, y: 0};
canvas.addEventListener("mousemove", function (e) {
    if (!editing) {
        return;
    }

    mouse.down = (e.which == 1);

    let rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    if (mouse.grab && !mouse.down) {
        mouse.grab = false;
    }
    else if (mouse.grab) {
        mouse.grabPoint.x = mouse.x - mouse.grabOffset.x;
        mouse.grabPoint.y = mouse.y - mouse.grabOffset.y;

        points = fixQuad(points);
    }
    else if (mouse.down && !mouse.downPrev) {
        let p = points.find(i => point_distance(mouse.x, mouse.y, i.x, i.y) < VERTEX_DIAMETER / 2);
        if (p) {
            mouse.grab = true;
            mouse.grabPoint = p;
            mouse.grabOffset.x = mouse.x - p.x;
            mouse.grabOffset.y = mouse.y - p.y;
        }
    }

    mouse.downPrev = mouse.down;

    if (mouse.down) {
        draw();
    }
});

function done() {
    if (!editing) {
        return;
    }

    editing = false;

    points = points.map(i => ({x: (i.x - canvas.width / 2) / 3, y: (i.y - canvas.height / 2) / 3}));

    /*let minX = Math.min( ...points.map( i => i.x ) );
    let minY = Math.min( ...points.map( i => i.y ) );
    points = points.map( i => ({ x:i.x-minX, y:i.y-minY }) );*/

    tile();
}

function draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i of points.keys()) {
        ctx[(i == 0 ? "moveTo" : "lineTo")](points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "black";
    for (let i of points) {
        ctx.beginPath();
        ctx.arc(i.x, i.y, VERTEX_DIAMETER / 2, 0, deg.CIRCLE);
        ctx.closePath();
        ctx.fill();
    }
}

function tile() {
    let singleTile = function (offsetX, offsetY) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "square";
        ctx.beginPath();
        for (let i of points.keys()) {
            ctx[(i == 0 ? "moveTo" : "lineTo")](points[i].x + offsetX, points[i].y + offsetY);
        }
        ctx.closePath();
        ctx.stroke();
    }

    let loop = function (biasx, biasy, x, y) {
        let y_abs = points[2].y - points[0].y;
        let x_abs = points[2].x - points[0].x;

        let y_abs2 = points[3].y - points[1].y;
        let x_abs2 = points[3].x - points[1].x;

        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                singleTile(biasx + x_abs * i + x_abs2 * j, biasy + y_abs * i + y_abs2 * j);
            }
        }
    };

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let min = Math.min(...points.map(i => i.x));
    let max = Math.max(...points.map(i => i.x));

    // singleTile( 200, 200, false );
    // singleTile( 200+points[2].x-points[0].x, 200+points[2].y-points[0].y, false );
    // singleTile( 200+(points[2].x-points[0].x)*2, 200+(points[2].y-points[0].y)*2, false );
    //
    // singleTile( 200+points[3].x-points[1].x, 200+points[3].y-points[1].y, false );
    // singleTile( 200+points[3].x-points[1].x+points[2].x-points[0].x, 200+points[3].y-points[1].y+points[2].y-points[0].y, false );
    // singleTile( 200+points[3].x-points[1].x+(points[2].x-points[0].x)*2, 200+points[3].y-points[1].y+(points[2].y-points[0].y)*2, false );
    //
    // singleTile( 200+(points[3].x-points[1].x)*2, 200+(points[3].y-points[1].y)*2, false );
    // singleTile( 200+(points[3].x-points[1].x)*2+points[2].x-points[0].x, 200+(points[3].y-points[1].y)*2+points[2].y-points[0].y, false );
    // singleTile( 200+(points[3].x-points[1].x)*2+(points[2].x-points[0].x)*2, 200+(points[3].y-points[1].y)*2+(points[2].y-points[0].y)*2, false );

    loop(canvas.width * 2, canvas.height / 2, 300, 300);

}


btnDone.onclick = done;

draw();