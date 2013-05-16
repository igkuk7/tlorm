// DEPENDENCY: System.js

TLORMEngine.Systems.Movement = function(args) {
	args.type = 'Movement';
	TLORMEngine.Systems.System.call(this, args);
	this.delta_modifier = 10;
}
// inherit from normal system
TLORMEngine.Systems.Movement.extends(TLORMEngine.Systems.System);

TLORMEngine.Systems.Movement.prototype.componentsUsed = function() {
	var components = this.super.componentsUsed.call(this);
	components.Position = true;
	components.Velocity = true;
	components.Rotation = true;
	components.Translation = true;
	components.Follow = true;
	components.Collision = true;

	return components;
};

TLORMEngine.Systems.Movement.prototype.init = function(screen, reset) {
	var delta_modifier = screen.getOption("delta_modifier");
	if (delta_modifier) {
		this.delta_modifier = delta_modifier;
	}
}

TLORMEngine.Systems.Movement.prototype.update = function(screen, delta) {

	// apply gravity to all entities which need it prior to movements
	var entities = screen.getEntitiesByTypes(["Position", "Gravity"]);
	for (var i = 0; i < entities.length; ++i) {
		this.applyGravity(screen, entities[i], delta);
	}
	var entities = screen.getEntitiesByTypes(["Position", "Rotation"]);
	for (var i = 0; i < entities.length; ++i) {
		this.rotateEntity(screen, entities[i], delta);
	}
	
	var entities = screen.getEntitiesByTypes(["Position", "Translation"]);
	for (var i = 0; i < entities.length; ++i) {
		this.translateEntity(screen, entities[i], delta);
	}
	
	var entities = screen.getEntitiesByTypes(["Position", "Follow"]);
	for (var i = 0; i < entities.length; ++i) {
		this.followEntity(screen, entities[i], delta);
	}

	// get list of collision entities so we can check collision on movement
	var collision_entities = screen.getEntitiesByTypes(["Position", "Collision"]);
	collision_entities = collision_entities.sort(function(a,b) {
		var position_a = a.getComponentByType("Position");
		var position_b = b.getComponentByType("Position");
		return position_a.x - position_b.x;
	});

	var entities = screen.getEntitiesByTypes(["Position", "Velocity"]);
	for (var i = 0; i < entities.length; ++i) {
		this.moveEntity(screen, entities[i], collision_entities, delta);
	}
};

TLORMEngine.Systems.Movement.prototype.applyGravity = function(screen, entity, delta) {
	var position = entity.getComponentByType("Position");
	var gravity = entity.getComponentByType("Gravity");

	// if entity has a vertical velocity then adjust that
	var add_gravity = false;
	var velocities = entity.getComponentByType("Velocity") || [];
	if (velocities.length > 0) {
		add_gravity = true;
		for (var i = 0; i < velocities.length; ++i) {
			var velocity = velocities[i];
			if (velocity.dy != null || velocity.dy != undefined) {
				velocity.dy += gravity.g;
				add_gravity = false;
				if (velocity.dy > 0 && velocity.dy > gravity.terminal_velocity) {
					velocity.dy = gravity.terminal_velocity;
				}
			}
		}
	} else {
		add_gravity = true;
	}

	if (add_gravity) {
		screen.addEntityComponent(entity, new TLORMEngine.Components.Velocity({ dy: 1, constant: true }));
	}
};

TLORMEngine.Systems.Movement.prototype.moveEntity = function(screen, entity, collision_entities, delta) {
	var position = entity.getComponentByType("Position");
	var velocities = entity.getComponentByType("Velocity");

	// iterate over all velocities to get total movement info
	var dx = 0;
	var dy = 0;
	var dz = 0;
	for (var i = 0; i < velocities.length; ++i) {
		var velocity = velocities[i];
		var vdx = Math.round( velocity.skip_delta ? velocity.dx : this.deltaMovement(velocity.dx, delta) ) || 0;
		var vdy = Math.round( velocity.skip_delta ? velocity.dy : this.deltaMovement(velocity.dy, delta) ) || 0;
		var vdz = Math.round( velocity.skip_delta ? velocity.dz : this.deltaMovement(velocity.dz, delta) ) || 0;
		dx += vdx;
		dy += vdy;
		dz += vdz;

		// if velocity has 0 movement, then remove it
		if (!velocity.constant || (vdx==0 && vdy==0 && vdz==0)) {
			screen.removeEntityComponent(entity, velocity);
		}
	}

	// if this item can collide them move it a step at a time and check for collisions
	var collision = entity.getComponentByType("Collision") || [];
	if (collision.length > 0) {
		this.moveByIncrements(screen, entity, collision_entities, position, dx, dy, dz);
	} else {
		// no collision, just move all at once
		position.moveBy(dx, dy, dz);
	}
};

// move incrementally: x > z > y, check collission each time
TLORMEngine.Systems.Movement.prototype.moveByIncrements = function(screen, entity, collision_entities, position, dx, dy, dz) {
	while (dx != 0 || dy != 0 || dz != 0) {
		// move x
		if (dx != 0) {
			if (dx < 0) {
				position.moveBy(-1, 0, 0);
				++dx;
			} else if (dx > 0) {
				position.moveBy(1, 0, 0);
				--dx;
			}

			// check collisions, and if any found then stop the movements
			if (this.checkForCollisions(screen, entity, collision_entities) > 0) {
				if (dx < 0) {
					position.moveBy(1, 0, 0);
				} else if (dx > 0) {
					position.moveBy(-1, 0, 0);
				}
				dx = 0;
			}
		}
		// move y
		if (dy != 0) {
			if (dy < 0) {
				position.moveBy(0, -1, 0);
				++dy;
			} else if (dy > 0) {
				position.moveBy(0, 1, 0);
				--dy;
			}

			// check collisions, and if any found then stop the movements
			if (this.checkForCollisions(screen, entity, collision_entities) > 0) {
				if (dy < 0) {
					position.moveBy(0, 1, 0);
				} else if (dy > 0) {
					position.moveBy(0, -1, 0);
				}
				dy = 0;
			}
		}
		// move z
		if (dz != 0) {
			if (dz < 0) {
				position.moveBy(0, 0, -1);
				++dz;
			} else if (dz > 0) {
				position.moveBy(0, 0, 1);
				--dz;
			}

			// check collisions, and if any found then stop the movements
			if (this.checkForCollisions(screen, entity, collision_entities) > 0) {
				if (dz < 0) {
					position.moveBy(0, 0, 1);
				} else if (dz > 0) {
					position.moveBy(0, 0, -1);
				}
				dz = 0;
			}
		}
	}
};

TLORMEngine.Systems.Movement.prototype.rotateEntity = function(screen, entity, delta) {
	var position = entity.getComponentByType("Position");
	var rotations = entity.getComponentByType("Rotation");
	for (var i = 0; i < rotations.length; ++i) {
		position.rotateBy(this.deltaMovement(rotations[i].dx, delta), this.deltaMovement(rotations[i].dy, delta), this.deltaMovement(rotations[i].dz, delta));
		if (!rotations[i].constant) {
			screen.removeEntityComponent(entity, rotations[i]);
		}
	}
};

TLORMEngine.Systems.Movement.prototype.translateEntity = function(screen, entity, delta) {
	var position = entity.getComponentByType("Position");
	var translations = entity.getComponentByType("Translation");
	for (var i = 0; i < translations.length; ++i) {
		var dest_x = translations[i].x;
		var dest_y = translations[i].y
		if (translations[i].move_middle) {
			if (translations[i].x) {
				dest_x = translations[i].x - position.hw;
			}
			if (translations[i].y) {
				dest_y = translations[i].y - position.hh;
			}
		}

		// with speed, move towards the location
		// no speed, just move there
		if (translations[i].getSpeed()) {
			var remove = false;
			var x_speed = null;
			var y_speed = null;
			if (dest_x) {
				if (position.x < dest_x) {
					x_speed = translations[i].getSpeed();
					if (position.x+x_speed >= dest_x) {
						x_speed = dest_x - position.x;
						remove = true;
					}
				} else if (position.x > dest_x) {
					x_speed = -translations[i].getSpeed();
					if (position.x+x_speed <= dest_x) {
						x_speed = position.x - dest_x;
						remove = true;
					}
				}
			}
			if (dest_y) {
				if (position.y < dest_y) {
					y_speed = translations[i].getSpeed();
					if (position.y+y_speed >= dest_y) {
						y_speed = dest_y - position.y;
						remove = true;
					}
				} else if (position.y > dest_y) {
					y_speed = -translations[i].getSpeed();
					if (position.y+y_speed <= dest_y) {
						y_speed = position.y - dest_y;
						remove = true;
					}
				}
			}
			screen.addEntityComponent(entity, new TLORMEngine.Components.Velocity({ dx: x_speed, dy: y_speed }));
			if (remove) {
				screen.removeEntityComponent(entity, translations[i]);
			}
		} else {
			screen.addEntityComponent(
				entity,
				new TLORMEngine.Components.Velocity({
					dx: ( dest_x ? dest_x-(translations[i].move_middle ? position.mx : position.x) : null ),
					dy: ( dest_y ? dest_y-(translations[i].move_middle ? position.my : position.y) : null ),
					skip_delta: true
				})
			);
			screen.removeEntityComponent(entity, translations[i]);
		}
	}
};

TLORMEngine.Systems.Movement.prototype.followEntity = function(screen, entity, delta) {
	var position = entity.getComponentByType("Position");
	var follow = entity.getComponentByType("Follow");
	var follow_entity = screen.getEntityByName(follow.entity);
	if (follow_entity) {
		var follow_position = follow_entity.getComponentByType("Position");
		if (follow_position) {
			var dx = 0;
			var dy = 0;
			var dz = 0;
			if (follow.dx > 0) {
				var position_x        = position.x;
				var follow_position_x = follow_position.x;
				if (follow.move_middle) {
					position_x        += position.hw;
					follow_position_x += follow_position.hw;
				}
				var speed_x = Math.min(follow.dx, Math.abs(follow_position_x - position_x));
				if (follow_position_x < position_x) {
					dx = -speed_x;
				} else if (follow_position_x > position_x) {
					dx = speed_x;
				}
			}
			if (follow.dy > 0) {
				var position_y        = position.y;
				var follow_position_y = follow_position.y;
				if (follow.move_middle) {
					position_y        += position.hh;
					follow_position_y += follow_position.hh;
				}
				var speed_y = Math.min(follow.dy, Math.abs(follow_position_y - position_y));
				if (follow_position_y < position_y) {
					dy = -speed_y;
				} else if (follow_position_y > position_y) {
					dy = speed_y;
				}
			}
			if (follow.dz > 0) {
				var position_z        = position.z;
				var follow_position_z = follow_position.z;
				if (follow.move_middle) {
					position_z        += position.hd;
					follow_position_z += follow_position.hd;
				}
				var speed_z = Math.min(follow.z, Math.abs(follow_position_z - position_z));
				if (follow_position_z < position_z) {
					dz = -speed_z;
				} else if (follow_position.z > position_z) {
					dz = speed_z;
				}
			}
			screen.addEntityComponent(entity, new TLORMEngine.Components.Velocity({ dx: dx, dy: dy, dz: dz }));
		}
	}
};

TLORMEngine.Systems.Movement.prototype.checkForCollisions = function(screen, entity, entities) {
	var position = entity.getComponentByType("Position");
	var collisions = entity.getComponentByType("Collision");
	var collided = 0;
	for (var c = 0; c < collisions.length; c++) {
		var collision = collisions[c];
		for (var i = 0; i < entities.length; ++i) {
			if (entities[i] !== entity) {
				var check_position = entities[i].getComponentByType("Position");
				if (check_position.x > position.x+position.w) {
					break;
				}
				if (check_position.x+check_position.w < position.x) {
					continue;
				}
				if (this.checkCollision(screen, entity, entities[i], collision)) {
					++collided;
				}
			}
		}
	}
	return collided;
};

TLORMEngine.Systems.Movement.prototype.checkCollision = function(screen, entity, check_entity, collision) {
	var position = entity.getComponentByType("Position");
	var check_position = check_entity.getComponentByType("Position");
	var check_collisions = check_entity.getComponentByType("Collision");
	var collided = 0;
	for (var c = 0; c < check_collisions.length; c++) {
		var check_collision = check_collisions[c];
		if (collision.collidingDirection(position) && collision.collides(check_collision) && position.collides(check_position)) {
			this.collisionResolution(screen, entity, check_entity, collision, check_collision);
			++collided;
		}
	}
	return collided;
};

TLORMEngine.Systems.Movement.prototype.collisionResolution = function(screen, entity, hit_entity, collision, hit_collision) {
	var position = entity.getComponentByType("Position");
	var hit_position = hit_entity.getComponentByType("Position");
	if (collision.resolution == "bounce" || collision.resolution == "destroy_hit_and_bounce") {
		var velocity = entity.getComponentByType("Velocity")[0];
		if (velocity) {
			if (velocity.constant) {
				switch (position.collisionDirection(hit_position)) {
					case "top":
					case "bottom":
						velocity.dy *= -1;
						break;
					case "left":
					case "right":
						velocity.dx *= -1;
						break;
					default:
						break;
				}
			}
		}
	}
	if (collision.resolution == "push") {
		var direction = position.direction();
		var stop = false;

		// "push" back so no longer colliding, also remove velocity which caused collision
		var velocities = entity.getComponentByType("Velocity") || [];
		while (!stop && position.collides(hit_position)) {
			switch (direction) {
				case "up":
					position.moveBy(0, 1);
					velocities.filter(function(v){ return v.dy && v.dy < 0; }).map(function(v) { v.dy = null; });
					break;
				case "down":
					position.moveBy(0, -1);
					velocities.filter(function(v){ return v.dy && v.dy > 0; }).map(function(v) { v.dy = null; });
					break;
				case "left":
					position.moveBy(1, 0);
					velocities.filter(function(v){ return v.dx && v.dx < 0; }).map(function(v) { v.dx = null; });
					break;
				case "right":
					position.moveBy(-1, 0);
					velocities.filter(function(v){ return v.dx && v.dx > 0; }).map(function(v) { v.dx = null; });
					break;
				default:
					stop = true
					break;
			}
		}
	}
	if (collision.resolution == "stop") {
		screen.removeEntityComponentByType(entity, "Velocity");
	}
	if (collision.resolution == "destroy_hit" || collision.resolution == "destroy_hit_and_bounce") {
		screen.removeEntity(hit_entity);
	}
	if (collision.resolution == "destroy") {
		screen.removeEntity(entity);
	}
	if (collision.resolution == "destroy_both") {
		screen.removeEntity(hit_entity);
		screen.removeEntity(entity);
	}
	if (collision.resolution == "edit_component") {
		var edit_entity = ( collision.entity ? screen.getEntityByName(collision.entity) : entity );
		var edit_component = edit_entity.getComponentByType(collision.component);
		var components_to_edit = [];
		if (collision.position) {
			if (collision.position == "all") {
				components_to_edit = edit_component;
			} else {
				components_to_edit = [edit_component[position]];
			}
		} else {
			components_to_edit = [edit_component];
		}
		for (var i=0; i<components_to_edit.length; ++i) {
			var component_to_edit = components_to_edit[i];
			component_to_edit[collision.function].apply(component_to_edit, collision.function_args);
		}
	}
	if (collision.resolution == "add_component") {
		var entity = ( collision.entity ? screen.getEntityByName(collision.entity) : entity );
		var component = new TLORMEngine.Components[collision.component](collision.component_args);
		screen.addEntityComponent(entity, component);
	}

	if (collision.oncollide) {
		collision.oncollide(entity, hit_entity);
	}
	if (hit_collision.oncollide) {
		hit_collision.oncollide(entity, hit_entity);
	}
};

TLORMEngine.Systems.Movement.prototype.deltaMovement = function(value, delta) {
	return value; //Math.abs(value)*delta*this.delta_modifier*(value < 0 ? -1 : 1);
};