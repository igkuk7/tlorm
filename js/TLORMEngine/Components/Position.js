// DEPENDENCY: Component.js

TLORMEngine.Components.Position = function(args) {
	args.type = 'Position';
	TLORMEngine.Components.Component.call(this, args);

	this.hw = this.w / 2;
	this.hh = this.h / 2;
	this.hd = this.d / 2;
	this.mx = this.x+this.hw;
	this.my = this.y+this.hh;
	this.mz = this.z+this.d/2;
	this.move_direction = "";
};

// inherit from normal component
TLORMEngine.Components.Position.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Position.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		x: { type: "number" },
		y: { type: "number" },
		z: { type: "number" },
		w: { type: "number", default: 0 },
		h: { type: "number", default: 0 },
		d: { type: "number", default: 0 },
		angle_x: { type: "number", default: 0 },
		angle_y: { type: "number", default: 0 },
		angle_z: { type: "number", default: 0 },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Position.prototype.getX = function() {
	return this.x;
};
TLORMEngine.Components.Position.prototype.getY = function() {
	return this.y;
};

TLORMEngine.Components.Position.prototype.getMiddleX = function() {
	return this.mx;
};
TLORMEngine.Components.Position.prototype.getMiddleY = function() {
	return this.my;
};

TLORMEngine.Components.Position.prototype.is3D = function() {
	if (this.z !== null && this.z != undefined) {
		return true;
	} else {
		return false;
	}
};

TLORMEngine.Components.Position.prototype.rotateBy = function(dx, dy, dz) {
	if (dx !== null) {
		this.angle_x += dx;
		this.angle_x %= 2*Math.PI;
	}
	if (dy !== null) {
		this.angle_y += dy;
		this.angle_y %= 2*Math.PI;
	}
	if (dz !== null) {
		this.angle_z += dz;
		this.angle_z %= 2*Math.PI;
	}
};

TLORMEngine.Components.Position.prototype.moveBy = function(dx, dy, dz) {
	if (dx !== null && dx !== undefined && dx != 0) {
		this.x += dx;
		this.mx = this.x+this.hw;
		this.move_direction = (dx < 0 ? "left" : "right");
	}
	if (dy !== null && dy !== undefined && dy != 0) {
		this.y += dy;
		this.my = this.y+this.hh;
		this.move_direction = (dy < 0 ? "up" : "down");
	}
	if (dz !== null && dz !== undefined && dz != 0) {
		this.z += dz;
		this.mz = this.z+this.hd;
	}
};

TLORMEngine.Components.Position.prototype.moveTo = function(x, y, z) {
	if (x !== null) {
		this.move_direction = (x < this.x ? "left" : "right");
		this.x = x;
		this.mx = this.x+this.hw;
	}
	if (y !== null) {
		this.move_direction = (y < this.y ? "up" : "down");
		this.y = y;
		this.my = this.y+this.hh;
	}
	if (z !== null) {
		this.z = z;
		this.mz = this.z+this.d/2;
	}
};

TLORMEngine.Components.Position.prototype.collides = function(position) {
	if (this.x + this.w < position.x || this.y + this.h < position.y || this.x > position.x + position.w || this.y > position.y + position.h) {
		return false;
	}

	return true;
};

TLORMEngine.Components.Position.prototype.direction = function() {
	return this.move_direction;
};

TLORMEngine.Components.Position.prototype.collisionDirection = function(position) {
	var bottom = this.y + this.h;
	var tiles_bottom = position.y + position.h;
	var right = this.x + this.w;
	var tiles_right = position.x + position.w;
	var b_collision = tiles_bottom - this.y;
	var t_collision = bottom - position.y;
	var l_collision = right - position.x;
	var r_collision = tiles_right - this.x;

	if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision) {
		return "top";
	}
	if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision) {
		return "bottom";
	}
	if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision) {
		return "left";
	}
	if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision) {
		return "right";
	}
};