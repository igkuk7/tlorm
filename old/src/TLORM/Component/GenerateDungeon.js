

TLORM.Component.GenerateDungeon = function(w, h, min_room_w, max_room_w, min_room_h, max_room_h, max_doors) {
	return {
		type: 'GenerateDungeon',
		w: w,
		h: h,
		min_room_w: min_room_w,
		max_room_w: max_room_w,
		min_room_h: min_room_h,
		max_room_h: max_room_h,
		max_doors: max_doors,
		rooms: generateRooms(w, h, min_room_w, max_room_w, min_room_h, max_room_h),
		corridors: [],
	};
	
	function generateRooms(w, h, min_room_w, max_room_w, min_room_h, max_room_h) {
		var rooms = [];

		var room_w_var = max_room_w - min_room_w;
		var room_h_var = max_room_h - min_room_h;
		
		/* split the whole area into a grid using max sizes */
		var grid_locations = [];
		var grid_w = Math.floor(w/max_room_w);
		var grid_h = Math.floor(h/max_room_h);
		for (var x=0; x<grid_w; ++x) {
			var grid_row_w = max_room_w;
			var pos_x = x*grid_row_w;
			for (var y=0; y<grid_h; ++y) {
				var grid_row_h = max_room_h;
				var pos_y = y*grid_row_h;
				grid_locations.push({ x: pos_x, y: pos_y, w: grid_row_w, h: grid_row_h });
			}
		}
			
		/* randomly sort locations */
		grid_locations.sort(function() { return Math.random() - 0.5; } );
		
		/* random generate rooms within each grid location */
		while (grid_locations.length > 0) {
			
			/* pick next location and put a room in it */
			var location = grid_locations.pop();
			var room = {
				x: location.x + Math.floor(Math.random()*min_room_w),
				y: location.y + Math.floor(Math.random()*min_room_h),
				w: min_room_w + Math.floor(Math.random()*room_w_var),
				h: min_room_h + Math.floor(Math.random()*room_h_var),
			};
			
			/* check room within location and if not put location back and go again */
			if (room.x+room.w > location.x+location.w || room.y+room.h > location.y+location.h) {
				grid_locations.unshift(location);
				continue;
			}
			
			rooms.push(room);
		}
		
		/* TODO: join rooms together with some corridors */
		
		return rooms;
	}
};