

TLORM.Component.Physics = function(can_collide, can_move) {
	return {
		type: 'Physics',
		can_collide: can_collide,
		can_move: can_move
		
		/* TODO, should probably put position, size, etc in this compoenent instead of entity */
	}
};