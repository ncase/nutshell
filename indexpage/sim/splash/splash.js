window.IS_IN_SIGHT = (window==window.top);

var canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.style.width = document.body.clientWidth+"px";
canvas.style.height = "250px";
canvas.width = parseInt(canvas.style.width)*2;
canvas.height = parseInt(canvas.style.height)*2;
var ctx = canvas.getContext('2d');

// WAVES
var waves, ball;
var ZE_COLOR = "#555555";

// INIT
window.onload = function(){
	
	Mouse.init(canvas);

	// Add Canvas
	document.body.appendChild(canvas);

	// Waves & Balls
	waves = new Waves();
	ball = new Ball({waves:waves});

	// Update
	update();

};

// UPDATE
function update(){

	// Only if you can SEE ME
	if(window.IS_IN_SIGHT){
		canvas.setAttribute("cursor", "none");

		// Draw
		ctx.fillStyle = "#222";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.scale(2,2);

		waves.update();
		ball.update();

		waves.draw(ctx);
		ball.draw(ctx);

		ctx.restore();

		// Mouse!
		Mouse.update();

	}

	// RAF
	requestAnimationFrame(update);

}


// WAVE
function Waves(){
	var self = this;

	var waves = [];
	for(var i=1; i<=4; i++){
		waves.push({
			phase: Math.TAU*Math.random(),
			phaseVel: (Math.random()-0.5)*4,
			freq: (document.body.clientWidth/Math.TAU)/i,
			amp: 28
		});
	}

	self.update = function(){
		waves.forEach(function(wave){
			wave.phase += wave.phaseVel;
		});
	};
	self.draw = function(ctx){

		ctx.strokeStyle = ZE_COLOR;
		ctx.lineWidth = 6;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		
		ctx.beginPath();
		for(var x=0; x<document.body.clientWidth; x+=5){
			var y = self.getYAtX(x);
			if(x==0){
				ctx.moveTo(x,y);
			}else{
				ctx.lineTo(x,y);
			}
		}
		ctx.stroke();

	};

	self.getYAtX = function(x){
		var y = 0;
		waves.forEach(function(wave){
			y += Math.sin((wave.phase+x)/wave.freq)*wave.amp;
		});
		return y+125;
	};

	self.getSlopeAtX = function(x){
		var dy = 0;
		waves.forEach(function(wave){
			dy += -Math.cos((wave.phase+x)/wave.freq)*wave.amp; // DERIV of SIN(X) = -COS(X)
		});
		return dy;
	};

}

// BALL
function Ball(config){

	var self = this;

	self.waves = config.waves;

	self.x = document.body.clientWidth/2;
	self.y = -20;
	self.vx = 0;
	self.vy = 0;

	self.isDragging = false;
	self.isHovering = false;
	self.dragOffsetX = 0;
	self.dragOffsetY = 0;

	self.rotation = 0;

	self.update = function(){

		var lastX = self.x;


		///////////////////////////////////////
		// DRAGGING... ////////////////////////
		///////////////////////////////////////

		// Cursor:
		self.isHovering = hitCircle(self.x, self.y-ballRadius-2.9, Mouse.x, Mouse.y, ballRadius);
		if(self.isHovering && !self.isDragging){
			canvas.setAttribute("cursor", "grab");
		}
		if(self.isDragging){
			canvas.setAttribute("cursor", "grabbing");
		}

		// If you clicked this, drag it!
		if(!Mouse.lastPressed && Mouse.pressed){
			if(self.isHovering){
				self.isDragging = true;
				self.dragOffsetX = Mouse.x-self.x;
				self.dragOffsetY = Mouse.y-self.y;

				try{
					SOUNDS.squeak_down.play();
				}catch(e){}
			}
		}
		if(self.isDragging){
			var lastX = self.x;
			var lastY = self.y;
			self.x = Mouse.x - self.dragOffsetX;
			self.y = Mouse.y - self.dragOffsetY;

			self.vx += self.x-lastX;
			self.vy += self.y-lastY;
			self.vx *= 0.5;
			self.vy *= 0.5;
		}
		if(self.isDragging && !Mouse.pressed){
			self.isDragging = false;

			try{
				SOUNDS.squeak_up.play();
				throw Error();
			}catch(e){}
		}

		///////////////////////////////////////
		// PHYSICS... /////////////////////////
		///////////////////////////////////////

		// Fall
		if(!self.isDragging){
			self.x += self.vx;
			self.y += self.vy;
			self.vy += 0.1; // gravity
		}

		// If touching ground, move X.
		var groundY = self.waves.getYAtX(self.x);
		if(self.y >= groundY-5){ // with buffer
			self.y = groundY;
			self.vy = 5;
			/*var gotoVX = -self.waves.getSlopeAtX(self.x)*0.05;
			self.vx = (self.vx*0.9 + gotoVX*0.1);*/
			self.vx = -self.waves.getSlopeAtX(self.x)*0.05;
		}

		// Loop
		if(self.x<-100){
			self.x = document.body.clientWidth+100;
		}
		if(self.x>document.body.clientWidth+100){
			self.x = -100;
		}

		// Rotation...
		if(!self.isDragging){
			self.rotation += (self.x-lastX);
		}

	}
	var ballRadius = 18;
	self.draw = function(ctx){

		// Draw Ball
		var angle = (self.rotation/(ballRadius*Math.TAU))*Math.TAU;
		ctx.save();
		ctx.translate(self.x, self.y-ballRadius-2.9);
		ctx.rotate(angle);
		ctx.fillStyle = ZE_COLOR;
		ctx.beginPath(); ctx.arc(0, 0, ballRadius, 0, Math.TAU); ctx.fill();
		ctx.fillStyle = "#222";
		ctx.beginPath(); ctx.arc(0, ballRadius*0.5, ballRadius*0.25, 0, Math.TAU); ctx.fill();
		ctx.restore();

	}

}

//////////////////////
// SOUNDS ////////////
//////////////////////

var SOUNDS = {};

SOUNDS.squeak_down = new Howl({
	src: ["../sounds/squeak_down.mp3"],
	volume: 1.0
});
SOUNDS.squeak_up = new Howl({
	src: ["../sounds/squeak_up.mp3"],
	volume: 1.0
});

