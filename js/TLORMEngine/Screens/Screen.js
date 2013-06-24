TLORMEngine.Screens.Screen = function(args) {
	this.id = null;
	this.name = args.name;
	this.setArgs(args);
	
	// setup event handling
	this.events = {};

	// param for changing screens
	this.clearChange();

	// sort out GUI
	this.buildGUIElements();	
};

// TODO: fix these "any" fragments
TLORMEngine.Screens.Screen.prototype.args_schema = function () {
	return {
		switch_screen: { type: "object", title: "Configure Switching Screens", default: {} },
		class: { type: "string", title: "CSS Class", default: "" },
		show_text: { type: "array", title: "Show Text on Screen", default: [] },
		show_images: { type: "array", title: "Show Images on Screen", default: [] },
		show_name: { type: "boolean", title: "Show the Screen Name on Screen?", default: true },
		show_back: { type: "boolean", title: "Show back button to previous screen?", default: true }
	};
}
TLORMEngine.Screens.Screen.prototype.setArgs = function(args) {
	var args_schema = this.args_schema();
	for ( var key in args_schema ) {
		if (args[key] != undefined) {
			// TODO: some kind of validation here
			this[key] = args[key];
		} else if (args_schema[key].default != undefined) {
			this[key] = args_schema[key].default;
		}
	}
};

TLORMEngine.Screens.Screen.prototype.buildGUIElements = function() {
	this.container_el = document.createElement("div");
	if (this.class) {
		this.container_el.className = this.class;
	}
	this.name_el = document.createElement("h1");
	this.name_el.className = "name";
	this.name_el.appendChild(document.createTextNode(this.name));
	this.back_el = document.createElement("a");
	this.back_el.href = "#"
	this.back_el.className = "back";
	this.back_el.appendChild(document.createTextNode("Back"));

	var menu_screen = this;
	this.back_el.addEventListener("click", function(event) {
		menu_screen.back();
		return false;
	});

	if (this.show_text.length > 0) {
		for (var i=0; i<this.show_text.length; ++i) {
			var span = document.createElement("span");
			if (this.show_text[i].class) {
				span.className = this.show_text[i].class;
			}

			if (this.show_text[i].text) {
				span.appendChild(document.createTextNode(this.show_text[i].text));
			} else if (this.show_text[i].html) {
				span.innerHTML = this.show_text[i].html;
			}
			
			this.container_el.appendChild(span);
		}
	}

	if (this.show_images.length > 0) {
		for (var i=0; i<this.show_images.length; ++i) {
			var span = document.createElement("span");
			if (this.show_images[i].class) {
				span.className = this.show_text[i].class;
			}
			var img = new Image()
			img.src = this.show_images[i].src;
			span.appendChild(img);
			this.container_el.appendChild(span);
		}
	}
};

TLORMEngine.Screens.Screen.prototype.needsChange = function() {
	return this.change.goto;
};

TLORMEngine.Screens.Screen.prototype.needsReset = function() {
	return this.change.reset;
};

TLORMEngine.Screens.Screen.prototype.clearChange = function() {
	this.change = { goto: "", reset: false };
};

TLORMEngine.Screens.Screen.prototype.setChange = function(goto, reset) {
	this.change = { goto: goto, reset: reset || false };
};

TLORMEngine.Screens.Screen.prototype.init = function(game, reset) {
	this.initSwitchScreens();
	document.body.appendChild(this.container_el);
	if (this.show_back) {
		this.container_el.insertBefore(this.back_el, this.container_el.firstChild);
	}
	if (this.show_name) {
		this.container_el.insertBefore(this.name_el, this.container_el.firstChild);
	}
};

TLORMEngine.Screens.Screen.prototype.initSwitchScreens = function() {
	
	// setup event to change screens
	var screen = this;
	for (var i=0; i<this.switch_screen.length; ++i) {
		for (var j=0; j<this.switch_screen[i].conditions.length; ++j) {
			if (this.switch_screen[i].conditions[j].key_code) {
				var condition = this.switch_screen[i].conditions[j];
				this.registerEvent("keyup", function(event) {
					if (condition.key_code == event.keyCode) {
						condition.key_code_pressed = true;
					}
				});
			}
		}
	}
};

TLORMEngine.Screens.Screen.prototype.back = function() {
	this.change = { goto: "TLORM_BACK", reset: false };
};

TLORMEngine.Screens.Screen.prototype.update = function(game, delta) {
	var switch_screen = this.switchScreens();
	if (switch_screen) {
		this.setChange(switch_screen.goto, switch_screen.reset);
	}
};

TLORMEngine.Screens.Screen.prototype.switchScreens = function() {
	for (var i=0; i<this.switch_screen.length; ++i) {
		// TODO: use condition manager for this
		if (this.check_conditions(null, this.switch_screen[i].conditions)) {
			return this.switch_screen[i];
		}
	}

	return null;
};

TLORMEngine.Screens.Screen.prototype.conditionsPassed = function(conditions) {
	var goto = "";

	var expected = conditions.length;
	var results = 0;
	for (var i=0; i<conditions.length; ++i) {
		if (this.conditionPassed(conditions[i])) {
			++results;
		}
	}

	return results == expected;
};

TLORMEngine.Screens.Screen.prototype.conditionPassed = function(condition) {
	if (condition.entity) {
		var entity = this.getEntityByName(condition.entity);
		if (entity) {
			var component = entity.getComponentByType(condition.component);
			if (component) {
				var value = component[condition.function].apply(component, condition.args);
				return this.checkConditionValue(condition.check, condition.value, value);
			}
		}
	} else if (condition.components) {
		var entities = this.getEntitiesByTypes(condition.components, condition.not_components || []);
		return this.checkConditionValue(condition.check, condition.value, entities.length);
	} else if (condition.key_code) {
		if (condition.key_code_pressed) {
			condition.key_code_pressed = false;
			return true;
		} else {
			return false;
		}
	}

	return false;
};

TLORMEngine.Screens.Screen.prototype.checkConditionValue = function(check, desired, actual) {
	if (check == "<") {
		return actual < desired;
	} else if (check == ">") {
		return actual > desired;
	} else if (check == "<=") {
		return actual <= desired;
	} else if (check == ">=") {
		return actual >= desired;
	} else if (check == "=") {
		return actual == desired;
	}
};

TLORMEngine.Screens.Screen.prototype.render = function(game, context) {
};

TLORMEngine.Screens.Screen.prototype.cleanUp = function() {
	document.body.removeChild(this.container_el);

	this.clearAllRegisteredEvents();
};

TLORMEngine.Screens.Screen.prototype.registerEvent = function(type, callback) {
	document.addEventListener(type, callback);
	if (!this.events[type]) { this.events[type] = []; }
	this.events[type].push(callback);
};

TLORMEngine.Screens.Screen.prototype.clearAllRegisteredEvents = function() {
	for (var type in this.events) {
		for (var i=0; i<this.events[type].length; ++i) {
			document.removeEventListener(type, this.events[type][i]);
		}
	}
};

TLORMEngine.Screens.Screen.prototype.setEntityManager = function(entity_manager) {
	this.entity_manager = entity_manager;
};

TLORMEngine.Screens.Screen.prototype.setConditionManager = function(condition_manager) {
	this.condition_manager = condition_manager;
};
TLORMEngine.Screens.Screen.prototype.setResourceManager = function(resource_manager) {
	this.resource_manager = resource_manager;
};

TLORMEngine.Screens.Screen.prototype.setGame = function(game) {
	this.game = game;
};

TLORMEngine.Screens.Screen.prototype.setSize = function(w, h) {
	this.width = w;
	this.height = h;
};

TLORMEngine.Screens.Screen.prototype.getEntities = function() {
	return this.entity_manager.getEntities(this);
};

TLORMEngine.Screens.Screen.prototype.getEntityByName = function(name) {
	return this.entity_manager.getEntityByName(this, name);
};

TLORMEngine.Screens.Screen.prototype.getEntitiesByType = function(type) {
	return this.entity_manager.getEntitiesByType(this, type)
};

TLORMEngine.Screens.Screen.prototype.getEntitiesByTypes = function(types, no_types) {
	return this.entity_manager.getEntitiesByTypes(this, types, no_types)
};

TLORMEngine.Screens.Screen.prototype.getEntitiesByPosition = function(x, y) {
	return this.entity_manager.getEntitiesByPosition(this, x, y)
};

TLORMEngine.Screens.Screen.prototype.getActiveComponents = function() {
	return this.entity_manager.getActiveComponents(this)
};

TLORMEngine.Screens.Screen.prototype.getAllComponents = function(type) {
	return this.entity_manager.getAllComponents(this, type)
};

TLORMEngine.Screens.Screen.prototype.addEntity = function(entity) {
	this.entity_manager.addEntity(entity);
};
TLORMEngine.Screens.Screen.prototype.removeEntity = function(entity) {
	this.entity_manager.removeEntity(entity);
};
TLORMEngine.Screens.Screen.prototype.addEntityComponent = function(entity, component) {
	this.entity_manager.addEntityComponent(entity, component);
};
TLORMEngine.Screens.Screen.prototype.removeEntityComponent = function(entity, component) {
	this.entity_manager.removeEntityComponent(entity, component);
};
TLORMEngine.Screens.Screen.prototype.removeEntityComponentByType = function(entity, type) {
	this.entity_manager.removeEntityComponentByType(entity, type);
};
TLORMEngine.Screens.Screen.prototype.check_conditions = function(entity, conditions) {
	return this.condition_manager.check_conditions(this, entity, conditions);
};

TLORMEngine.Screens.Screen.prototype.getContainer = function() {
	return this.container_el;
}

TLORMEngine.Screens.Screen.prototype.getOption = function(option) {
	return this.game.getOption(option);
};

TLORMEngine.Screens.Screen.prototype.getSystemByType = function(type) {
	// no system in base screen, return nothing
	return null;
};