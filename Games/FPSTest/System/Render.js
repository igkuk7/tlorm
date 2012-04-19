
/* system to render */
TLORM.System.Render = function(context, w, h) {
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
						var col = (255 * (j/map.h));
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