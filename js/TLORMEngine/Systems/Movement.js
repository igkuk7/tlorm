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
	// apply gravity/friction to all acceleration
	var entities = screen.getEntitiesByTypes(["Gravity"]);
	for (var i = 0; i < entities.length; ++i) {
		this.applyGravity(screen, entities[i], delta);
	}
	var entities = screen.getEntitiesByTypes(["Friction", "Acceleration"]);
	for (var i = 0; i < entities.length; ++i) {
		this.applyFriction(screen, entities[i], delta);
	}

	// accelerate velocity
	var entities = screen.getEntitiesByTypes(["Velocity", "Acceleration"]);
	for (var i = 0; i < entities.length; ++i) {
		this.accelerateVelocities(screen, entities[i], delta);
	}

	// move all entities as needed
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

	// finally check any collision entities without velocity
	// e.g. checking if a play has move into a static area
	for (var i = 0; i < collision_entities.length; ++i) {
		var collisions = collision_entities[i].getComponentByType("Collision");
		var has_groups = false;
		for (var j=0; j<collisions.length; ++j) {
			if (collisions[j].hasGroups()) {
				has_groups = true;
				break;
			}
		}
		if (has_groups && !collision_entities[i].getComponentByType("Velocity")) {
			this.checkForCollisions(screen, collision_entities[i], collision_entities);
		}
	}
};

TLORMEngine.Systems.Movement.prototype.applyGravity = function(screen, entity, delta) {
	var gravity = entity.getComponentByType("Gravity");

	// apply gravity to acceleration, creating it if not present
	var acceleration = entity.getComponentByType("Acceleration");
	if (!acceleration) {
		screen.addEntityComponent(entity, new TLORMEngine.Components.Acceleration({ dy: gravity.g }));
		return;
	}

	// acceleration is present, adjust by gravity
	if (acceleration.getDY() < gravity.g) {
		acceleration.change(null, gravity.g);
	}
	if (acceleration.getDY() > gravity.g) {
		acceleration.set(null, gravity.g);
	}
};

TLORMEngine.Systems.Movement.prototype.applyFriction = function(screen, entity, delta) {
	var friction = entity.getComponentByType("Friction");
	var acceleration = entity.getComponentByType("Acceleration");

	// TODO: not yet working as friction is on platform, so needs collission info

	// apply friction to acceleration
	var dx = acceleration.getDX();
	acceleration.change((dx < 0 ? friction.friction : -friction.friction));

	// don't let it move in opposite direction, stop acceleration if it does
	var new_dx = acceleration.getDX();
	if ( (dx < 0 && new_dx > 0) || (dx > 0 && new_dx < 0) ) {
		acceleration.set(0);
	}
};

TLORMEngine.Systems.Movement.prototype.accelerateVelocities = function(screen, entity, delta) {
	var velocity = entity.getComponentByType("Velocity");
	var acceleration = entity.getComponentByType("Acceleration");

	velocity.change(acceleration.getDX(), acceleration.getDY(), acceleration.getDZ());
}

TLORMEngine.Systems.Movement.prototype.moveEntity = function(screen, entity, collision_entities, delta) {
	var position = entity.getComponentByType("Position");
	var velocity = entity.getComponentByType("Velocity");

	var dx = Math.round( velocity.skip_delta ? velocity.getDX() : this.deltaMovement(velocity.getDX(), delta) ) || 0;
	var dy = Math.round( velocity.skip_delta ? velocity.getDY() : this.deltaMovement(velocity.getDY(), delta) ) || 0;
	var dz = Math.round( velocity.skip_delta ? velocity.getDZ() : this.deltaMovement(velocity.getDZ(), delta) ) || 0;

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
			var collision_result = this.checkForCollisions(screen, entity, collision_entities);
			if (collision_result.stop_movement) {
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
			var collision_result = this.checkForCollisions(screen, entity, collision_entities);
			if (collision_result.stop_movement) {
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
			var collision_result = this.checkForCollisions(screen, entity, collision_entities);
			if (collision_result.stop_movement) {
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

			var velocity = entity.getComponentByType("Velocity");
			if (velocity) {
				velocity.set(x_speed, y_speed);
			} else {
				screen.addEntityComponent(entity, new TLORMEngine.Components.Velocity({ dx: x_speed, dy: y_speed }));
			}
			if (remove) {
				screen.removeEntityComponent(entity, translations[i]);
			}
		} else {
			var velocity = entity.getComponentByType("Velocity");
			if (velocity) {
				velocity.set(
					( dest_x ? dest_x-(translations[i].move_middle ? position.mx : position.x) : null ),
					( dest_y ? dest_y-(translations[i].move_middle ? position.my : position.y) : null )
				);
			} else {
				screen.addEntityComponent(
					entity,
					new TLORMEngine.Components.Velocity({
						dx: ( dest_x ? dest_x-(translations[i].move_middle ? position.mx : position.x) : null ),
						dy: ( dest_y ? dest_y-(translations[i].move_middle ? position.my : position.y) : null ),
						skip_delta: true
					})
				);
			}
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
			if (follow.fixed) {
				var new_x = null;
				if (follow.dx != null) {
					new_x = follow_position.x+follow.dx;
					if (follow.invert) {
						new_x = -new_x;
					}
				}
				var new_y = null;
				if (follow.dy != null) {
					new_y = follow_position.y+follow.dy;
					if (follow.invert) {
						new_y = -new_y;
					}
				}
				var new_z = null;
				if (follow.dz != null) {
					new_z = follow_position.z+follow.dz;
					if (follow.invert) {
						new_z = -new_z;
					}
				}
				position.moveTo(new_x, new_y, new_z);
			} else {
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
	}
};

TLORMEngine.Systems.Movement.prototype.checkForCollisions = function(screen, entity, entities) {
	var result = { stop_movement: false, collided: 0 };
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
				var collision_result = this.checkCollision(screen, entity, entities[i], collision);
				result.collided += collision_result.collided;
				if (collision_result.stop_movement) {
					result.stop_movement = true;
				}
			}
		}
	}
	return result;
};

TLORMEngine.Systems.Movement.prototype.checkCollision = function(screen, entity, check_entity, collision) {
	var result = { stop_movement: false, collided: 0 };
	var position = entity.getComponentByType("Position");
	var check_position = check_entity.getComponentByType("Position");
	var check_collisions = check_entity.getComponentByType("Collision");
	var collided = 0;
	for (var c = 0; c < check_collisions.length; c++) {
		var check_collision = check_collisions[c];
		if (   collision.collidingDirection(position)
			&& collision.collides(check_collision)
			&& position.collides(check_position)
		) {
			// run checks then run the resolutions
			var resolutions_to_run = [];
			for (var ri=0; ri<collision.resolutions.length; ++ri) {
				var resolution = collision.resolutions[ri];
				if ( !resolution.conditions || screen.check_conditions(entity, resolution.conditions) ) {
					resolutions_to_run.push(resolution);
				}
			}
			for (var ri=0; ri<resolutions_to_run.length; ++ri) {
				var resolution = resolutions_to_run[ri];
				var collision_result = this.collisionResolution(screen, entity, check_entity, collision, check_collision, resolution);
				if (collision_result.stop_movement) {
					result.stop_movement = true;
				}
			}

			++result.collided;
		}
	}
	return result;
};

TLORMEngine.Systems.Movement.prototype.collisionResolution = function(screen, entity, hit_entity, collision, hit_collision, resolution) {
	var result = { stop_movement: false };
	var position = entity.getComponentByType("Position");
	var hit_position = hit_entity.getComponentByType("Position");
	var velocity = entity.getComponentByType("Velocity");
	var acceleration = entity.getComponentByType("Acceleration");
	if (resolution.resolution == "bounce" || resolution.resolution == "destroy_hit_and_bounce") {
		if (velocity) {
			if (velocity.constant) {
				switch (position.collisionDirection(hit_position)) {
					case "top":
					case "bottom":
						velocity.set(null, velocity.getDY() * -1);
						break;
					case "left":
					case "right":
						velocity.set(velocity.getDX() * -1, null);
						break;
					default:
						break;
				}
			}
		}
		result.stop_movement = true;
	}
	if (resolution.resolution == "push") {
		var direction = position.direction();
		var stop = false;

		// "push" back so no longer colliding, also remove velocity which caused collision
		var dx, dy;
		if (velocity) {
			dx = velocity.getDX();
			dy = velocity.getDY();
		}
		while (!stop && position.collides(hit_position)) {
			switch (direction) {
				case "up":
					position.moveBy(0, 1);
					if (velocity && dy && dy < 0) { velocity.set(null, 0); }
					break;
				case "down":
					position.moveBy(0, -1);
					if (velocity && dy && dy > 0) { velocity.set(null, 0); }
					break;
				case "left":
					position.moveBy(1, 0);
					if (velocity && dx && dx < 0) { velocity.set(0, null); }
					break;
				case "right":
					position.moveBy(-1, 0);
					if (velocity && dx && dx > 0) { velocity.set(0, null); }
					break;
				default:
					stop = true
					break;
			}
		}
		result.stop_movement = true;
	}
	if (resolution.resolution == "stop") {
		if (velocity) {
			velocity.set(0, 0);
		}
		if (acceleration) {
			acceleration.set(0, 0);
		}
		result.stop_movement = true;
	}
	if (resolution.resolution == "destroy_hit" || resolution.resolution == "destroy_hit_and_bounce") {
		screen.removeEntity(hit_entity);
	}
	if (resolution.resolution == "destroy") {
		screen.removeEntity(entity);
	}
	if (resolution.resolution == "destroy_both") {
		screen.removeEntity(hit_entity);
		screen.removeEntity(entity);
	}
	if (resolution.resolution == "edit_component") {
		var edit_entity = ( resolution.entity ? screen.getEntityByName(resolution.entity) : entity );
		var edit_component = edit_entity.getComponentByType(resolution.component);
		var components_to_edit = [];
		if (resolution.position) {
			if (resolution.position == "all") {
				components_to_edit = edit_component;
			} else {
				components_to_edit = [edit_component[position]];
			}
		} else {
			components_to_edit = [edit_component];
		}
		for (var i=0; i<components_to_edit.length; ++i) {
			var component_to_edit = components_to_edit[i];
			if (!(component_to_edit instanceof Array)) {
				component_to_edit = [ component_to_edit ];
			}
			for (var i=0; i<component_to_edit.length; ++i) {
				component_to_edit[i][resolution.function].apply(component_to_edit[i], resolution.function_args);
			}
		}
	}
	if (resolution.resolution == "add_component") {
		var entity = ( resolution.entity ? screen.getEntityByName(resolution.entity) : entity );
		var component = new TLORMEngine.Components[resolution.component](resolution.component_args);
		screen.addEntityComponent(entity, component);
	}

	if (resolution.oncollide) {
		resolution.oncollide(entity, hit_entity);
	}
	//if (hit_collision.oncollide) {
	//	hit_collision.oncollide(entity, hit_entity);
	//}

	return result;
};

TLORMEngine.Systems.Movement.prototype.deltaMovement = function(value, delta) {
	return value; //Math.abs(value)*delta*this.delta_modifier*(value < 0 ? -1 : 1);
};