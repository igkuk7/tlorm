TLORMEngine.SystemManager = function() {
	this.next_id = 1;
	this.systems = [];
	this.systems_by_id = {};
	this.systems_by_type = {};

	// load all systems
	for (var system_type in TLORMEngine.Systems) {
		if (system_type == "System") {
			continue;
		}
		this.addSystem(new TLORMEngine.Systems[system_type]({}));
	}

	// keep track of which systems are active
	this.active_systems = {};
	this.always_active_systems = {};
};

TLORMEngine.SystemManager.prototype.getSystemByType = function(type) {
	return this.systems_by_type[type];
};

TLORMEngine.SystemManager.prototype.addSystem = function(system) {
	system.id = this.next_id++;
	this.systems.push(system);
	this.systems_by_id[system.id] = system;
	this.systems_by_type[system.type] = system;
};

TLORMEngine.SystemManager.prototype.initAllSystems = function(screen, reset) {
	for (var i = 0; i < this.systems.length; ++i) {
		if (this.systems[i].init) {
			this.systems[i].init(screen, reset);
		}
	}
};

TLORMEngine.SystemManager.prototype.updateActiveSystems = function(components) {
	var active_systems = {};
	for (var i = 0; i < this.systems.length; ++i) {
		var system_components = this.systems[i].componentsUsed();
		for (var j=0; j<components.length; ++j) {
			if (system_components[components[j]]) {
				active_systems[this.systems[i].type] = true;
				break;
			}
		}
	}
	for (var system in this.always_active_systems) {
		active_systems[system] = true;
	}
	
	this.active_systems = active_systems;
};

TLORMEngine.SystemManager.prototype.updateAllSystems = function(screen, delta) {
	this.updateActiveSystems(screen.getActiveComponents());
	for (var i = 0; i < this.systems.length; ++i) {
		if (this.active_systems[this.systems[i].type] && this.systems[i].update) {
			this.systems[i].update(screen, delta);
		}
	}
};

TLORMEngine.SystemManager.prototype.renderAllSystems = function(screen, context) {
	for (var i = 0; i < this.systems.length; ++i) {
		if (this.active_systems[this.systems[i].type] && this.systems[i].render) {
			this.systems[i].render(screen, context);
		}
	}
};

