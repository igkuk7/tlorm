// DEPENDENCY: System.js
TLORMEngine.Systems.Input = function(args) {
	args.type = 'Input';
	TLORMEngine.Systems.System.call(this, args);

	this.keys_down = {};
	this.mouse_move = null;
	this.mouse_click = null;
	this.touch_move = null;
	this.touch_click = null;
	this.last_click_component = {};
	this.last_touch_component = {};
}
// inherit from normal system
TLORMEngine.Systems.Input.extends(TLORMEngine.Systems.System);

TLORMEngine.Systems.Input.prototype.componentsUsed = function() {
	var components = this.super.componentsUsed.call(this);
	components.KeyInput = true;
	components.MouseInput = true;
	components.TouchInput = true;

	return components;
};

TLORMEngine.Systems.Input.prototype.init = function(screen, reset) { /* register control callbacks for player */
	var system = this;
	screen.registerEvent("keydown", function(event) {
		system.keyDownHandler(event);
	});
	screen.registerEvent("keyup", function(event) {
		system.keyUpHandler(event);
	});
	screen.registerEvent("click", function(event) {
		system.mouseClickHandler(event);
	});
	screen.registerEvent("mousemove", function(event) {
		system.mouseMoveHandler(event);
	});
	screen.registerEvent("touchmove", function(event) {
		system.touchMoveHandler(event);
	});
	screen.registerEvent("touchend", function(event) {
		system.touchHandler(event);
	});
	screen.registerEvent("blur", function(event) {
		system.blurHandler(event);
	});
};

TLORMEngine.Systems.Input.prototype.keyDownHandler = function(event) {
	this.keys_down[event.keyCode] = true;
};
TLORMEngine.Systems.Input.prototype.keyUpHandler = function(event) {
	delete this.keys_down[event.keyCode];
};
TLORMEngine.Systems.Input.prototype.mouseClickHandler = function(event) {
	this.mouse_click = event;
};
TLORMEngine.Systems.Input.prototype.mouseMoveHandler = function(event) {
	this.mouse_move = event;
};
TLORMEngine.Systems.Input.prototype.touchHandler = function(event) {
	this.touch_click = event.touches[0];
	this.touch_click.offsetX = this.touch_click.clientX - this.touch_click.target.offsetLeft;
	this.touch_click.offsetY = this.touch_click.clientY - this.touch_click.target.offsetTop;
};
TLORMEngine.Systems.Input.prototype.mouseClickHandler = function(event) {
	this.mouse_click = event;
};
TLORMEngine.Systems.Input.prototype.blurHandler = function(event) {
	// clear all event on blur/unfocus
	this.mouse_move = null;
	this.touch_move = null;
	this.mouse_click = null;
	this.touch_click = null;
	for(var key_code in this.keys_down) {
		delete this.keys_down[key_code];
	}
};

TLORMEngine.Systems.Input.prototype.update = function(screen) {
	var entities = screen.getEntitiesByTypes(["KeyInput"]);
	for(var i = 0; i < entities.length; ++i) {
		this.handleKeyInput(screen, entities[i]);
	}

	var entities = screen.getEntitiesByTypes(["MouseInput"]);
	for(var i = 0; i < entities.length; ++i) {
		this.handleMouseInput(screen, entities[i]);
	}

	var entities = screen.getEntitiesByTypes(["TouchInput"]);
	for(var i = 0; i < entities.length; ++i) {
		this.handleTouchInput(screen, entities[i]);
	}
};


TLORMEngine.Systems.Input.prototype.handleKeyInput = function(screen, entity) {
	var input = entity.getComponentByType("KeyInput");
	for(var key_code in this.keys_down) {
		if(input.map[key_code]) {
			for (var i=0; i<input.map[key_code].length; ++i) {
				var key_input = input.map[key_code][i];
				if (!key_input.conditions || screen.check_conditions(entity, key_input.conditions)) {
					if (key_input.edit) {
						var component = entity.getComponentByType(key_input.type);
						component[key_input.function].apply(component, this.translateArgs(entity, key_input.function_args));
					} else if (key_input.new_entity) {
						var entity_components = key_input.entity.components || [];
						var components = [];
						for (var j=0; j<entity_components.length; ++j) {
							components.push(new TLORMEngine.Components[entity_components[j].type](this.translateArgs(entity, entity_components[j].args) || {}));
						}
						var entity = new TLORMEngine.Entities.Entity({ name: key_input.entity.name, components: components, screens: key_input.entity.screens });
						screen.addEntity(entity);
					} else {
						screen.addEntityComponent(
							entity,
							new TLORMEngine.Components[key_input.type](this.translateArgs(entity, key_input.args))
						);
					}
				}
			}
		}
	}
};

TLORMEngine.Systems.Input.prototype.handleMouseInput = function(screen, entity) {
	var input = entity.getComponentByType("MouseInput");
	if(input.move && this.mouse_move != null) {
		// ignore movement off screen
		if (   this.mouse_move.offsetX < 0 || screen.width < this.mouse_move.offsetX
			|| this.mouse_move.offsetY < 0 || screen.height < this.mouse_move.offsetY
		) {
			this.mouse_move = null;
			return;
		}

		var args = input.move.args || {};
		if(input.move.mouseXParam) {
			args[input.move.mouseXParam] = this.mouse_move.offsetX;
		}
		if(input.move.mouseYParam) {
			args[input.move.mouseYParam] = this.mouse_move.offsetY;
		}

		if (input.move.remove_existing) {
			screen.removeEntityComponentByType(entity, input.move.type);
		}

		screen.addEntityComponent(
			entity,
			new TLORMEngine.Components[input.move.type](args)
		);
		this.mouse_move = null;
	}
	if(input.click && this.mouse_click != null) {
		// ignore movement off screen
		if (   this.mouse_click.offsetX < 0 || screen.width < this.mouse_click.offsetX
			|| this.mouse_click.offsetY < 0 || screen.height < this.mouse_click.offsetY
		) {
			this.mouse_click = null;
			return;
		}

		// check if previous component added is still present
		var add_component = true;
		if(this.last_click_component[entity.name]) {
			var components = entity.getComponentByType(input.click.type);
			if (components) {
				if (!components instanceof Array ) {
					components = [ components ];
				}
				for (var i=0; i<components.length; ++i) {
					if (components[i] == this.last_click_component[entity.name]) {
						add_component = false;
						break;
					}
				}
			}
		}

		if (add_component) {
			var args = input.click.args || {};
			if(input.click.mouseXParam) {
				args[input.click.mouseXParam] = this.mouse_move.offsetX;
			}
			if(input.click.mouseYParam) {
				args[input.click.mouseYParam] = this.mouse_move.offsetY;
			}

			if (input.click.remove_existing) {
				screen.removeEntityComponentByType(entity, input.click.type);
			}


			this.last_click_component[entity.name] = new TLORMEngine.Components[input.click.type](args);

			screen.addEntityComponent(entity, this.last_click_component[entity.name]);
		}

		this.mouse_click = null;
	}
};

TLORMEngine.Systems.Input.prototype.handleTouchInput = function(screen, entity) {
	var input = entity.getComponentByType("TouchInput");
	if(input.drag && this.touch_move != null) {

		// ignore movement off screen
		if (   this.touch_move.offsetX < 0 || screen.width < this.touch_move.offsetX
			|| this.touch_move.offsetY < 0 || screen.height < this.touch_move.offsetY
		) {
			this.touch_move = null;
			return;
		}

		var args = input.drag.args || {};
		if(input.drag.mouseXParam) {
			args[input.drag.mouseXParam] = this.touch_move.offsetX;
		}
		if(input.drag.mouseYParam) {
			args[input.drag.mouseYParam] = this.touch_move.offsetY;
		}

		if (input.move.remove_existing) {
			screen.removeEntityComponentByType(entity, input.move.type);
		}

		screen.addEntityComponent(
			entity,
			new TLORMEngine.Components[input.drag.type](args)
		);
		this.touch_move = null;
	}
	if(input.touch && this.mouse_click != null) {
		// ignore movement off screen
		if (   this.mouse_click.offsetX < 0 || screen.width < this.mouse_click.offsetX
			|| this.mouse_click.offsetY < 0 || screen.height < this.mouse_click.offsetY
		) {
			this.mouse_click = null;
			return;
		}

		// check if previous component added is still present
		var add_component = true;
		if(this.last_click_component[entity.name]) {
			var components = entity.getComponentByType(input.click.type);
			if (components) {
				if (!components instanceof Array ) {
					components = [ components ];
				}
				for (var i=0; i<components.length; ++i) {
					if (components[i] == this.last_click_component[entity.name]) {
						add_component = false;
						break;
					}
				}
			}
		}

		if (add_component) {
			var args = input.click.args || {};
			if(input.click.mouseXParam) {
				args[input.click.mouseXParam] = this.mouse_move.offsetX;
			}
			if(input.click.mouseYParam) {
				args[input.click.mouseYParam] = this.mouse_move.offsetY;
			}

			if (input.click.remove_existing) {
				screen.removeEntityComponentByType(entity, input.click.type);
			}


			this.last_click_component[entity.name] = new TLORMEngine.Components[input.click.type](args);

			screen.addEntityComponent(entity, this.last_click_component[entity.name]);
		}

		this.mouse_click = null;
	}
};

TLORMEngine.Systems.Input.prototype.translateArgs = function(entity, args) {
	if (args == undefined || args == null) {
		args = {}
	}
	var translated_args = {};

	for (var key in args) {
		if (args[key] instanceof Object) {
			var component = entity.getComponentByType(args[key].type);
			translated_args[key] = component[args[key].function].apply(component, this.translateArgs(entity, args[key].function_args));
		} else {
			translated_args[key] = args[key];
		}
	}

	return translated_args;
};