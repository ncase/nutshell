/////////////////////////////
// MOUSE ////////////////////
/////////////////////////////

var Mouse = {
	x:0, y:0,
	pressed:false
};
Mouse.init = function(target){

	// JUST ADD ALL THE EVENTS
	target.addEventListener("mousedown", Mouse.ondown);
	target.addEventListener("mousemove", Mouse.onmove);
	window.addEventListener("mouseup", Mouse.onup);

	// TOUCH.
	function _touchWrapper(callback){
		return function(event){
			var _event = {};
			_event.offsetX = event.changedTouches[0].clientX;
			_event.offsetY = event.changedTouches[0].clientY;
			event.preventDefault();
			callback(_event);
		};
	}
	target.addEventListener("touchstart", _touchWrapper(Mouse.ondown), false);
	target.addEventListener("touchmove", _touchWrapper(Mouse.onmove), false);
	document.body.addEventListener("touchend", Mouse.onup, false);

};
Mouse.offsetX = 0;
Mouse.offsetY = 0;
Mouse.offset = function(ox,oy){
	Mouse.offsetX = ox;
	Mouse.offsetY = oy;
};
Mouse.ondown = function(event){
	Mouse.pressed = true;
	Mouse.onmove(event);
};
Mouse.onmove = function(event){
	Mouse.x = event.offsetX - Mouse.offsetX;
	Mouse.y = event.offsetY - Mouse.offsetY;
};
Mouse.onup = function(event){
	Mouse.pressed = false;
};
Mouse.update = function(){

	// Just pressed, or just released (one frame ago)
	Mouse.justPressed = (!Mouse.lastPressed && Mouse.pressed);
	Mouse.justReleased = (Mouse.lastPressed && !Mouse.pressed);

	// The last frame's stuff
	Mouse.lastX = Mouse.x;
	Mouse.lastY = Mouse.y;
	Mouse.lastPressed = Mouse.pressed;

};