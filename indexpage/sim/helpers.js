Math.TAU = Math.PI*2;

function hitCircle(x,y,mx,my,radius){
	var dx = mx-x;
	var dy = my-y;
	return((dx*dx+dy*dy)<(radius*radius));
}

function hitRectangle(mx,my, x,y,w,h){
	if(mx<x) return false;
	if(my<y) return false;
	if(mx>x+w) return false;
	if(my>y+h) return false;
	return true;
}

function drawRoundedRectangle(ctx,x,y,w,h,radius){
	
	ctx.beginPath();
	ctx.rect(x,y+radius,w,h-radius*2);
	ctx.fill();
	
	ctx.beginPath();
	ctx.rect(x+radius,y,w-radius*2,h);
	ctx.fill();

	ctx.beginPath();
	ctx.arc(x+radius, y+radius, radius, 0, Math.TAU);
	ctx.fill();

	ctx.beginPath();
	ctx.arc(x+w-radius, y+radius, radius, 0, Math.TAU);
	ctx.fill();
	
	ctx.beginPath();
	ctx.arc(x+radius, y+h-radius, radius, 0, Math.TAU);
	ctx.fill();
	
	ctx.beginPath();
	ctx.arc(x+w-radius, y+h-radius, radius, 0, Math.TAU);
	ctx.fill();

}

function getParameterByName(name){
	var url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
};

function drawLabel(ctx, label, x, y, lineHeight){ // WITH NEW LINES
	var lines = label.split("<br>");
	for(var i=0; i<lines.length; i++){
		ctx.fillText(lines[i], x, y);
		y += lineHeight;
	}
}