

TLORM.Component.CityKey = {
	Empty: 'E',
	Road: 'R',
	Building: 'B',
	Grass: 'G'
};

TLORM.Component.City = function(map, w) {
	return {
		type: 'City',
		map: map,
		w: w
	};
};