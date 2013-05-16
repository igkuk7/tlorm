// DEPENDENCY: System.js

/* system to render components */
TLORMEngine.Systems.Render2DDungeon = function(args) {
	TLORMEngine.Systems.System.call(this, args);

	this.mouse_pos = null;
	this.mouse_click = null;
	this.mouse_wheel = null;
	this.offset = { x: 0, y: 0 };
};

// inherit from normal system
TLORMEngine.Systems.Render2DDungeon.extends(TLORMEngine.Systems.System);

TLORMEngine.Systems.Render2DDungeon.prototype.componentsUsed = function() {
	var components = this.super.componentsUsed.call(this);
	components.Dungeon = true;
	components.DungeonToom = true;

	return components;
};


TLORMEngine.Systems.Render2DDungeon.prototype.init = function(screen, reset) { 
	var self = this;
	screen.registerEvent("mousemove", function(event) {
		self.mouse_pos = {
			x: event.offsetX,
			y: event.offsetY,
		};
	});
	screen.registerEvent("click", function(event) {
		self.mouse_click = {
			x: event.offsetX,
			y: event.offsetY,
		};
	});
	screen.registerEvent("mousewheel", function(event) {
		self.mouse_wheel = {
			x: event.offsetX,
			y: event.offsetY,
			dir: Math.round(event.wheelDelta / 100)
		};
	});
};

TLORMEngine.Systems.Render2DDungeon.prototype.update = function(screen, delta) {
	var entities = screen.getEntitiesByTypes(["Dungeon", "Position", "Render2D"]);
	for (var i = 0; i < entities.length; ++i) {
		var dungeon_entities = entities[i].getComponentByType("Dungeon").entitiesToAdd();
		dungeon_entities.map(function(a) { screen.addEntity(a); });
	}
};

TLORMEngine.Systems.Render2DDungeon.prototype.render = function(screen, context) {
	var entities = screen.getEntitiesByTypes(["Dungeon", "Position", "Render2D"]);
	for (var i = 0; i < entities.length; ++i) {
		this.renderDungeon(entities[i], context);
	}
	var entities = screen.getEntitiesByTypes(["DungeonRoom", "Position", "Render2D"]);
	for (var i = 0; i < entities.length; ++i) {
		this.renderDungeonRoom(entities[i], context);
	}
};

TLORMEngine.Systems.Render2DDungeon.prototype.renderDungeonRoom = function(entity, context) {
	var dungeon_room = entity.getComponentByType("DungeonRoom");
	var position = entity.getComponentByType("Position");

	//context.fillStyle = "red";
	//context.fillRect(position.x, position.y, position.w, position.h);
};

TLORMEngine.Systems.Render2DDungeon.prototype.renderDungeon = function(entity, context) {
	var dungeon = entity.getComponentByType("Dungeon");
	var position = entity.getComponentByType("Position");

	if (!this.grid) {
		this.grid = [];
		for (var i=0; i<dungeon.w*dungeon.h; ++i) {
			this.grid[i] = {
				col: Math.floor(Math.random()*4),
				h: 0,
				selected: false,
				highlighted: false
			}
		}
	}

	// adjust height of selected items
	if (this.mouse_wheel) {
		for (var i=0; i<dungeon.w*dungeon.h; ++i) {
			var grid_info = this.grid[i];
			if (grid_info.selected) {
				grid_info.h += this.mouse_wheel.dir;
				if (grid_info.h < 0) {
					grid_info.h = 0;
				}
				if (grid_info.h > 10) {
					grid_info.h = 10;
				}
			}
		}
	}

	context.fillStyle = "#DDD";
	context.fillRect(position.x, position.y, position.w, position.h);

	var gw = 64;
	var gh = 32;

	// render y then x to do back to front
	for (var y=0; y<dungeon.h; ++y) {
		for (var x=0; x<dungeon.w; ++x) {
			var grid_info = this.grid[x+y*dungeon.w];

			switch (grid_info.col) {
				case 0:
					context.fillStyle = "red";
					break;
				case 1:
					context.fillStyle = "green";
					break;
				case 2:
					context.fillStyle = "blue";
					break;
				case 3:
					context.fillStyle = "yellow";
					break;
				default:
					context.fillStyle = "black";
					break;
			}
			context.strokeStyle = "black";
			context.lineWidth = 1;

			var xpos, ypos;
			if (y%2 == 0) {
				xpos = position.x+(x*gw);
				ypos = position.y+(y*gh) / 2;
			} else {
				xpos = position.x+(x*gw)+(gw/2);
				ypos = position.y+(y*gh) / 2;
			}
			var ypos_original = ypos;

			// base (if no height) 
			if (grid_info.h == 0) {
				context.beginPath();
				context.moveTo(xpos,        ypos+(gh/2));
				context.lineTo(xpos+(gw/2), ypos       );
				context.lineTo(xpos+(gw),   ypos+(gh/2));
				context.lineTo(xpos+(gw/2), ypos+(gh)  );
				context.lineTo(xpos,        ypos+(gh/2));
				context.fill();
				context.stroke();
			}

			// draw height
			for (var h=0; h<grid_info.h; ++h) {
				if (h > 0) {
					ypos -= gh/2;
				}

				// left face
				context.beginPath();
				context.moveTo(xpos,        ypos+(gh/2));
				context.lineTo(xpos,        ypos       );
				context.lineTo(xpos+(gw/2), ypos+(gh/2));
				context.lineTo(xpos+(gw/2), ypos+(gh)  );
				context.lineTo(xpos,        ypos+(gh/2));
				context.fill();
				context.stroke();

				// right face
				context.beginPath();
				context.moveTo(xpos+(gw/2), ypos+(gh/2));
				context.lineTo(xpos+(gw),   ypos       );
				context.lineTo(xpos+(gw),   ypos+(gh/2));
				context.lineTo(xpos+(gw/2), ypos+(gh)  );
				context.lineTo(xpos+(gw/2), ypos+(gh/2));
				context.fill();
				context.stroke();

				// top face (only need to draw for the very top)
				if (h + 1 == grid_info.h) {
					context.beginPath();
					context.moveTo(xpos,        ypos       );
					context.lineTo(xpos+(gw/2), ypos-(gh/2));
					context.lineTo(xpos+(gw),   ypos       );
					context.lineTo(xpos+(gw/2), ypos+(gh/2));
					context.lineTo(xpos,        ypos       );
					context.fill();
					context.stroke();
				}
			}

			// hit container
			var x1 = xpos+(gw/5);
			var y1 = ypos+(gh/5)-(grid_info.h > 0 ? gh/2 : 0);
			var x2 = xpos+(4*gw)/5;
			var y2 = ypos_original+(4*gh)/5;
			//context.strokeRect(x1, y1, x2-x1, y2-y1); 

			// check point is in square container (within the diamond)
			grid_info.highlighted = false;
			if (  this.mouse_pos
			    && x1 <= this.mouse_pos.x && this.mouse_pos.x <= x2
			    && y1 <= this.mouse_pos.y && this.mouse_pos.y <= y2
			) {
				//grid_info.highlighted = true;
			}
			if (   this.mouse_click
			    && x1 <= this.mouse_click.x && this.mouse_click.x <= x2
			    && y1 <= this.mouse_click.y && this.mouse_click.y <= y2
			) {
				grid_info.selected = !grid_info.selected;
			}
		}
	}

	// render selected items
	context.strokeStyle = "black";
	context.lineWidth = 4;
	for (var y=0; y<dungeon.h; ++y) {
		for (var x=0; x<dungeon.w; ++x) {
			var grid_info = this.grid[x+y*dungeon.w];
			if (!grid_info.selected && !grid_info.highlighted) {
				continue;
			}
			var xpos, ypos;
			if (y%2 == 0) {
				xpos = position.x+(x*gw);
				ypos = position.y+(y*gh) / 2;
			} else {
				xpos = position.x+(x*gw)+(gw/2);
				ypos = position.y+(y*gh) / 2;
			}

			// highlight top most face
			var top_ypos = ypos - grid_info.h*(gh/2);

			// outline entire size
			context.beginPath();
			context.moveTo(xpos,        ypos+(gh/2)    );
			context.lineTo(xpos+(gw/2), ypos+(gh)      );
			context.lineTo(xpos+(gw),   ypos+(gh/2)    );
			context.lineTo(xpos+(gw),   top_ypos+(gh/2));
			context.lineTo(xpos+(gw/2), top_ypos       );
			context.lineTo(xpos,        top_ypos+(gh/2));
			context.lineTo(xpos,        ypos+(gh/2)    );
			context.stroke();
		}
	}

	this.mouse_click = null;
	this.mouse_wheel = null;
};