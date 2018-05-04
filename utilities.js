//v11.0

function clamp(val,min,max)
{
	return Math.min(Math.max(min,val),max);
}
function mapNumber(num,in_min,in_max,out_min,out_max)
{
	return (num-in_min)*(out_max-out_min)/(in_max-in_min)+out_min;
}
function fromRange(rangeOrStart,end)
{
	let s;
	let e;
	if (arguments.length==1)
	{
		s=rangeOrStart[0];
		e=rangeOrStart[1];
	}
	else if (arguments.length==2)
	{
		s=rangeOrStart;
		e=end;
	}
	
	return s+Math.random()*(e-s);
}
function average()
{
	var count=arguments.length;
	var total=0;
	var i=0;
	while (i<count)
	{
		total+=arguments[i++];
	}
	return total/count;
}
function deg(i)
{
	return i*Math.PI/180;
}
deg.CIRCLE=deg(360);
function repeat(times,callback)
{
	if (times>0)
	{
		for (let i of new Array(Math.ceil(times)).keys())
		{
			callback(i);
		}
	}
}
function point_distance(x1,y1,x2,y2)
{
	return Math.hypot(x2-x1,y2-y1);
}
function point_direction(x1,y1,x2,y2)
{
	return Math.atan2(y2-y1,x2-x1);
}
function point_distance_3d(v1,v2)
{
	return Math.hypot(v2.x-v1.x,v2.y-v1.y,v2.z-v1.z);
}
function drawRoundRect(ctx,x,y,w,h,r,fill,stroke)
{
	//Draws a rounded rectangle on a canvas.
	//
	//Properties:
	//	ctx: The context to draw on
	//	x: Left
	//	y: Top
	//	w: Width
	//	h: Height
	//	r: Corner radius
	//	fill: Either false, or a string representing the fill color
	//	stroke: Either false, or a string representing the stroke color
	
	ctx.beginPath();
	ctx.moveTo(x,y+r);
	ctx.arcTo(x,y,x+r,y,r);
	ctx.lineTo(x+w-r,y);
	ctx.arcTo(x+w,y,x+w,y+r,r);
	ctx.lineTo(x+w,y+h-r);
	ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
	ctx.lineTo(x+r,y+h);
	ctx.arcTo(x,y+h,x,y+h-r,r);
	ctx.closePath();
	
	if (fill)
	{
		ctx.fillStyle=fill;
		ctx.fill();
	}
	if (stroke)
	{
		ctx.strokeStyle=stroke;
		ctx.stroke();
	}
}
function fov(FOV,aspect)
{
	return 2*Math.atan(Math.tan(FOV*Math.PI/180/2)*(1/aspect))*180/Math.PI;
}
function toScreenPosition(position,camera)
{
	var vector=position.clone();
	var widthHalf=renderer.context.canvas.width/2;
	var heightHalf=renderer.context.canvas.height/2;
	
	vector.project(camera);
	vector.x =(vector.x*widthHalf)+widthHalf;
	vector.y =-(vector.y*heightHalf)+heightHalf;
	
	return {x:vector.x,y:vector.y};
}
function HSVtoINT(h,s,v)
{
	//All arguments are in range 0 <= x <= 1
	
	let r,g,b;
	let i=Math.floor(h*6);
	let f=h*6-i;
	let p=v*(1-s);
	let q=v*(1-f*s);
	let t=v*(1-(1-f)*s);
	switch (i%6)
	{
		case 0: r=v;g=t;b=p;break;
		case 1: r=q;g=v;b=p;break;
		case 2: r=p;g=v;b=t;break;
		case 3: r=p;g=q;b=v;break;
		case 4: r=t;g=p;b=v;break;
		case 5: r=v;g=p;b=q;break;
	}
	r=Math.round(r*255);
	g=Math.round(g*255);
	b=Math.round(b*255);
	
	return r<<16|g<<8|b;
}