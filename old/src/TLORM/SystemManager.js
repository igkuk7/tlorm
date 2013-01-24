
TLORM.SystemManager = function() {
	this.next_id = 1;
	this.systems = [];
	this.systems_by_type = {};
	this.systems_by_id = {};
};

TLORM.SystemManager.prototype.getSystemByType = function(type) {
	return this.systems_by_type[type];
};

TLORM.SystemManager.prototype.addSystem = function(system) {
	system.id = this.next_id++;
	this.systems.push(system);
	this.systems_by_type[system.type] = system;
	this.systems_by_id[system.id] = system;
};

TLORM.SystemManager.prototype.getSystems = function() {
	return this.systems;
};

TLORM.SystemManager.prototype.initAllSystems = function(game) {
	for (var i=0; i<this.systems.length; ++i) {
		if (this.systems[i].init) {
			this.systems[i].init(game);
		}
	}
};

TLORM.SystemManager.prototype.updateAllSystems = function(game) {
	for (var i=0; i<this.systems.length; ++i) {
		if (this.systems[i].type != 'Render') {
			this.systems[i].update(game);
		}
	}
};

TLORM.SystemManager.prototype.renderAllSystems = function(game) {
	this.systems_by_type['Render'].update(game);
};


