

TLORM.QuickEntity.BlockThreshold = 11;

TLORM.QuickEntity.RandomCity = function(game, x, y, w, h, gw, gh, dx, dy, seed) {
	console.log("Seeding "+seed);
	Math.seedrandom(seed);
	
	/* empty map */
	var map = TLORM.QuickEntity.EmptyMap(w, h);
	TLORM.QuickEntity.AddRingRoad(map);
	TLORM.QuickEntity.AddRoadGrid(map, dx, dy);
	
	return TLORM.QuickEntity.City(game, "RandomCity", x, y, w*gw, h*gh, map);
};

TLORM.QuickEntity.AddRoadGrid = function(map, dx, dy) {
	var w = map[0].length;
	var h = map.length;
	for (var i=0; i<w; ++i) {
		for (var j=0; j<h; ++j) {
			if ((i%dx) === 0 || (j%dy) == 0) {
				map[j][i] = TLORM.Component.CityKey.Road;
			}
		}
	}
};

TLORM.QuickEntity.GenerateRoadMap = function(map, w, h) {
	/* first generate a selection of junctions */
	var num_junctions = Math.min(w,h)/10;
	var junctions = [];
	for (var i=0; i<num_junctions; ++i) {
		var junction = {
			x: Math.floor(Math.random()*w),
			y: Math.floor(Math.random()*h)
		};
		
		/* each junction can have up to 4 connections, we going to have max of cross junction */
		var connections = 1 + Math.round(Math.random()*3);
		while (connections-- > 0) {
			junctions.push(junction);
		}
	}
	
	/* now we randomly pair up the junctions */
	junctions.sort(function() { return 0.5 - Math.random(); } );
	while (junctions.length > 1) {
		var a = junctions.pop();
		var b = null;
		var attempts = 10;
		while (attempts-- > 0) {
			b = junctions.pop();
			if (a === b) {
				junctions.unshift(b);
				b = null;
			} else {
				break;
			}
		}
		if (attempts == 0 || !b) {
			console.log("Fatal error");
		} else {
			/* TODO: join a to b on map */
			var path = TLORM.QuickEntity.RandomBuilding.ShortestPath(map, a.x, a.y, b.x, b.y);
			for (var i=0; i<path.length; ++i) {
				map[path[i].y][path[i].x] = TLORM.Component.CityKey.Road;
			}
		}
	}
};

TLORM.QuickEntity.EmptyMap = function(w, h) {
	var map = [];
	for (var i=0; i<h; ++i) {
		var row = [];
		for (var j=0; j<w; ++j) {
			row.push(TLORM.Component.CityKey.Empty);
		}
		map.push(row);
	}
	return map;
};

TLORM.QuickEntity.AddRingRoad = function(map) {
	var w = map[0].length;
	var h = map.length;
	for (var i=0; i<w; ++i) {
		map[0][i]   = TLORM.Component.CityKey.Road;
		map[h-1][i] = TLORM.Component.CityKey.Road;
	}
	for (var i=1; i<h-1; ++i) {
		map[i][0]   = TLORM.Component.CityKey.Road;
		map[i][w-1] = TLORM.Component.CityKey.Road;
	}
};

TLORM.QuickEntity.SubdivideCity = function(map, x1, y1, x2, y2) {
	var dx = x2-x1;
	var dy = y2-y1;
	var size = Math.min(dx, dy);
	/* If area is big roads bisecting the area */
	if (size > TLORM.QuickEntity.BlockThreshold) {
		var mid_x = x1 + Math.round(dx/2);
		var mid_y = y1 + Math.round(dy/2);
		for (var i=x1; i<=x2; ++i) {
			map[mid_y][i] = TLORM.Component.CityKey.Road;
		}
		for (var i=y1; i<=y2; ++i) {
			map[i][mid_x] = TLORM.Component.CityKey.Road;
		}
		
		TLORM.QuickEntity.SubdivideCity(map, x1,      y1,      mid_x-1, mid_y-1);
		TLORM.QuickEntity.SubdivideCity(map, mid_x+1, y1,      x2,      mid_y-1);
		TLORM.QuickEntity.SubdivideCity(map, x1,      mid_y+1, mid_x-1, y2      );
		TLORM.QuickEntity.SubdivideCity(map, mid_x+1, mid_y+1, x2,      y2      );
	} else {
		TLORM.QuickEntity.SubdivideBlock(map, x1, y1, x2, y2);
	}
};

TLORM.QuickEntity.SubdivideBlock = function(map, x1, y1, x2, y2) {
	var dx = x2-x1;
	var dy = y2-y1;
	
	/* break up into alleys */
	var alleys = Math.round(0.49+Math.random());
	var alley_joins = [];
	for (var i=0; i<alleys; ++i) {
		/* no alleys next to roads */
		alley_joins.push({
			x: 1 + x1 + Math.round(Math.random()*(dx-2)),
			y: 1 + y1 + Math.round(Math.random()*(dy-2))
		});
	}
	
	/* draw alleys through points */
	for (var i=0; i<alley_joins.length; ++i) {
		for (var j=x1; j<=x2; ++j) {
			map[alley_joins[i].y][j] = TLORM.Component.CityKey.Road;
		}
		for (var j=y1; j<=y2; ++j) {
			map[j][alley_joins[i].x] = TLORM.Component.CityKey.Road;
		}
	}
};

TLORM.QuickEntity.RandomBuildings = function(map, buildings) {
	for (var i=0; i<buildings; ++i) {
		TLORM.QuickEntity.RandomBuilding(map);
	}
};

TLORM.QuickEntity.RandomBuilding = function(map) {
	var w = map[0].length - 2;
	var h = map.length    - 2;
	
	var x = 1 + Math.floor(Math.random() * w);
	var y = 1 + Math.floor(Math.random() * h);
	map[y][x] = TLORM.Component.CityKey.Building;
	
	/* grows the building */
	var sections = [ { x: x, y: y } ];
	while (sections.length > 0) {
		var section = sections.pop();
		if (Math.random() < 0.5) {
			for (var i=section.x-1; i<section.x+1; ++i) {
				if (i <= 1 || w <= i) continue;
				for (var j=section.y-1; j<section.y+1; ++j) {
					if (j <= 1 || h <= j) continue;
					if (map[j] && map[j][i] && map[j][i] == TLORM.Component.CityKey.Empty) {
						map[j][i] = TLORM.Component.CityKey.Building;
						sections.push({ x: i, y: j });
					}
				}
			}
		}
	}
};

TLORM.QuickEntity.RandomBuilding.ShortestPath = function(map, x1, y1, x2, y2) {
	var open_list = [];
	var open_list_by_pos = {};
	var closed_list = [];
	var closed_list_by_pos = {};
	var pos = { x: x1, y: y1, F: 0, G: 0, H: 0, parent: null };
	open_list.push(pos);
	open_list_by_pos[pos.x+","+pos.y] = pos;
	
	var found_end = false;
	while (open_list.length > 0) {
		open_list.sort(function (a,b) { return (b.F || 0) - (a.F || 0); } );
		
		pos = open_list.pop();
		closed_list.push(pos);
		closed_list_by_pos[pos.x+","+pos.y] = pos;
		
		if (pos.x === x2 && pos.y === y2) {
			found_end = true;
			break;
		}
		
		var cells = TLORM.QuickEntity.RandomBuilding.AdjacentCells(map, pos.x, pos.y);
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			if (!closed_list_by_pos[cell.x+","+cell.y]) {
				var travel_cost = ( pos.x != cell.x && pos.y != cell.y ? 14 : 10 );
				if (cell.x === x2 && cell.y === y2) {
					travel_cost = 0;
				}
				
				if (!open_list_by_pos[cell.x+","+cell.y]) {
					cell.parent = pos;
					cell.G = travel_cost + pos.G;
					cell.H = ( Math.abs( x2 - cell.x ) + Math.abs( y2 - cell.y ) ) * 10;
					cell.F = cell.G + cell.H;
					open_list.push(cell);
					open_list_by_pos[cell.x+","+cell.y] = cell;
				} else {
					cell = open_list_by_pos[cell.x+","+cell.y];
					var G = travel_cost + pos.G;
					if (G < cell.G) {
						cell.G = G;
						cell.H = ( Math.abs( cell.x - x1 ) + Math.abs( cell.y - y1 ) ) * 10;
						cell.F = cell.G + cell.H;
						cell.parent = pos;
					}
				}
			}
		}
	}
	
	/* find the optimum path */
	if (found_end) {
		var shortest_path = [];
		pos = { x: x2, y: y2 };
		while (pos.x != x1 || pos.y != y1) {
			shortest_path.unshift(pos);
			pos = closed_list_by_pos[pos.x+","+pos.y].parent;
		}
		
		return shortest_path;
	}
	
	/* no path */
	return [];
};

TLORM.QuickEntity.RandomBuilding.AdjacentCells = function(map, x, y) {
	var w = map[0].length;
	var h = map.length;
	
	/* possible movement cells */
	var cells = [
		{ x: x-1, y: y },
		{ x: x,   y: y-1 },
		{ x: x+1, y: y },
		{ x: x,   y: y+1 }
	];
	
	/* check they are moveable */
	var available_cells = [];
	for (var i=0; i<cells.length; ++i) {
		if (cells[i].x < 0 || w <= cells[i].x || cells[i].y < 0 || h <= cells[i].y) {
			continue;
		}
		
		var cell_ok = true;
		if (cell_ok) {
			available_cells.push(cells[i]);
		}
	}
	
	return available_cells;
};