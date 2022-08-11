/****************************

TRY: LINKED REPRESENTATIONS!

****************************/

window.IS_IN_SIGHT = true; //(window==window.top);

// SIM MODE?
// 0 - fishing
// 1 - fishing with growth
// 2 - landscape
// 3 - change hills
// 4 - full sim
var SIM_MODE = parseInt(getParameterByName("mode"));

var canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.style.width = "400px";
canvas.style.height = "600px";
if(SIM_MODE==0){
	//canvas.style.height = 350;
	canvas.style.height = "340px";
}
if(SIM_MODE==1){
	canvas.style.height = "380px";
}
if(SIM_MODE==2){
	canvas.style.height = "340px";
}
if(SIM_MODE==3){
	canvas.style.height = "400px";
}
canvas.width = parseInt(canvas.style.width)*2;
canvas.height = parseInt(canvas.style.height)*2;
var ctx = canvas.getContext('2d');

// INIT
window.onload = function(){
	Mouse.init(canvas);
	if(SIM_MODE==2 || SIM_MODE==3){
		Mouse.offset(0,-200);
	}
	init();
};

var population;
var populationSlider;
var hill;
var hillShaper;
var fish;
var moreButton, lessButton;

function init(){

	// Add Canvas
	document.body.appendChild(canvas);

	// Population
	population = new Population();
	if(SIM_MODE==0){
		population.NO_GROWTH = true;
		population.n = 500;
	}

	if(SIM_MODE==0 || SIM_MODE==1 || SIM_MODE==2 || SIM_MODE==3 || SIM_MODE==4){
		populationSlider = new PopulationSlider(population);
		if(SIM_MODE==0) populationSlider.NO_GROWTH = true;
		if(SIM_MODE==1) populationSlider.SHOW_LABELS = true;
	}

	if(SIM_MODE==0 || SIM_MODE==1 || SIM_MODE==4){
		fish = new Fish(population);
	}

	if(SIM_MODE==2 || SIM_MODE==3 || SIM_MODE==4){
		hill = new Hill(population);
	}

	if(SIM_MODE==3 || SIM_MODE==4){
		hillShaper = new HillShaper(population, hill);
	}

	// Buttons
	var externalVelocity = 16;
	if(SIM_MODE==0) externalVelocity=8;
	if(SIM_MODE==0 || SIM_MODE==1 || SIM_MODE==4){
		lessButton = new Button({
			x:200, y:25,
			width:150, height:35,
			label:labels.catchFish,
			onclick: function(){
				population.externalVelocity += -externalVelocity;
				try{
					SOUNDS.reel.play();
				}catch(e){}
			},
			fontsize:19
		});
		moreButton = new Button({
			x:200, y:65,
			width:150, height:35,
			label:labels.releaseFish,
			onclick: function(){
				population.externalVelocity += externalVelocity;
				try{
					SOUNDS.splash.play();
				}catch(e){}
			},
			fontsize:16
		});
	}

	// HINTS
	if(SIM_MODE==0){
		lessButton.hint.visible = true;
		moreButton.hint.visible = true;
		populationSlider.hint.visible = true;
	}
	if(SIM_MODE==2) populationSlider.hint.visible = true;
	if(SIM_MODE==3){
		hillShaper.hintUnder.visible = true;
		hillShaper.hintOver.visible = true;
	}

	// Update
	update();

}

// UPDATE
var HILL_Y = 0;
var GASPING = false;
function update(){

	// Only if you can SEE ME
	if(window.IS_IN_SIGHT){

		canvas.setAttribute("cursor", "none");

		// Model
		if(population) population.update();
		if(populationSlider) populationSlider.update();
		if(hill) hill.update();
		if(hillShaper) hillShaper.update();
		if(fish) fish.update();

		// Buttons
		if(lessButton) lessButton.update();
		if(moreButton) moreButton.update();

		// Draw
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.scale(2,2);
		if(SIM_MODE==2 || SIM_MODE==3){
			ctx.translate(0,-200);
			HILL_Y = -200;
		}
		{

			// Background
			//ctx.drawImage(images.placeholder, 0, 0, 400, 600);

			// The Water
			if(fish) fish.draw(ctx);
			if(SIM_MODE==0 || SIM_MODE==1 || SIM_MODE==4){
				if(!GASPING){
					if(population.n<0.1){
						GASPING = true;
						try{
							SOUNDS.gasp.play(); // SOUND
						}catch(e){}
					}
				}else{
					if(population.n>=0.1){
						GASPING = false;
					}
				}
				ctx.drawImage(
					GASPING ? images.water2 : images.water1,
					0, 10, 400, 200
				);
			}

			// The UI
			if(hill) hill.draw(ctx);
			if(populationSlider) populationSlider.draw(ctx);
			if(hillShaper) hillShaper.draw(ctx);

			// Buttons
			if(lessButton) lessButton.draw(ctx);
			if(moreButton) moreButton.draw(ctx);

		}
		ctx.restore();

		// Mouse
		Mouse.update();

	}

	// RAF
	requestAnimationFrame(update);

}


///////////////////////////////////////////////
// THE MODEL //////////////////////////////////
///////////////////////////////////////////////

// POPULATION
function Population(){

	var self = this;

	self.n = 350;
	self.thresholdUnder = 300;
	self.thresholdOver = 700;
	self.min = 0;
	self.max = 1000;

	self.NO_GROWTH = false;

	self.disabled = false;
	self.disable = function(){ self.disabled=true; };
	self.enable = function(){ self.disabled=false; };

	self.externalVelocity = 0;

	self.calculateVelocity = function(n){
		var velocity = ((n-self.thresholdUnder) * (self.thresholdOver-n))*0.0001;
		//if(Math.abs(velocity)<0.01) velocity=0; // too small? forget it
		return velocity;
	};

	self.update = function(){

		if(!self.NO_GROWTH){

			// Velocity & Bounds
			if(!self.disabled){
				self.n += self.calculateVelocity(self.n);
			}
			if(self.n<self.min) self.n=self.min;
			if(self.n>self.max) self.n=self.max;

		}

		// External velocity & bounds again
		if(!self.disabled){
			self.n += self.externalVelocity;
			self.externalVelocity *= 0.9;
		}else{
			self.externalVelocity = 0;
		}
		if(Math.abs(self.externalVelocity)<1) self.externalVelocity=0;
		if(self.n<self.min) self.n=self.min;
		if(self.n>self.max) self.n=self.max;

	}

}

function Fish(population){

	var self = this;

	self.population = population;

	self.top = 145;
	self.height = 65;
	self.width = 400;

	self.fishes = [];
	for(var i=0; i<100; i++){
		self.fishes.push({
			x: Math.random()*self.width,
			y: self.top+Math.random()*self.height,
			speed: (Math.random()>0.5?-1:1) * (0.05+Math.random()*0.15)
		});
	}
	var buffer = 50;
	self.update = function(){
		for(var i=0; i<self.fishes.length; i++){
			var fish = self.fishes[i];
			fish.x += fish.speed;
			if(fish.x<-buffer) fish.x=self.width+buffer;
			if(fish.x>self.width+buffer) fish.x=-buffer;
		}
	};
	self.draw = function(){
		var pop = self.population;
		var count = Math.round(self.fishes.length * (pop.n/pop.max));
		for(var i=0; i<count; i++){
			var fish = self.fishes[i];
			var img = images.fish;
			var w = 40;
			var h = w/2;
			ctx.save();
			ctx.translate(fish.x, fish.y);
			if(fish.speed<0) ctx.scale(-1,1);
			ctx.drawImage(img, -w/2, -h/2, w, h);
			ctx.restore();
		}
	};


}

function PopulationSlider(population){

	var self = this;

	self.population = population;
	var pop = self.population;

	self.NO_GROWTH = false;

	self.left = 50;
	self.top = 280;
	self.width = 300;
	self.buttonRadius = 25;
	self.buttonX = self.left;

	self.isDragging = false;
	self.dragOffset = 0;
	self.isHovering = false;

	self.hint = new UI_Hint({
		image: images.ui_slide,
		width: 90,
		height: 50,
		totalFrames: 6,
		delay: 5
	});

	self.update = function(){

		// Cursor!
		self.isHovering = hitCircle(self.buttonX, self.top, Mouse.x, Mouse.y, self.buttonRadius);
		if(self.isHovering && !self.isDragging){
			canvas.setAttribute("cursor", "grab");
		}
		if(self.isDragging){
			canvas.setAttribute("cursor", "grabbing");
		}

		// If you clicked this, drag it! (and disable population)
		if(!Mouse.lastPressed && Mouse.pressed){
			if(self.isHovering){
				self.hint.visible = false; // remove hint ON DRAG
				self.isDragging = true;
				self.dragOffset = Mouse.x-self.buttonX;
				population.disable();

				try{
					SOUNDS.drag_down.play(); // SOUND
				}catch(e){}
			}
		}

		// Drag it!
		if(self.isDragging){
			self.buttonX = Mouse.x - self.dragOffset;
			// Bounds
			if(self.buttonX<self.left) self.buttonX=self.left;
			if(self.buttonX>self.left+self.width) self.buttonX=self.left+self.width;
		}

		// Or... NOT.
		if(self.isDragging && !Mouse.pressed){
			self.isDragging = false;
			population.enable();

			try{
				SOUNDS.drag_up.play(); // SOUND
			}catch(e){}
		}

		// Slider -> Population, or Population -> Slider?
		var p = population;
		if(p.disabled){
			p.n = p.min + ((self.buttonX-self.left)/(self.width))*(p.max-p.min);
		}else{
			self.HACK_forceUpdate();
			//self.buttonX = self.left + ((p.n-p.min)/(p.max-p.min))*self.width;
		}

		// Hint
		self.hint.x = self.buttonX-45;
		self.hint.y = self.top+5;
		self.hint.update();

	};
	self.HACK_forceUpdate = function(){
		var p = population;
		self.buttonX = self.left + ((p.n-p.min)/(p.max-p.min))*self.width;
	};

	self.draw = function(ctx){

		// Label
		var label = labels.population+" "+Math.round(pop.n/10);
		ctx.font = '23px sans-serif';
		ctx.fillStyle = "#000";
		ctx.textAlign = "left";
		ctx.fillText(label, self.left-self.buttonRadius, self.top-35);

		// Slider
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.arc(self.left, self.top, self.buttonRadius, 0, Math.TAU);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(self.left+self.width, self.top, self.buttonRadius, 0, Math.TAU);
		ctx.fill();
		ctx.beginPath();
		ctx.rect(self.left, self.top-self.buttonRadius, self.width, self.buttonRadius*2);
		ctx.fill();

		// Button
		ctx.fillStyle = "hsl(0, 84%, "+(self.isHovering?70:59)+"%)";
		ctx.beginPath();
		ctx.arc(self.buttonX, self.top, self.buttonRadius, 0, Math.TAU);
		ctx.fill();

		if(!self.NO_GROWTH){

			// Thresholds...
			ctx.strokeStyle = "rgba(0,0,0,0.25)";
			ctx.lineWidth = 1;
			var x = _popToSlider(pop.thresholdUnder);
			ctx.beginPath();
			ctx.moveTo(x, self.top-self.buttonRadius);
			ctx.lineTo(x, self.top+295);
			var x = _popToSlider(pop.thresholdOver);
			ctx.moveTo(x, self.top-self.buttonRadius);
			ctx.lineTo(x, self.top+295);
			ctx.stroke();

			// Velocity Arrow
			ctx.fillStyle = "#fff";
			var velocity = pop.calculateVelocity(pop.n);
			var w = 10;
			var h = 15;
			var s = velocity*0.15;
			if(s>1.1) s=1.1;
			if(s<-1.1) s=-1.1;
			ctx.save();
			ctx.translate(self.buttonX, self.top);
			ctx.scale(s,s);
			ctx.translate(-w*0.6, 0);
				ctx.beginPath();
				ctx.moveTo(-w, -h/2); // top-left
				ctx.lineTo(w, -h/2); // middle-top
				ctx.lineTo(w, -h/2-w); // arrow-top
				ctx.lineTo(w+w*1.5, 0); // arrow-end
				ctx.lineTo(w, h/2+w); // arrow-bottom
				ctx.lineTo(w, h/2); // middle-bottom
				ctx.lineTo(-w, h/2); // bottom-left
				ctx.fill();
			ctx.restore();

			// Arrows
			ctx.strokeStyle = "#bbb";
			ctx.lineWidth = 2;
			ctx.save();
			ctx.translate(0, self.top+40);
				_drawArrow(ctx, pop.min-36, pop.thresholdUnder, -1);
				_drawArrow(ctx, pop.thresholdUnder, pop.thresholdOver, 1);
				_drawArrow(ctx, pop.thresholdOver, pop.max+36, -1);
			ctx.restore();

			if(self.SHOW_LABELS){

				// The labels
				ctx.font = '13px sans-serif';
				ctx.fillStyle = "#bbb";
				ctx.textAlign = "center";
				drawLabel(ctx, labels.underpopulation, 88, self.top+62, 15);
				drawLabel(ctx, labels.population_grows, 200, self.top+62, 15);
				drawLabel(ctx, labels.overpopulation, 315, self.top+62, 15);

			}

		}

		// Hint
		self.hint.draw(ctx);

	};


	var _drawNumber = function(ctx, number){
		var x = _popToSlider(number);
		var y = self.top+40;
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.rect(x-1, y-10, 2, 20);
		ctx.fill();
		ctx.fillStyle = "#aaa";
		ctx.fillText(Math.round(number/10).toString(), x, y);
	}

	var _drawArrow = function(ctx, from, to, direction){

		from = _popToSlider(from);
		to = _popToSlider(to);

		from += 10;
		to -= 10;
		if(to-from<5) return;
		/*from += 15;
		to -= 15;
		if(to-from<0) return;*/

		ctx.beginPath();
		ctx.moveTo(from, 0);
		ctx.lineTo(to, 0);
		ctx.stroke();

		// arrow head
		ctx.save();
		ctx.translate((direction>0)?to:from, 0);
		ctx.rotate((direction>0)?0:Math.TAU/2, 0);
			ctx.beginPath();
			ctx.moveTo(-5, -5);
			ctx.lineTo(0,0);
			ctx.lineTo(-5, 5);
			ctx.stroke();
		ctx.restore();

	}

	var _popToSlider = function(n){
		return self.left + ((n-pop.min)/(pop.max-pop.min))*self.width;
	};

}


function Hill(population){

	var self = this;

	self.population = population;

	self.left = 50;
	self.top = 360;
	self.width = 300;
	self.height = 150;

	self.isDragging = false;
	self.isHovering = false;
	self.dragOffsetX = 0;

	self.update = function(){
	}

	self.draw = function(ctx){

		// Calculate hill
		var points = [];
		var pop = self.population;
		var x = pop.min;
		var y = 600;
		points.push([x,y]);
		var ymin = y;
		var ymax = y;
		while(x<pop.max){
			var slope = pop.calculateVelocity(x);
			y += slope;
			x += 10;
			if(ymin>y) ymin=y;
			if(ymax<y) ymax=y;
			points.push([x,y]);
		}

		// Re-normalize...
		points.forEach(function(point){
			var x = self.left + ((point[0]-pop.min)/(pop.max-pop.min))*self.width;
			var y = self.top + ((point[1]-ymin)/(ymax-ymin))*self.height;
			point[0] = x;
			point[1] = y;
		});

		// Draw hill
		var p = points[0];
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(p[0], p[1]);
		for(var i=1; i<points.length; i++){
			var p = points[i];
			ctx.lineTo(p[0], p[1]);
		}
		ctx.stroke();

		// Calculate Ball's position...
		var x = self.left + ((pop.n-pop.min)/(pop.max-pop.min))*self.width;
		var a, b;
		for(var i=0; i<points.length; i++){
			if(x<points[i][0]){
				a = points[i-1];
				b = points[i];
				break;
			}
		}
		if(!a){ // IF NO THING? Just LAST POINT
			y = points[points.length-1][1];
		}else{
			var t = (x-a[0])/(b[0]-a[0]);
			var y = a[1] + t*(b[1]-a[1]);
		}

		// Draw slider to ball dotted line...
		ctx.strokeStyle = "#000";
		ctx.beginPath();
		ctx.lineWidth = 1;
		var line_dot = 0;
		for(var line_y=y; line_y>300; line_y-=2){
			if(line_dot%4==0){
				ctx.moveTo(x, line_y);
			}else if(line_dot%4==1){
				ctx.lineTo(x, line_y);
			}
			line_dot++;
		}
		ctx.stroke();


		///////////////////////////////////////
		// DRAGGING BALL???? //////////////////
		///////////////////////////////////////

		var ballRadius = 12;


		// Cursor:
		self.isHovering = hitCircle(x, y-ballRadius+HILL_Y, Mouse.x, Mouse.y+HILL_Y, ballRadius);
		if(self.isHovering && !self.isDragging) canvas.setAttribute("cursor", "grab");
		if(self.isDragging) canvas.setAttribute("cursor", "grabbing");

		// If you clicked this, drag it!
		if(!Mouse.lastPressed && Mouse.pressed){
			if(self.isHovering){
				self.isDragging = true;
				self.dragOffsetX = Mouse.x-x;
				population.disable();

				try{
					SOUNDS.squeak_down.play(); // SOUND
				}catch(e){}
			}
		}
		if(self.isDragging){

			x = Mouse.x - self.dragOffsetX;

			// Bounds
			if(x<self.left) x=self.left;
			if(x>self.left+self.width) x=self.left+self.width;

			// Slider -> Population, or Population -> Slider?
			var p = population;
			if(p.disabled){
				p.n = p.min + ((x-self.left)/(self.width))*(p.max-p.min);
			}
			populationSlider.HACK_forceUpdate();

		}
		if(self.isDragging && !Mouse.pressed){
			self.isDragging = false;
			population.enable();

			try{
				SOUNDS.squeak_up.play(); // SOUND
			}catch(e){}
		}


		// Draw Ball
		var angle = (x/(ballRadius*Math.TAU))*Math.TAU;
		ctx.save();
		ctx.translate(x, y-ballRadius);
		ctx.rotate(angle);
		ctx.fillStyle = "#000";
		ctx.beginPath(); ctx.arc(0, 0, ballRadius, 0, Math.TAU); ctx.fill();
		ctx.fillStyle = "#fff";
		ctx.beginPath(); ctx.arc(0, ballRadius*0.5, ballRadius*0.25, 0, Math.TAU); ctx.fill();
		ctx.restore();



	};

}

function HillShaper(population, hill){

	var self = this;
	self.population = population;
	self.hill = hill;

	self.top = 255;
	self.height = 320;

	// Convert positions...
	var pop = self.population;
	var hill = self.hill;
	var _popToHill = function(n){
		return hill.left + ((n-pop.min)/(pop.max-pop.min))*hill.width;
	};
	var _hillToPop = function(x){
		return pop.min + ((x-hill.left)/(hill.width))*(pop.max-pop.min);
	}
	self.buttonRadius = 25;
	self.underButtonX = _popToHill(pop.thresholdUnder);
	self.overButtonX = _popToHill(pop.thresholdOver);
	self.underButtonY = 550;
	self.overButtonY = self.underButtonY;

	self.isDraggingUnder = false;
	self.isDraggingOver = false;
	self.dragOffset = 0;

	self.isHoveringUnderThreshold = false;
	self.isHoveringOverThreshold = false;

	self.hintUnder = new UI_Hint({
		image: images.ui_slide,
		width: 90,
		height: 50,
		totalFrames: 6,
		delay: 5
	});
	self.hintOver = new UI_Hint({
		image: images.ui_slide,
		width: 90,
		height: 50,
		totalFrames: 6,
		delay: 5
	});

	// Dragging sliders -- the thresholds!
	self.update = function(){

		// Hover
		self.isHoveringUnderThreshold = Mouse.x<self.underButtonX
			&& hitCircle(self.underButtonX,self.underButtonY,Mouse.x,Mouse.y,self.buttonRadius);
		self.isHoveringOverThreshold = Mouse.x>self.overButtonX
			&& hitCircle(self.overButtonX,self.overButtonY,Mouse.x,Mouse.y,self.buttonRadius);
		if(!self.isDraggingUnder && self.isHoveringUnderThreshold){
			canvas.setAttribute("cursor", "grab");
		}else if(self.isDraggingUnder){
			canvas.setAttribute("cursor", "grabbing");
		}
		if(!self.isDraggingOver && self.isHoveringOverThreshold){
			canvas.setAttribute("cursor", "grab");
		}else if(self.isDraggingOver){
			canvas.setAttribute("cursor", "grabbing");
		}

		// Clicked...
		if(!Mouse.lastPressed && Mouse.pressed){

			// Clicked Under...
			if(!self.isDraggingUnder && self.isHoveringUnderThreshold){
				self.hintUnder.visible = false; // remove hint ON DRAG
				self.isDraggingUnder = true;
				self.dragOffset = Mouse.x-self.underButtonX;

				try{
					SOUNDS.drag_down.play(); // SOUND
				}catch(e){}
			}

			// Clicked Over...
			if(!self.isDraggingOver && self.isHoveringOverThreshold){
				self.hintOver.visible = false; // remove hint ON DRAG
				self.isDraggingOver = true;
				self.dragOffset = Mouse.x-self.overButtonX;

				try{
					SOUNDS.drag_down.play(); // SOUND
				}catch(e){}
			}

		}
		if(!Mouse.pressed){
			if(self.isDraggingUnder || self.isDraggingOver){

				try{
					SOUNDS.drag_up.play(); // SOUND
				}catch(e){}
			}
			self.isDraggingUnder = false;
			self.isDraggingOver = false;
		}

		// Dragging...
		if(Mouse.pressed){
			if(self.isDraggingUnder){
				self.underButtonX = Mouse.x-self.dragOffset;

				// Bounds & Push
				if(self.underButtonX<hill.left) self.underButtonX=hill.left;
				if(self.underButtonX>hill.left+hill.width) self.underButtonX=hill.left+hill.width;
				if(self.underButtonX>self.overButtonX) self.overButtonX=self.underButtonX;

			}
			if(self.isDraggingOver){
				self.overButtonX = Mouse.x-self.dragOffset;

				// Bounds & Push
				if(self.overButtonX<hill.left) self.overButtonX=hill.left;
				if(self.overButtonX>hill.left+hill.width) self.overButtonX=hill.left+hill.width;
				if(self.underButtonX>self.overButtonX) self.underButtonX=self.overButtonX;

			}
			pop.thresholdUnder = _hillToPop(self.underButtonX);
			pop.thresholdOver = _hillToPop(self.overButtonX);
		}

		// Hints
		self.hintUnder.x = self.underButtonX-45;
		self.hintUnder.y = self.underButtonY+5;
		self.hintUnder.update();
		self.hintOver.x = self.overButtonX-45;
		self.hintOver.y = self.overButtonY+5;
		self.hintOver.update();


	};

	self.draw = function(ctx){

		// Slider
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.arc(hill.left, self.underButtonY, self.buttonRadius, 0, Math.TAU);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(hill.left+hill.width, self.underButtonY, self.buttonRadius, 0, Math.TAU);
		ctx.fill();
		ctx.beginPath();
		ctx.rect(hill.left, self.underButtonY-self.buttonRadius, hill.width, self.buttonRadius*2);
		ctx.fill();

		// Draw Under tab
		ctx.fillStyle = "hsl(0, 84%, "+(self.isHoveringUnderThreshold?70:59)+"%)";
		ctx.beginPath();
		ctx.arc(self.underButtonX, self.underButtonY, self.buttonRadius, Math.TAU/4, -Math.TAU/4);
		ctx.fill();

		// Draw Over tab
		ctx.fillStyle = "hsl(0, 84%, "+(self.isHoveringOverThreshold?70:59)+"%)";
		ctx.beginPath();
		ctx.arc(self.overButtonX, self.overButtonY, self.buttonRadius, -Math.TAU/4, Math.TAU/4);
		ctx.fill();

		// Draw hints
		self.hintUnder.draw(ctx);
		self.hintOver.draw(ctx);

	}

}

function Button(config){

	var self = this;

	self.x = config.x;
	self.y = config.y;
	self.width = config.width;
	self.height = config.height;
	self.onclick = config.onclick;
	self.label = config.label;
	self.fontsize = config.fontsize||20;

	self.isHovering = false;

	self.hint = new UI_Hint({
		image: images.ui_click,
		width: 50,
		height: 50,
		totalFrames: 2,
		delay: 15,
		x: self.x+self.width-20,
		y: self.y+self.height-25
	});

	self.update = function(){

		// Cursor!
		self.isHovering = hitRectangle(
			Mouse.x, Mouse.y,
			self.x, self.y, self.width, self.height
		);
		if(self.isHovering){
			canvas.setAttribute("cursor", "pointer");
		}

		// If you clicked this...
		if(!Mouse.lastPressed && Mouse.pressed){
			if(self.isHovering){
				self.hint.visible = false; // Remove hint ON CLICK
				self.onclick();
			}
		}

		self.hint.update();

	};

	self.draw = function(ctx){

		ctx.fillStyle = "hsl(0, 84%, "+(self.isHovering?70:59)+"%)";
		drawRoundedRectangle(ctx, self.x, self.y, self.width, self.height, 15);

		ctx.font = self.fontsize+'px sans-serif';
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.textBaseline="middle";
		ctx.fillText(self.label, self.x+self.width/2, self.y+self.height/2);

		self.hint.draw(ctx);

	};

}

function UI_Hint(config){
	var self = this;

	self.image = config.image;
	self.x = config.x || 0;
	self.y = config.y || 0;
	self.width = config.width;
	self.height = config.height;
	self.totalFrames = config.totalFrames;
	self.delay = config.delay;

	self.visible = false;

	self.currentFrame = 0;
	self.timer = 0;

	self.update = function(){
		self.timer++;
		if(self.timer>self.delay){
			self.timer=0;
			self.currentFrame = (self.currentFrame+1) % self.totalFrames;
		}
	};

	self.draw = function(ctx){
		if(!self.visible) return;
		var frameHeight = self.image.height/self.totalFrames;
		ctx.drawImage(self.image,
			0, self.currentFrame*frameHeight, self.image.width, frameHeight,
			self.x, self.y, self.width, self.height);
	};

}



///////////////////////////////////////////////
// META STUFF /////////////////////////////////
///////////////////////////////////////////////

// IMAGES
var images = {};
function addImage(name, src){
	images[name] = new Image();
	images[name].src = src;
}

addImage("water1", "img/water1.png");
addImage("water2", "img/water2.png");
addImage("fish", "img/fish.png");
addImage("ui_slide", "img/ui_slide.png");
addImage("ui_click", "img/ui_click.png");

// LABELS
var labels = {};
["population", "catchFish", "releaseFish",
"underpopulation", "overpopulation", "population_grows"].forEach(function(label){
	labels[label] = document.getElementById("label_"+label).innerHTML.trim();
});


//////////////////////
// SOUNDS ////////////
//////////////////////

var SOUNDS = {};

SOUNDS.squeak_down = new Howl({
	src: ["sounds/squeak_down.mp3"],
	volume: 1.0
});
SOUNDS.squeak_up = new Howl({
	src: ["sounds/squeak_up.mp3"],
	volume: 1.0
});
SOUNDS.drag_down = new Howl({
	src: ["sounds/drag_down.mp3"],
	volume: 1.0
});
SOUNDS.drag_up = new Howl({
	src: ["sounds/drag_up.mp3"],
	volume: 1.0
});
SOUNDS.splash = new Howl({
	src: ["sounds/splash.mp3"],
	volume: 1.0
});
SOUNDS.reel = new Howl({
	src: ["sounds/reel.mp3"],
	volume: 0.5
});
SOUNDS.gasp = new Howl({
	src: ["sounds/gasp.mp3"],
	volume: 1.0
});


