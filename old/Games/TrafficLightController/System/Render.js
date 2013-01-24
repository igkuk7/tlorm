
/* system to render */
TLORM.System.Render = function(context, w, h) {
	return {
		type: 'Render',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* draw cities */
			var cities = this.getCities(game);
			for (var i=0; i<cities.length; ++i) {
				this.renderCity(game, cities[i]);
			}
		},
		getCities: function(game) {
			return game.entity_manager.getEntitiesByType('City');
		},
		renderCity: function(game, city_entity) {
			this.context.fillStyle = '#000';
			this.context.fillRect(city_entity.x, city_entity.y, city_entity.w, city_entity.h);

			var city = city_entity.getComponentByType('City');
			var gw = city_entity.w / city.map[0].length;
			var gh = city_entity.h / city.map.length;
			for (var i=0; i<city.map.length; ++i) {
				for (var j=0; j<city.map[i].length; ++j) {
					var x = j*gw;
					var y = i*gh;
					switch (city.map[i][j]) {
						case TLORM.Component.CityKey.Building:
							this.context.fillStyle = '#AAA';
							break;
						case TLORM.Component.CityKey.Road:
							this.context.fillStyle = '#CCC';
							break;
						case TLORM.Component.CityKey.Grass:
							this.context.fillStyle = '#AFA';
							break;
						case TLORM.Component.CityKey.Empty:
						default:
							this.context.fillStyle = '#000';
							break;
					}

					this.context.fillRect(x, y, gw, gh);
				}
			}
		}
	};
};