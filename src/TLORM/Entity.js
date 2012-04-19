
/* store all quick, predefined  entities in here */
TLORM.QuickEntity = {};

TLORM.Entity = function(name, components, x, y, w, h) {
	this.id = null;
	this.name = name;

	/* TODO, move these to physics component */
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	
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