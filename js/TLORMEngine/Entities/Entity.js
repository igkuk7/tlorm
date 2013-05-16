TLORMEngine.Entities.Entity = function(args) {
	this.id = null;
	this.name = args.name;
	this.screens = args.screens || [];

	this.already_destroyed = false;

	this.components = [];
	this.components_by_type = {};
	var incoming_components = args.components || [];
	for (var i = 0; i < incoming_components.length; ++i) {
		this.addComponent(incoming_components[i]);
	}
};

TLORMEngine.Entities.Entity.prototype.addComponent = function(component) {
	if (component.multiple) {
		this.components.push(component);
		if (!this.components_by_type[component.type]) {
			this.components_by_type[component.type] = [];
		}
		this.components_by_type[component.type].push(component);
	} else {
		if (this.components_by_type[component.type]) {
			this.removeComponent(this.components_by_type[component.type]);
		}
		this.components.push(component);
		this.components_by_type[component.type] = component;
	}
};

TLORMEngine.Entities.Entity.prototype.removeComponent = function(component) {
	for (var i = 0; i < this.components.length; ++i) {
		if (this.components[i] === component) {
			this.components.splice(i, 1);
		}
	}
	if (component.multiple) {
		for (var i = 0; i < this.components_by_type[component.type].length; ++i) {
			if (this.components_by_type[component.type][i] === component) {
				this.components_by_type[component.type].splice(i, 1);
			}
		}
	} else {
		delete this.components_by_type[component.type];
	}
};

TLORMEngine.Entities.Entity.prototype.removeComponentByType = function(type) {
	if (this.components_by_type[type]) {
		if (this.components_by_type[type] instanceof Array) {
			for (var i = 0; i < this.components_by_type[type].length; ++i) {
				this.removeComponent(this.components_by_type[type][i]);
			}
		} else {
			this.removeComponent(this.components_by_type[component.type]);
		}
	}
};

TLORMEngine.Entities.Entity.prototype.getComponentByType = function(type) {
	if (this.components_by_type[type]) {
		return this.components_by_type[type];
	}

	return null;
};

TLORMEngine.Entities.Entity.prototype.initAllComponents = function(reset) {
	for (var i = 0; i < this.components.length; ++i) {
		if (this.components[i].init) {
			this.components[i].init(reset);
		}
	}
};

TLORMEngine.Entities.Entity.prototype.destroy = function(screen) {
	for (var i = 0; i < this.components.length; ++i) {
		this.components[i].entityDestroyed(screen, this);
	}
};

TLORMEngine.Entities.Entity.prototype.destroyed = function(screen) {
	if (!this.already_destroyed) {
		this.destroy(screen);
		this.already_destroyed = true;
	}

	for (var i = 0; i < this.components.length; ++i) {
		if (!this.components[i].entityIsDestroyed() ){
			return false;
		}
	}
	return true;
};