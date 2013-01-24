
/* store all quick, predefined  entities in here */
TLORM.QuickEntity = {};

TLORM.Entity = function(name, components, x, y, w, h) {
	this.id = null;
	this.name = name;

	/* TODO, move these to physics component */
	this.px = x;
	this.py = y;
	this.x = x;
	this.y = y;
	this.point  = new TLORM.Math.Point(x, y);
	this.w = w;
	this.h = h;
	this.bounding_box = new TLORM.Math.Quadrilateral(
		new TLORM.Math.Point(x,   y  ),
		new TLORM.Math.Point(x+w, y+h)
	);
	
	this.components = [];
	this.components_by_type = {};
	
	if (components) {
		for (var i=0; i<components.length; ++i) {
			this.addComponent(components[i]);
		}
	}
};

TLORM.Entity.prototype.addComponent = function(component) {
	this.components.push(component);
	this.components_by_type[component.type] = component;
};

TLORM.Entity.prototype.removeComponent = function(component) {
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i] === component) {
			this.components.splice(i, 1);
		}
	}
	delete this.components_by_type[component.type];
};


TLORM.Entity.prototype.getComponentByType = function(type) {
	if (this.components_by_type[type]) {
		return this.components_by_type[type];
	}
	
	return null;
};

TLORM.Entity.prototype.initAllComponents = function(game) {
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i].init) {
			this.components[i].init(game);
		}
	}
};

TLORM.Entity.prototype.initAllComponents = function(game) {
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i].init) {
			this.components[i].init(game);
		}
	}
};

TLORM.Entity.prototype.getRequiredSystems = function() {
	var systems = [];
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i].system) {
			systems.push(this.components[i].system);
		}
	}
	return systems;
};

TLORM.Entity.prototype.move = function(dx, dy) {
	this.moveTo((dx == null ? null : this.x+dx), (dy == null ? null : this.y+dy));
};

TLORM.Entity.prototype.moveTo = function(x, y) {
	this.px = this.x;
	this.py = this.y;
	
	if (x != null) {
		this.x = x;
		this.point.x = x;
	}
	
	if (y != null) {
		this.point.y = x;
		this.y = y;
	}
	
	this.bounding_box = new TLORM.Math.Quadrilateral(
		new TLORM.Math.Point(this.x,        this.y       ),
		new TLORM.Math.Point(this.x+this.w, this.y+this.h)
	);
};

TLORM.Entity.prototype.direction = function() {
	var x_diff = this.px - this.x;
	var y_diff = this.py - this.y;
	
	if (x_diff == 0 && y_diff == 0) {
		return '';
	} else if (x_diff < 0) {
		return 'R';
	} else if (x_diff > 0) {
		return 'L';
	} else if (y_diff < 0) {
		return 'D';
	} else if (y_diff > 0) {
		return 'U';
	}
	
}