

TLORM.System.Movement = function() {
	return {
		type: 'Movement',
		moveEvent: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("mousemove", function(event) { system.moveHandler(event); } );
			game.registerEvent("mouseout", function(event) { system.moveHandler(event); } );
		},
		moveHandler: function(event) {
			this.moveEvent = event;
		},
		outHandler: function(event) {
			this.moveEvent = null;
		},
		update: function(game) {
			
			var followers = this.getFollowers(game);
			for (var i=0; i<followers.length; ++i) {
				var follower = followers[i];
				var follow = follower.getComponentByType('Follow');
				var follower_position = follower.getComponentByType('Position');
				var followee = follow.follow;
				var followee_position = followee.getComponentByType('Position');
				if (follower_position && followee_position) {
					follower_position.point.x = followee_position.point.x + follow.dx;
					follower_position.point.y = followee_position.point.y + follow.dy;
					follower_position.point.z = followee_position.point.z + follow.dz;
				}
			}
			
			if (this.moveEvent) {
				var entity = this.getMouseMoveable(game)[0];
				if (entity) {
					var movement = entity.getComponentByType('FollowMouse');
					
					var x_diff = this.moveEvent.offsetX - entity.x - entity.w/2;
					if (Math.abs(x_diff) <= movement.speed) {
						entity.moveTo(this.moveEvent.offsetX - entity.w/2, null);
					} else if (x_diff < 0) {
						entity.move(-movement.speed, null);
					} else  {
						entity.move(movement.speed, null);
					}
					
					var y_diff = this.moveEvent.offsetY - entity.y - entity.h/2;
					if (Math.abs(y_diff) <= movement.speed) {
						entity.moveTo(null, this.moveEvent.offsetY - entity.h/2);
					} else if (y_diff < 0) {
						entity.move(null, -movement.speed);
					} else  {
						entity.move(null, movement.speed);
					}
				}
			}
		},
		getMouseMoveable: function(game) {
			return game.entity_manager.getEntitiesByType('FollowMouse');
		},
		getFollowers: function(game) {
			return game.entity_manager.getEntitiesByType('Follow');
		},
	};
};