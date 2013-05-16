TLORMEngine.EntityManager = function() {
	this.next_id = 1;
	this.all_screens = 'TLORM_ALL_SCREENS';
	this.entities_by_screen = {};
	this.entities_by_type = {};
	this.entities_by_name = {};
	this.entities_by_id = {};
	this.entities_to_remove = [];
	this.entities_to_add = [];
	this.entity_components_to_remove = [];
	this.entity_components_to_add = [];
};

TLORMEngine.EntityManager.prototype.addEntity = function(entity) {
	this.entities_to_add.push(entity);
	return entity;
};

TLORMEngine.EntityManager.prototype._addEntity = function(entity) {
	entity.id = this.next_id++;

	var screens = entity.screens;
	if (!screens || screens.length == 0) {
		screens = [ { name: this.all_screens } ];
	}
	for (var i=0; i<screens.length; ++i) {
		var screen = screens[i];

		if (!this.entities_by_screen[screen.name]) {
			this.entities_by_screen[screen.name] = [];
		}
		this.entities_by_screen[screen.name].push(entity);

		if (!this.entities_by_type[screen.name]) {
			this.entities_by_type[screen.name] = {};
		}
		for (var i = 0; i < entity.components.length; ++i) {
			if (!this.entities_by_type[screen.name][entity.components[i].type]) {
				this.entities_by_type[screen.name][entity.components[i].type] = [];
			}
			this.entities_by_type[screen.name][entity.components[i].type].push(entity);
		}

	}

	this.entities_by_id[entity.id] = entity;
	this.entities_by_name[entity.name] = entity;

	entity.initAllComponents(true);
	return entity;
};

TLORMEngine.EntityManager.prototype.removeEntity = function(entity) {
	this.entities_to_remove.push(entity);
};
TLORMEngine.EntityManager.prototype._removeEntity = function(entity) {
	var screens = entity.screens;
	if (!screens || screens.length == 0) {
		screens = [ { name: this.all_screens } ];
	}
	for (var i=0; i<screens.length; ++i) {
		var screen = screens[i];

		if (this.entities_by_screen[screen.name]) {
			for (var i = 0; i < this.entities_by_screen[screen.name].length; ++i) {
				if (this.entities_by_screen[screen.name][i] === entity) {
					this.entities_by_screen[screen.name].splice(i, 1);
					break;
				}
			}
		}

		if (this.entities_by_type[screen.name]) {
			for (var i = 0; i < entity.components.length; ++i) {
				var component = entity.components[i];
				if (this.entities_by_type[screen.name][component.type]) {
					for (var j = 0; j < this.entities_by_type[screen.name][component.type].length; ++j) {
						if (this.entities_by_type[screen.name][component.type][j] === entity) {
							this.entities_by_type[screen.name][component.type].splice(j, 1);
							break;
						}
					}
				}
			}
		}
	}

	if (this.entities_by_id[entity.id]) {
		delete this.entities_by_id[entity.id];
	}

	if (this.entities_by_name[entity.name]) {
		delete this.entities_by_name[entity.name];
	}
};

TLORMEngine.EntityManager.prototype.getEntities = function(screen) {
	return this.entities_by_screen[screen.name].concat(this.entities_by_screen[this.all_screens]);
};

TLORMEngine.EntityManager.prototype.getEntityByName = function(screen, name) {
	return this.entities_by_name[name];
};

TLORMEngine.EntityManager.prototype.getEntitiesByType = function(screen, type) {
	var entities = [];
	if (this.entities_by_type[screen.name] && this.entities_by_type[screen.name][type]) {
		entities = this.entities_by_type[screen.name][type];
	}
	if (this.entities_by_type[this.all_screens] && this.entities_by_type[this.all_screens][type]) {
		entities = entities.concat(this.entities_by_type[this.all_screens][type]);
	}

	return entities;
};

TLORMEngine.EntityManager.prototype.getEntitiesByTypes = function(screen, types, no_types) {
	if (no_types === undefined) {
		no_types = [];
	}

	// get all entites for each type
	var entity_ids = {};
	for (var i = 0; i < types.length; ++i) {
		var entity_types = this.getEntitiesByType(screen, types[i]);
		for (var e = 0; e < entity_types.length; ++e) {
			var entity = entity_types[e];
			if (entity_ids[entity.id]) {
				entity_ids[entity.id]++;
			} else {
				entity_ids[entity.id] = 1;
			}
		}
	}

	var entities = [];
	for (var id in entity_ids) {
		var has_no_type = false;
		for (var i = 0; i < no_types.length; ++i) {
			if (this.entities_by_id[id].getComponentByType(no_types[i])) {
				has_no_type = true;
				break;
			}
		}
		if (!has_no_type && entity_ids[id] >= types.length) {
			entities.push(this.entities_by_id[id]);
		}
	}

	return entities;
};

TLORMEngine.EntityManager.prototype.getEntitiesByPosition = function(screen, x, y) {
	var entities = [];
	var screen_entities = this.getEntities(screen);
	for (var i = 0; i < screen_entities.length; i++) {
		if (screen_entities[i].x === x && screen_entities[i].y === y) {
			entities.push(screen_entities[i]);
		}
	}

	return entities;
};

TLORMEngine.EntityManager.prototype.getActiveComponents = function(screen) {
	var components_found = {};
	var components = []
	if (this.entities_by_type[screen.name]) {
		for (var component in this.entities_by_type[screen.name]) {
			if (!components_found[component]) {
				components_found[component] = true;
				components.push(component);
			}
		}
	}
	if (this.entities_by_type[this.all_screens]) {
		for (var component in this.entities_by_type[this.all_screens]) {
			if (!components_found[component]) {
				components_found[component] = true;
				components.push(component);
			}
		}
	}

	return components;
};

TLORMEngine.EntityManager.prototype.addEntityComponent = function(entity, component) {
	this.entity_components_to_add.push({
		entity : entity,
		component : component
	});
};

TLORMEngine.EntityManager.prototype._addEntityComponent = function(entity, component) {
	if (this.entities_by_id[entity.id]) {
		entity.addComponent(component);

		var screens = entity.screens;
		if (!screens || screens.length == 0) {
			screens = [ { name: this.all_screens } ];
		}
		for (var i=0; i<screens.length; ++i) {
			var screen = screens[i];

			if (!this.entities_by_type[screen.name][component.type]) {
				this.entities_by_type[screen.name][component.type] = [];
			}
			var found = false;
			for (var i = 0; i < this.entities_by_type[screen.name][component.type].length; ++i) {
				if (this.entities_by_type[screen.name][component.type][i] === entity) {
					found = true;
					break;
				}
			}
			if (!found) {
				this.entities_by_type[screen.name][component.type].push(entity);
			}
		}
	}
};

TLORMEngine.EntityManager.prototype.removeEntityComponent = function(entity, component) {
	this.entity_components_to_remove.push({
		entity : entity,
		component : component
	});
};

TLORMEngine.EntityManager.prototype.removeEntityComponentByType = function(entity, type) {
	var component = entity.getComponentByType(type);
	if (component) {
		if (!component instanceof Array) {
			component = [ component ];
		}
		for (var i=0; i<component.length; ++i) {
			this.entity_components_to_remove.push({
				entity : entity,
				component : component[i]
			});
		}
	}
};

TLORMEngine.EntityManager.prototype._removeEntityComponent = function(entity, component) {
	if (this.entities_by_id[entity.id]) {
		entity.removeComponent(component);

		// only remove is all components removed
		if (!component.multiple || entity.getComponentByType(component.type).length == 0) {
			var screens = entity.screens;
			if (!screens || screens.length == 0) {
				screens = [ { name: this.all_screens } ];
			}
			for (var i=0; i<screens.length; ++i) {
				var screen = screens[i];
				for (var i = 0; i < this.entities_by_type[screen.name][component.type].length; ++i) {
					if (this.entities_by_type[screen.name][component.type][i] === entity) {
						this.entities_by_type[screen.name][component.type].splice(i, 1);
						break;
					}
				}
			}
		}
	}
};

TLORMEngine.EntityManager.prototype.initAllEntities = function(reset) {
	for (var id in this.entities_by_id) {
		this.entities_by_id[id].initAllComponents(reset);
	}
};

TLORMEngine.EntityManager.prototype.update = function(game) {
	for (var i = 0; i < this.entity_components_to_remove.length; ++i) {
		this._removeEntityComponent(this.entity_components_to_remove[i].entity, this.entity_components_to_remove[i].component);
	}
	this.entity_components_to_remove = [];

	var entities_to_remove = [];
	for (var i = 0; i < this.entities_to_remove.length; ++i) {
		if (this.entities_to_remove[i].destroyed(game)) {
			this._removeEntity(this.entities_to_remove[i]);
		} else {
			entities_to_remove.push(this.entities_to_remove[i]);
		}
	}
	this.entities_to_remove = entities_to_remove;

	for (var i = 0; i < this.entity_components_to_add.length; ++i) {
		this._addEntityComponent(this.entity_components_to_add[i].entity, this.entity_components_to_add[i].component);
	}
	this.entity_components_to_add = [];

	for ( i = 0; i < this.entities_to_add.length; ++i) {
		this._addEntity(this.entities_to_add[i]);
	}
	this.entities_to_add = [];
};

