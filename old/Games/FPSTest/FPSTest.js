
TLORM.Component.Camera = function(angle) {
	return {
		type: 'Camera',
		angle: angle
	};
};
TLORM.Component.Map = function(map) {
	return {
		type: 'Map',
		map: map,
		w: map[0].length,
		h: map.length,
	};
};
TLORM.QuickEntity.MiniMap = function(game, name, x, y, w, h, map) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1),
			TLORM.Component.Map(map)
		], x, y, w, h)
	);
};
TLORM.QuickEntity.Map = function(game, name, x, y, w, h, map) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render3D(1),
			TLORM.Component.Map(map)
		], x, y, w, h)
	);
};
/* system to render */
TLORM.System.RenderX = function(context, w, h) {
	return {
		type: 'Render',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			var map_entity = this.getMap(game);
			var map = map_entity.getComponentByType('Map');
			this.renderMap(game, map_entity, map);
		},
		getMap: function(game) {
			var maps = game.entity_manager.getEntitiesByType('Map');
			for (var i=0; i<maps.length; ++i) {
				if (maps[i].getComponentByType('Render')) {
					return maps[i];
				}
			}
			return null;
		},
		renderMap: function(game, map_entity, map) {
			this.context.strokeStyle = '#000';
			this.context.strokeRect(map_entity.x, map_entity.y, map_entity.w, map_entity.h);
			
			var gw = map_entity.w / map.w;
			var gh = map_entity.h / map.h;
			for (var i=0; i<map.w; ++i) {
				for (var j=0; j<map.h; ++j) {
					var x = map_entity.x + (gw*i);
					var y = map_entity.y + (gh*j);
					if (map.map[j][i] > 0) {
						var col = 255-(20 * map.map[j][i] );
						this.context.fillStyle = 'rgb('+col+','+col+','+col+')';
					} else {
						this.context.fillStyle = '#FFF';
					}
					this.context.fillRect(x, y, gw, gh);
				}
			}
		}
	};
};
/* system to render */
TLORM.System.Render3D = function(context, w, h) {
	var twoPi = 2*Math.PI;
	return {
		type: 'Render3D',
		context: context,
		w: w,
		h: h,
		camera: { x: 0, y: 0, d: 10 },
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* draw cities */
			var map_entity = this.getMap(game);
			var map = map_entity.getComponentByType('Map');
			this.renderMap(game, map_entity, map);
		},
		getMap: function(game) {
			var maps = game.entity_manager.getEntitiesByType('Map');
			for (var i=0; i<maps.length; ++i) {
				if (maps[i].getComponentByType('Render3D')) {
					return maps[i];
				}
			}
			return null;
		},
		renderMap: function(game, map_entity, map) {
			//this.context.strokeStyle = '#000';
			//this.context.strokeRect(map_entity.x, map_entity.y, map_entity.w, map_entity.h);

			var gw = map_entity.w / map.w;
			var gh = map_entity.h / map.h;
			for (var y=0; y<map.length; ++y) {
				for (var x=0; x<map[y].length; ++x) {
					var screen_y = (this.camera.d * (map[y][x]-this.camera.y))/y;
					var screen_x = (this.camera.d * (x-this.camera.x))/y;
					this.context.fillStyle = 'rgb('+colour[0]+','+colour[1]+','+colour[2]+')';
					this.context.fillRect(screen_x, screen_y, 1, 1);
				}
			}
			
			return;
			
			for (var x=map_entity.x; x<map_entity.w; ++x) {
				for (var y=map_entity.y; y<map_entity.h; ++y) {
					var colour = this.sendRay(game, map_entity, map, x, y);
					this.context.fillStyle = 'rgb('+colour[0]+','+colour[1]+','+colour[2]+')';
					this.context.fillRect(x, y, 1, 1);
				}
			}
		},
		sendRay: function(game, map_entity, map, screen_x, screen_y) {
			var gw = map_entity.w / map.w;
			var gh = map_entity.h / map.h;
			var grid_x = Math.floor(screen_x/gw);
			
			var dy = map_entity.h - screen_y;
			
			/* Cast rays from bottom of the screen perpendicularly */
			var grid_y = null;
			for (var y=map.h-1; y>=0; --y) {
				var map_details = map.map[y][grid_x]*gh;
				if (map_details != 0 && dy < map_details) {
					grid_y = y;
				}
			} 
			
			if (grid_y) {
				var col = 255-(20 * grid_y );
				return [ col, col, col ];
			}
			
			return [ 255, 255, 255 ];
		},
		renderMapX: function(game, map_entity, map, x) {
			var ray_pos      = (-map_entity.w/2) + x;
			var ray_dist     = Math.sqrt(Math.pow(ray_pos,2) + Math.pow(this.camera.x, 2));
			var ray_angle    = Math.asin(ray_pos / ray_dist);
			var actual_angle = (ray_angle + this.camera.angle) % twoPi;
			this.castRay(game, map_entity, map, actual_angle);
		},
		castRay: function(game, map_entity, map, angle) {
			var right = ( angle < twoPi * 0.25 || twoPi * 0.75 < angle);
			var up    = ( angle < 0 || Math.PI < angle);
			var angle_sin = Math.sin(angle);
			var angle_cos = Math.cos(angle);
			
			/* Steps to make through grid to follow the ray */
			var gw = map_entity.w / map.w;
			var gh = map_entity.h / map.h;
			var dx = ( right ? 1 : -1 );
			var dy = Math.round((dx * (angle_sin / angle_cos))/gw) || 1;
			
			/* find distance to wall that was hit, if any */
			var dist = 0;
			var pos;
			for (var x=Math.floor(this.camera.x/gw); 0 <= x && x < map.w; x += dx) {
				for (var y=Math.floor(this.camera.y/gh); 0 <= y && y < map.h; y += dy) {
					if (map.map[y][x] == 1) {
						dist = Math.pow(x - this.camera.x, 2) + Math.pow(y - this.camera.y, 2);
						pos = { x: x, y: y };
						break;
					}
				}
			}
			
			if (dist > 0) {
				this.renderRay(game, map_entity, map, pos.x, pos.y);
			}
		},
		renderRay: function(game, map_entity, map, x, y) {
			var gw = map_entity.w / map.w;
			var gh = map_entity.h / map.h;
			this.context.strokeStyle = '#00F';
			this.context.beginPath();
			this.context.moveTo(this.camera.x*gw, this.camera.y*gw);
			this.context.lineTo(x*gw, y*gw);
			this.context.stroke();
		}
	};
};
var game;

window.onload = function() {
	start_game();
};

function start_game(seed) {
	var canvas = document.getElementById("tlorm_game_canvas");
	if (game) { game.stop(); }
	game = new TLORM.Game("FPS Test", canvas);
	
	var box1 = TLORM.QuickEntity.Box(game, "box1", 100, 100, 100, 100, 100, 100);
	game.setSize(800,600);
	game.start();
}