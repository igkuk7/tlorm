
TLORM.Component.Map = function(map) {
	return {
		type: 'Map',
		map: map,
		w: map[0].length,
		h: map.length,
	};
};