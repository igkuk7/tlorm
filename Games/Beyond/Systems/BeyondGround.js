// DEPENDENCY: System.js

/* system to render components */
TLORMEngine.Systems.BeyondGround = function(args) {
	args.type = 'BeyondGround';
	TLORMEngine.Systems.System.call(this, args);

	this.x = args.x || 0;
	this.y = args.y || 0;
	this.w = args.w || 800;
	this.h = args.h || 600;
	this.offset = { x: 0, y: 0 };
	this.level = args.seed || 1;
	this.ground_y_values = {};
	this.variance = 2;
	this.speed = 10;
	this.show_below = 0;
	this.show_above = 0;
};

// inherit from normal system
TLORMEngine.Systems.BeyondGround.extends(TLORMEngine.Systems.System);


TLORMEngine.Systems.BeyondGround.prototype.init = function(screen, reset) { 
	var self = this;
	screen.registerEvent("keydown", function(event) {
		if (event.keyCode == 68) {
			self.offset.x += self.speed;
		} else if (event.keyCode == 65) {
			self.offset.x -= self.speed;
		} else if (event.keyCode == 69) {
			self.show_above = 1;
		} else if (event.keyCode == 81) {
			self.show_below = 1;
		} else if (event.keyCode == 32) {
			self.changeLevel(self.level-self.show_below+self.show_above);
		}
	});
	screen.registerEvent("keyup", function(event) {
		if (event.keyCode == 69) {
			self.show_above = 0;
		} else if (event.keyCode == 81) {
			self.show_below = 0;
		}
	});
};

TLORMEngine.Systems.BeyondGround.prototype.changeLevel  = function(level) {
	this.level = level;
	console.log("Level "+this.level);
};

TLORMEngine.Systems.BeyondGround.prototype.update = function(screen, delta) {
};

TLORMEngine.Systems.BeyondGround.prototype.render = function(screen, context) {
	var colours = [ 0xFFFFFF, 0xFEFEFE, 0xEEEEEE, 0xEDEDED, 0xDDDDDD, 0xDCDCDC, 0xCCCCCC, 0xCBCBCB,
	                0xBBBBBB, 0xBABABA, 0xAAAAAA, 0xA9A9A9, 0x999999, 0x989898, 0x888888, 0x878787 ];
	var colour_index = 0;
	for (var i=-this.show_below; i<=this.show_above; ++i) {
		if (i==0) {
			colour = 0x000000;
		} else {
			colour = 0xDDDDDD;
		}
		var col = "#"+("000000"+colour.toString(16)).substr(-6);
		this.renderLevel(this.level+i, col, screen, context);
	}
};

TLORMEngine.Systems.BeyondGround.prototype.renderLevel = function(level, colour, screen, context) {

	context.lineWidth = 2;
	context.strokeStyle = colour;

	// render as 2 paths. from the middle to each side
	// reason for this is that the outlying values get generated from the existing values
	var start_x = this.x;
	var end_x = start_x + this.w;
	var middle_x = (start_x + end_x) / 2;

	context.beginPath();
	for (var x=middle_x; x>=start_x; --x) {
		if (x == middle_x) {
			context.moveTo(x, this.ground_y(x+this.offset.x, level));
		} else {
			context.lineTo(x, this.ground_y(x+this.offset.x, level));
		}
	}
	context.stroke();

	context.beginPath();
	for (var x=middle_x; x<=end_x; ++x) {
		if (x == middle_x) {
			context.moveTo(x, this.ground_y(x+this.offset.x, level));
		} else {
			context.lineTo(x, this.ground_y(x+this.offset.x, level));
		}
	}
	context.stroke();
};

TLORMEngine.Systems.BeyondGround.prototype.ground_y = function(x, level) {
	if (!level) {
		level = this.level;
	}
	if (!this.ground_y_values[level]) {
		this.ground_y_values[level] = {};
	}
	if (!this.ground_y_values[level][x]) {
		var prev_x = this.ground_y_values[level][x-1];
		var next_x = this.ground_y_values[level][x+1];
		if (prev_x && next_x) {
			this.ground_y_values[level][x] = (prev_x + next_x) / 2;
		} else if (prev_x) {
			this.ground_y_values[level][x] = prev_x + (-this.variance+Math.random()*this.variance*2);
		} else if (next_x) {
			this.ground_y_values[level][x] = next_x + (-this.variance+Math.random()*this.variance*2);
		} else {
			this.ground_y_values[level][x] = this.h- (Math.random()* this.h/2);
		}
	}
	return this.ground_y_values[level][x];
}