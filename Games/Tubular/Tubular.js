

TLORM.Component.TubeRowContainer = function(rows, end, colours) {
	return {
		type: 'TubeRowContainer',
		rows: rows,
		colours: colours,
		positions: [],
		end: end,
		rows_being_flipped: 0,
		moves: 0,
		fills: 0,
		filling: {},
		swap: TLORM.Component._TubeRowContainer.swap,
		calculatePositions: TLORM.Component._TubeRowContainer.calculatePositions,
		getPosition: TLORM.Component._TubeRowContainer.getPosition,
		init: function(game) {
			this.calculatePositions();
		}
	};
};

/* functions to move the rows */
TLORM.Component._TubeRowContainer = {};
TLORM.Component._TubeRowContainer.swap = function(a, b) {
	var tmp = this.rows[a];
	this.rows[a] = this.rows[b];
	this.rows[b] = tmp;
};
TLORM.Component._TubeRowContainer.getPosition = function(row, col) {
	if (row < 0) {
		row = this.positions.length + row;
	}
	return this.positions[row][col];
};
TLORM.Component._TubeRowContainer.calculatePositions = function() {
	/* starting positions */
	var starting_positions = [];
	var tube_row = this.rows[0].getComponentByType('TubeRow');
	for (var i=0; i<tube_row.cols; ++i) {
		starting_positions.push(i);
	}
	var positions = [starting_positions];
	var current_position = starting_positions;
	for (var i=0; i<this.rows.length; ++i) {
		var next_position = [];
		var tube_row = this.rows[i].getComponentByType('TubeRow');
		for (var j=0; j<tube_row.mapping.length; ++j) {
			next_position[tube_row.mapping[j]] = current_position[j];
		}
		positions.push(next_position);
		current_position = next_position;
	}
	
	this.positions = positions;
	
	for (var i=0; i<this.end.length; ++i) {
		if (this.getPosition(-1, i) == this.end[i]) {
			this.filling[i] = true;
		} else {
			this.filling[i] = false;
		}
	}
};

TLORM.Component.TubeRow = function(cols, mapping, fixed) {
	return {
		type: 'TubeRow',
		cols: cols,
		mapping: mapping,
		fixed: fixed || false,
		tube_clicked: null,
		flipHorizontal: TLORM.Component._TubeRow.flipHorizontal,
		flipVertical: TLORM.Component._TubeRow.flipVertical,
		swapTubeEnds: TLORM.Component._TubeRow.swapTubeEnds,
		swapTubeStarts: TLORM.Component._TubeRow.swapTubeStarts
	};
};

/* functions to translate the mappings */
TLORM.Component._TubeRow = {};
TLORM.Component._TubeRow.flipHorizontal = function() {
	/* simply reverse the mapping order */
	var new_mapping = [];
	for (var i=0; i<this.cols; ++i) {
		new_mapping[i] = (this.cols-1)-this.mapping[this.cols-1-i];
	}
	this.mapping = new_mapping;
};
TLORM.Component._TubeRow.flipVertical = function() {
	/* simply slip the mapping */
	var new_mapping = [];
	for (var i=0; i<this.cols; ++i) {
		new_mapping[this.mapping[i]] = i;
	}
	this.mapping = new_mapping;
};
TLORM.Component._TubeRow.swapTubeStarts = function(a, b) {
	var tmp = this.mapping[a];
	this.mapping[a] = this.mapping[b];
	this.mapping[b] = tmp;
};
TLORM.Component._TubeRow.swapTubeEnds = function(a, b) {
	var start_a = -1;
	var start_b = -1;
	for (var i=0; i<this.cols; ++i) {
		if (this.mapping[i] == a) {
			start_a = i;
		}
		if (this.mapping[i] == b) {
			start_b = i;
		}
	}
	this.swapTubeStarts(start_a, start_b);
};

TLORM.QuickEntity.RandomLevelSolution = {};
TLORM.QuickEntity.RandomLevel = function(game,x, y, w, h, rows, cols, seed) {
	/* generate random mappings */
	var default_mapping = [];
	for (var j=0; j<cols; j++) {
		default_mapping.push(j);
	}
	var tube_rows = [];
	for (var i=0; i<rows; i++) {
		var mapping = default_mapping.slice();
		mapping.sort(function() { return 0.5 - Math.random(); });
		tube_rows.push(TLORM.QuickEntity.TubeRow(game, "Row"+(i+1), x, (h/2)+y+i*h, w*cols, h, cols, mapping, (Math.random() < 0)));
	}
	
	/* setup the container */
	var container_entity = TLORM.QuickEntity.TubeRowContainer(game, "RandomLevel", "RowContainer", x, y, w*cols, h*(rows+1), tube_rows, []);
	var container = container_entity.getComponentByType('TubeRowContainer');
	
	/* calculate positions to get a valid end configuration from the default position */
	container.calculatePositions();
	container.end = container.positions[rows].slice();
	
	/* mix up the rows */
	TLORM.QuickEntity.RandomLevelSolution = {};
	var mixes = Math.floor(rows*cols/2);
	for (var i=0; i<mixes; ++i) {
		var action = (Math.random() < 0.5 ? 'V' : 'H');
		var row = Math.floor(Math.random()*rows);
		var move = action+(row+1);
		if (TLORM.QuickEntity.RandomLevelSolution[move]) { continue; }
		var tube_row = tube_rows[row].getComponentByType('TubeRow');
		if (tube_row.fixed) { continue; }
		switch (action) {
			case 'V':
				tube_row.flipVertical();
				break;
			case 'H':
				tube_row.flipHorizontal();
				break;
			default:
				break;
		}
		TLORM.QuickEntity.RandomLevelSolution[move] = true;
	}
	container.calculatePositions();
	console.log(TLORM.QuickEntity.RandomLevelSolution);
	
	for (var i=0; i<container.end.length; ++i) {
		if (container.getPosition(-1, i) == container.end[i]) {
			container.filling[i] = true;
		} else {
			container.filling[i] = false;
		}
	}
	
	return container_entity;
};

TLORM.QuickEntity.TubeRowContainer = function(game, level_file, name, x, y, w, h, rows, end) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(level_file, [
			TLORM.Component.Render(1, null, '#000'),
			TLORM.Component.TubeRowContainer(rows, end, ['#F00', '#0F0', '#00F', '#FF0', '#0FF', '#B4B', '#BB4', '#4BB', '#44B', '#B44', '#4B4' ])
		], x, y, w, h)
	);
};
TLORM.QuickEntity.TubeRow = function(game, name, x, y, w, h, cols, mapping, fixed) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1, '#CCC', '#000'),
			TLORM.Component.TubeRow(cols, mapping, fixed)
		], x, y, w, h)
	);
};
TLORM.QuickEntity.Level = function(game, level_file, x, y, w, h) {
	var level = game.resource_manager.loadFile(level_file);
	var lines = level.split("\n");
	var cols = 0;
	var rows = 0;
	var tube_rows = [];
	var end = [];
	var mixes = [];
	for (var i=0; i<lines.length; i++) {
		var line = lines[i];
		if (line.indexOf("=") === -1) {
			var fixed = false;
			var line_length = line.length;
			if (line.substr(line_length-1,1) === 'F') {
				fixed = true;
				--line_length;
			}
			if (line_length > cols) { cols = line_length; }
			var mapping = [];
			for (var j=0; j<line_length; j++) {
				mapping.push(line.substr(j,1)-1);
			}
			tube_rows.push(TLORM.QuickEntity.TubeRow(game, "Row"+(i+1), x, (h/2)+y+i*h, w*cols, h, cols, mapping, fixed));
		} else if (line.indexOf("E=") != -1) {
			var end_line = line.substr(2);
			for (var j=0; j<end_line.length; j++) {
				end.push(end_line.substr(j,1)-1);
			}
		} else if (line.indexOf("M=") != -1) {
			var mix_line = line.substr(2);
			mixes = mix_line.split(',');
		}
	}
	rows = tube_rows.length;
	
	/* mix up the rows */
	for (var i=0; i<mixes.length; ++i) {
		var action = mixes[i].substr(0,1);
		var row = mixes[i].substr(1,1) - 1;
		switch (action) {
			case 'V':
				tube_rows[row].getComponentByType('TubeRow').flipVertical();
				break;
			case 'H':
				tube_rows[row].getComponentByType('TubeRow').flipHorizontal();
				break;
			default:
				break;
		}
	}
	
	/* 1 extra row for the desired end */
	return TLORM.QuickEntity.TubeRowContainer(game, level_file, "RowContainer", x, y, w*cols, h*(rows+1), tube_rows, end);
};

/* system to render tubes */
TLORM.System.RenderTubes = function(context, w, h) {
	var tube_line_width = 15;
	var tube_flip_h_steps = 10;
	var tube_flip_v_steps = 10;
	return {
		type: 'RenderTubes',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* get tube container */
			var container_entity = (game.entity_manager.getEntitiesByType('TubeRowContainer'))[0];
			var container = container_entity.getComponentByType('TubeRowContainer');
			
			/* draw it down the page */
			var default_tube_w = 0;
			var default_tube_h = 0;
			var end_h = container_entity.h;
			for (var i=0; i<container.rows.length; ++i) {
				var entity = container.rows[i];
				var tube_row = entity.getComponentByType('TubeRow');

				this.renderRow(container, entity, tube_row);

				var tube_w = entity.w / tube_row.cols;
				var tube_h = entity.h;
				
				/* render the mapping */
				for (var j=0; j<tube_row.cols; ++j) {
					if (tube_row.tube_clicked != null && tube_row.tube_clicked == tube_row.mapping[j]) {
						this.context.lineWidth = tube_line_width;
						this.renderRowPaths(container, entity, tube_row.mapping, i, j, tube_w, tube_h, true, true);
					} else {
						this.context.lineWidth = tube_line_width;
						this.renderRowPaths(container, entity, tube_row.mapping, i, j, tube_w, tube_h, true);
					}
					this.context.lineWidth = tube_line_width - 3;
					this.renderRowPaths(container, entity, tube_row.mapping, i, j, tube_w, tube_h);
				}
				
				/* set defaults only if entity is not transforming */
				if (!entity.getComponentByType('Transform') && !entity.getComponentByType('Animation')) {
					default_tube_w = tube_w;
					default_tube_h = tube_h;
				}
			}

			/* render start */
			this.renderStart(container_entity.x, container_entity.y, default_tube_w, default_tube_h, container);
			
			/* render desired end */
			this.renderDesiredEnd(container_entity.x, end_h-(default_tube_h/2), default_tube_w, default_tube_h, container);
			
			/* render container over everything */
			this.renderContainer(container_entity);
			
		},
		renderContainer: function(entity) {
			var render = entity.getComponentByType('Render');
			if (render.fill_colour) {
				this.context.fillStyle = render.fill_colour;
				this.context.fillRect(entity.x, entity.y, entity.w, entity.h);
			}
			if (render.stroke_colour) {
				this.context.lineWidth = 1;
				this.context.strokeStyle = render.stroke_colour;
				this.context.strokeRect(entity.x, entity.y, entity.w, entity.h);
			}
		},
		renderRow: function(container, entity, tube_row) {
			var render = entity.getComponentByType('Render');
			if (render.fill_colour) {
				this.context.fillStyle = ( tube_row.fixed ? '#444' : render.fill_colour );
				this.context.fillRect(entity.x, entity.y, entity.w, entity.h);
			}
			if (render.stroke_colour) {
				this.context.lineWidth = 1;
				this.context.strokeStyle = render.stroke_colour;
				this.context.strokeRect(entity.x, entity.y, entity.w, entity.h);
			}
		},
		renderRowPaths: function(container, entity,  mapping, row, col, tube_w, tube_h, outline, clicked) {
			var dir_w  = tube_w / 100;
			var dir_h  = entity.h / 1.1; 

			/* get the position to colour */
			if (outline) {
				if (clicked) {
					this.context.strokeStyle = '#0FF';
				} else {
					this.context.strokeStyle = '#000';
				}
			} else {
				var pos = container.getPosition(row, col);
				if (container.filling[pos] && container.rows_being_flipped == 0) {
					this.context.strokeStyle = container.colours[pos];
				} else {
					this.context.strokeStyle = '#FFF';
				}
			}
			
			/* figure out direction for horizontal curve */
			var dir = 1;
			if (col === mapping[col]) {
				dir = 0;
			} else if (col > mapping[col]) {
				dir = -1;
			}
			
			/* render the path */
			this.context.beginPath();
			this.context.moveTo(entity.x + ((col+0.5)*tube_w), entity.y-1);
			if (dir === 0) {
				this.context.lineTo(
					entity.x + ((mapping[col]+0.5)*tube_w),
					entity.y + entity.h + 1
				);
			} else {
				this.context.bezierCurveTo(
					entity.x + ((col+0.5)*tube_w) + (dir*dir_w),
					entity.y + dir_h,
					entity.x + ((mapping[col]+0.5)*tube_w) - (dir*dir_w),
					entity.y + entity.h - dir_h,
					entity.x + ((mapping[col]+0.5)*tube_w),
					entity.y + entity.h + 1
				);
			}
			this.context.stroke();
		},
		renderDesiredEnd: function(x, y, tube_w, tube_h, container) {
			for (var i=0; i<container.end.length; ++i) {
				
				/* set the colour */
				this.context.lineWidth = 1;
				this.context.strokeStyle = '#000';
				this.context.fillStyle = container.colours[container.end[i]];
				
				/* colour as squares */
				this.context.fillRect(x+(i*tube_w), y, tube_w, tube_h/2);
				this.context.strokeRect(x+(i*tube_w), y, tube_w, tube_h/2);
			}
		},
		renderStart: function(x, y, tube_w, tube_h, container) {
			for (var i=0; i<container.end.length; ++i) {
				
				/* set the colour */
				this.context.lineWidth = 1;
				this.context.strokeStyle = '#000';
				this.context.fillStyle = container.colours[i];
				
				/* colour as squares */
				this.context.fillRect(x+(i*tube_w), y, tube_w, tube_h/2);
				this.context.strokeRect(x+(i*tube_w), y, tube_w, tube_h/2);
			}
		}
	};
};

/* system to map user input to the various components */
TLORM.System.UserInput = function() {
	return {
		type: 'UserInput',
		touch_event: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("click", function(event) { system.clickHandler(event); } );
			game.registerEvent("touch", function(event) { system.clickHandler(event); } );
		},
		clickHandler: function(event) {
			this.touch_event = event;
		},
		update: function(game) {
			
			/* check if an what event was triggered and apply the movement as required */
			if (this.touch_event) {
				
				/* get tube container */
				var container_entity = (game.entity_manager.getEntitiesByType('TubeRowContainer'))[0];
				var container = container_entity.getComponentByType('TubeRowContainer');
				
				/* handle any clicks to tubes */
				this.tubeClicked(game, container_entity, container);
				this.touch_event = null;
			}
		},
		startClicked: function(game, container_entity, container) {
			return null;
			if (this.touch_event) {
				var event = this.touch_event;
				var tube_row = container.rows[0].getComponentByType('TubeRow');
				if (   container_entity.x <= event.offsetX && event.offsetX <= container_entity.x + container_entity.w
				    && container_entity.y <= event.offsetY && event.offsetY <= container_entity.y + container.rows[0].h / 2
				) {
					/* which position was clicked? */
					var tube_w = container_entity.w / tube_row.cols;
					var position = Math.floor((event.offsetX - container_entity.x) / tube_w);
					return position;
				}
			}
			return -1;
		},
		tubeClicked: function(game, container_entity, container) {
			if (this.touch_event) {
				var event = this.touch_event;
				var entities = game.entity_manager.getEntitiesByType('TubeRow');
				for (var i=0; i<entities.length; ++i) {
					var entity = entities[i];
					if (   entity.x <= event.offsetX && event.offsetX <= entity.x + entity.w
					    && entity.y <= event.offsetY && event.offsetY <= entity.y + entity.h 
					) {
						/* Click at edges or near middle? */
						var threshold = 100;
						if (   entity.x <= event.offsetX && event.offsetX <= entity.x + threshold
						    || entity.x + entity.w - threshold <= event.offsetX && event.offsetX <= entity.x + + entity.w
						) {
							entity.edge_click = true;
						}
						
						/* which tube was clicked */
						var tube_row = entity.getComponentByType('TubeRow');
						var tube_w = entity.w / tube_row.cols;
						var tube_pos = Math.floor( (event.offsetX - entity.x) / tube_w );
						if (tube_row.tube_clicked != null) {
							if (tube_row.tube_clicked != tube_pos) {
								tube_row.swapTubeEnds(tube_row.tube_clicked, tube_pos);
								container.calculatePositions();
							}
							tube_row.tube_clicked = null
						} else {
							tube_row.tube_clicked = tube_pos;
						}
						
						return null; //return entity;
					}
				}
			}
			return null;
		},
		horizontalTubeFlip: function(game, container, tube, tube_row) {
			var size = { x: tube.x, y: tube.y, w: tube.w, h: tube.h };
			var dx = Math.floor(tube.w / 10);
			game.entity_manager.addEntityComponent(
				tube,
				TLORM.Component.Animation(
					10,
					function(animation) {},
					function(animation, step) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(dx, null, -2*dx, null)
						);
					},
					function(animation) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(null, null, null, null, size.x, size.y, size.w, size.h)
						);
						tube_row.flipHorizontal();
						container.calculatePositions();
						--container.rows_being_flipped;
					}
				)
			);
			++container.rows_being_flipped;
		},
		verticalTubeFlip: function(game, container, tube, tube_row) {
			var size = { x: tube.x, y: tube.y, w: tube.w, h: tube.h };
			var dy = Math.floor(tube.h / 10);
			game.entity_manager.addEntityComponent(
				tube,
				TLORM.Component.Animation(
					10,
					function(animation) {},
					function(animation, step) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(null, dy, null, -2*dy)
						);
					},
					function(animation) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(null, null, null, null, size.x, size.y, size.w, size.h)
						);
						tube_row.flipVertical();
						container.calculatePositions();
						--container.rows_being_flipped;
					}
				)
			);
			++container.rows_being_flipped;
		}
	};
};


/* system to render tubes */
TLORM.System.Scoring = function() {
	var scores = [];
	return {
		type: 'Scoring',
		update: function(game) {

			/* get tube container */
			var container_entity = (game.entity_manager.getEntitiesByType('TubeRowContainer'))[0];
			var container = container_entity.getComponentByType('TubeRowContainer');
			
			/* update score based on moves */
			scores[container_entity.name] = container.rows.length * container.end.length * 100 - ( container.moves * 50 ) - ( container.fills * 25 );
			
			/* check if game is over */
			if (container.rows_being_flipped == 0) {
				var misses = container.end.length;
				for (var i=0; i<container.end.length; ++i) {
					if (container.filling[container.end[i]] && container.end[i] === container.getPosition(-1, i)) {
						--misses;
					}
				}
				if (misses === 0) {
					game.gameOver(true, scores[container_entity.name]);
				}
			}
		}
	};
};

var game;
window.onload = function() {
	var canvas = document.getElementById("tlorm_game_canvas");
	game = new TLORM.Game("Tubular", canvas);
	var menus = new TLORM.GameMenu(game, 'TubularMenu.json');
	game.onStop = function() {
		game.reset();
		menus.reset();
		menus.show();
	};
	menus.show();
};

function show_level() {
	var container_entities = game.entity_manager.getEntitiesByType('TubeRowContainer');
	if (container_entities.length == 0) return;
	var container = container_entities[0].getComponentByType('TubeRowContainer');
	if (!container) return;
	var string = "";
	for (var i=0; i<container.rows.length; ++i) {
		var tube_row = container.rows[i].getComponentByType('TubeRow');
		for (var j=0; j<tube_row.mapping.length; ++j) {
			string += tube_row.mapping[j];
		}
		if (container.rows[i].fixed) {
			string += "F";
		}
		string += "\n";
	}
	string += "E=";
	for (var i=0; i<container.end.length; ++i) {
		string += container.end[i];
	}
	string += "\n";
	
	window.open('data:text/plain;charset=utf-8,'+escape(string),'_blank');
}