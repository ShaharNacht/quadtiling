const VERTEX_DIAMETER = 32;

canvas = document.getElementById("canvas");
button = document.getElementById("button");

ctx = canvas.getContext("2d");
editing = true;

function lineSegmentsIntersect( s1, e1, s2, e2 )
{
	let a_dx = e1.x - s1.x;
	let a_dy = e1.y - s1.y;
	let b_dx = e2.x - s2.x;
	let b_dy = e2.y - s2.y;
	let s = ( -a_dy*(s1.x-s2.x) + a_dx*(s1.y-s2.y) ) / ( -b_dx*a_dy + a_dx*b_dy );
	let t = ( b_dx*(s1.y-s2.y) - b_dy*(s1.x-s2.x) ) / ( -b_dx*a_dy + a_dx*b_dy );
	return ( s>0 && s<1 && t>0 && t<1 );
}

function quadSelfIntersects(quad)
{
	return ( lineSegmentsIntersect(quad[0],quad[1],quad[2],quad[3]) || lineSegmentsIntersect(quad[1],quad[2],quad[3],quad[0]) );
}

function fixQuad(quad)
{
	while ( quadSelfIntersects(quad) )
	{
		quad = quad.slice(1).concat( quad[0] );

		let temp = quad[0];
		quad[0] = quad[1];
		quad[1] = temp;
	}
	
	return quad;
}

// points = Array(4).fill().map( i => ({ x: canvas.width/4+Math.random()*canvas.width/2, y: canvas.height/4+Math.random()*canvas.height/2 }) );
points = [
	{ x: canvas.width/2-96, y: canvas.height/2-96 },
	{ x: canvas.width/2+96, y: canvas.height/2-96 },
	{ x: canvas.width/2-96, y: canvas.height/2+96 },
	{ x: canvas.width/2+96, y: canvas.height/2+96 }
];
points = fixQuad(points);

mouse = {};
mouse.x = 0;
mouse.y = 0;
mouse.down = false;
mouse.downPrev = false;
mouse.grab = false;
mouse.grabPoint = null;
mouse.grabOffset = { x: 0, y: 0 };
canvas.addEventListener("mousemove", function(e)
{
	if (!editing)
	{
		return;
	}
	
	mouse.down = ( e.which == 1 );
	
	let rect = canvas.getBoundingClientRect();
	mouse.x = e.clientX - rect.left;
	mouse.y = e.clientY - rect.top;
	
	if ( mouse.grab && !mouse.down )
	{
		mouse.grab = false;
	}
	else if (mouse.grab)
	{
		mouse.grabPoint.x = mouse.x - mouse.grabOffset.x;
		mouse.grabPoint.y = mouse.y - mouse.grabOffset.y;
		
		points = fixQuad(points);
	}
	else if ( mouse.down && !mouse.downPrev )
	{
		let p = points.find( i => point_distance(mouse.x,mouse.y,i.x,i.y)<VERTEX_DIAMETER/2 );
		if (p)
		{
			mouse.grab = true;
			mouse.grabPoint = p;
			mouse.grabOffset.x = mouse.x - p.x;
			mouse.grabOffset.y = mouse.y - p.y;
		}
	}
	
	mouse.downPrev = mouse.down;
	
	if (mouse.down)
	{
		draw_edit();
	}
});

button.onclick = function()
{
	if (!editing)
	{
		return;
	}
	
	editing = false;
	
	// make the origin the middle of the quad, instead of 0,0
	let midX = points.reduce( (r,v,i,a) => r+v.x/a.length, 0 );
	let midY = points.reduce( (r,v,i,a) => r+v.y/a.length, 0 );
	points = points.map( i => ({ x: i.x-midX, y: i.y-midY }) );
	
	// scale the quad down (for beauty reasons)
	points = points.map( i => ({ x: i.x/3, y: i.y/3 }) );
	
	draw_tile();
}

function draw_edit()
{
	ctx.fillStyle = "white";
	ctx.fillRect( 0, 0, canvas.width, canvas.height );
	
	ctx.strokeStyle = "black";
	ctx.lineWidth = 4;
	ctx.beginPath();
	for ( let i of points.keys() )
	{
		ctx[ (i==0)? "moveTo" : "lineTo" ]( points[i].x, points[i].y );
	}
	ctx.closePath();
	ctx.stroke();
	
	ctx.fillStyle = "black";
	for ( let i of points ) {
		ctx.beginPath();
		ctx.arc( i.x, i.y, VERTEX_DIAMETER/2, 0, deg.CIRCLE );
		ctx.closePath();
		ctx.fill();
	}
}

function draw_tile()
{
	// calculate how many quads would definitely fill the canvas (actual amount is (count*2)**2)
	let smallestDist = Math.min( ...points.map( (v,i) => point_distance( points[i].x, points[i].y, points[(i+1)%points.length].x, points[(i+1)%points.length].y ) ), point_distance( points[0].x, points[0].y, points[2].x, points[2].y ), point_distance( points[1].x, points[1].y, points[3].x, points[3].y ) );
	if ( smallestDist == 0 )
	{
		alert("This shape might require infinite copies to fill an area, please try again.");
		location.reload(true);
		return;
	}
	let count = Math.ceil( point_distance(canvas.width/2,canvas.height/2,0,0) / smallestDist ) + 1;
	
	// draw white background
	ctx.fillStyle = "white";
	ctx.fillRect( 0, 0, canvas.width, canvas.height );
	
	// draw the quads
	let diff1_x = points[2].x - points[0].x;
	let diff1_y = points[2].y - points[0].y;
	let diff2_x = points[3].x - points[1].x;
	let diff2_y = points[3].y - points[1].y;
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1.5;
	for ( let a=-count; a<=count; a++ )
	{
		for ( let b=-count; b<=count; b++ )
		{
			// draw a single quad
			ctx.beginPath();
			for ( let i of points.keys() ) {
				ctx[ (i==0)? "moveTo" : "lineTo" ]( canvas.width/2 + a*diff1_x + b*diff2_x + points[i].x, canvas.height/2 + a*diff1_y + b*diff2_y + points[i].y );
			}
			ctx.closePath();
			ctx.stroke();
		}
	}
	
	// old method:
	/*
	let singleTile = function (offsetX, offsetY) {
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1.5;
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
	
	loop(canvas.width * 2, canvas.height / 2, 300, 300);
	*/
}

draw_edit();