
TLORM.EntityManager = function() {
	this.next_id = 1;
	this.entities = [];
	this.entities_by_type = {};
	this.entities_by_id = {};
};

TLORM.EntityManager.prototype.addEntity = function(entity) {
	entity.id = this.next_id++;
	
	this.entities.push(entity);
	
	for (var i=0; i<entity.components.length; ++i) {
		if (!this.entities_by_type[entity.components[i].type]) {
			this.entities_by_type[entity.components[i].type] = [];
		}
		this.entities_by_type[entity.components[i].type].push(entity);
	}
	
	this.entities_by_id[entity.id] = entity;
	
	return entity;
};

TLORM.EntityManager.prototype.removeEntity = function(entity) {
	for (var i=0; i<this.entities.length; ++i) {
		if (this.entities[i] === entity) {
			this.entities.splice(i, 1);
			break;
		}
	}

	for (i=0; i<entity.components.length; ++i) {
		var component = entity.components[i];
		if (this.entities_by_type[component.type]) {
			for (var j=0; j<this.entities_by_type[component.type].length; ++j) {
				if (this.entities_by_type[component.type][j] === entity) {
					this.entities_by_type[component.type].splice(j, 1);
					break;
				}
			}
		}
	}
	
	if (this.entities_by_id[entity.id]) {
		delete this.entities_by_id[entity.id];
	}
};

TLORM.EntityManager.prototype.getEntities = function() {
	return this.entities;
};

TLORM.EntityManager.prototype.getEntitiesByType = function(type) {
	if (this.entities_by_type[type]) {
		return this.entities_by_type[type];
	}
	
	return [];
};

TLORM.EntityManager.prototype.getEntitiesByPosition= function(x,y) {
	var entities = [];
	for (var i = 0; i<this.entities.length; i++) {
		if (this.entities[i].x === x && this.entities[i].y === y) {
			entities.push(this.entities[i]);
		}
	}
	
	return entities;
};

TLORM.EntityManager.prototype.addEntityComponent = function(entity, component) {
	if (this.entities_by_id[entity.id]) {
		entity.addComponent(component);
		if (!this.entities_by_type[component.type]) {
			this.entities_by_type[component.type] = [];
		}
		this.entities_by_type[component.type].push(entity);
	}
};

TLORM.EntityManager.prototype.removeEntityComponent = function(entity, component) {
	if (this.entities_by_id[entity.id]) {
		entity.removeComponent(component);

		for (var i=0; i<this.entities_by_type[component.type].length; ++i) {
			if (this.entities_by_type[component.type][i] === entity) {
				this.entities_by_type[component.type].splice(i, 1);
				break;
			}
		}
	}
};

TLORM.EntityManager.prototype.initAllEntities = function(game) {
	for (var i=0; i<this.entities.length; ++i) {
		this.entities[i].initAllComponents(game);
	}
};

TLORM.EntityManager.prototype.getRequiredSystems = function() {
	var systems = [];
	for (var i=0; i<this.entities.length; ++i) {
		systems = systems.concat(this.entities[i].getRequiredSystems());
	}
	return systems;
};


