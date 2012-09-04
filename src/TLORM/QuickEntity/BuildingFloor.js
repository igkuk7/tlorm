
TLORM.QuickEntity.BuildingFloor = function(game, name, x, y, z, w, h, d, col,min_room_w, max_room_w, min_room_h, max_room_h, room_col, floor_image, wall_image) {
	var dungeon = TLORM.Component.GenerateDungeon(w, d, min_room_w, max_room_w, min_room_h, max_room_h, 3);
	
	/* add each room as a box */
	for (var i=0; i<dungeon.rooms.length; ++i) {
		var room = dungeon.rooms[i];
		TLORM.QuickEntity.Box(game, name+"_room_"+i, x+room.x, y, z+room.y, room.w, h, room.h, room_col, wall_image, true);
	}
	
	return TLORM.QuickEntity.Box(game, name, x, y, z, w, 2, d, col, floor_image);
};