

TLORM.Component.CameraType = 'V';
TLORM.Component.Camera = function(fov) {
	return {
		type: 'Camera',
		fov: fov,
		d: 1/Math.tan(fov/2),
		setFOV: function(new_fov) {
			this.d = 1/Math.tan(new_fov/2);
			this.fov = new_fov;
		}
	};
};

TLORM.CameraFunctions = {
	world_point_to_camera_point: function(camera_entity, point) {
		var position = camera_entity.getComponentByType('Position');
		return new TLORM.Math.Point(
			point.x - position.point.x,
			point.y - position.point.y,
			point.z - position.point.z
		);
	},
	camera_point_to_projection_point: function(camera_entity, point) {
		var camera = camera_entity.getComponentByType('Camera');
		if ( TLORM.Component.CameraType == 'H' ) {
			return new TLORM.Math.Point(
				point.x * (camera.d / point.z),
				point.y * (camera.d / point.z)
			);
		} else if ( TLORM.Component.CameraType == 'V' ) {
			return new TLORM.Math.Point(
				point.x * (camera.d / point.y),
				point.z * (camera.d / point.y)
			);
		}
	},
	projection_point_to_screen_point: function(point, w, h) {
		var hw = w/2;
		var hh = h/2;
		return new TLORM.Math.Point(
			hw + hw*point.x,
			hh - hh*point.y
		);
	},
	point_on_screen: function(point, camera, w, h) {
		var camera_point = TLORM.CameraFunctions.world_point_to_camera_point(camera, point);
		var projection_point = TLORM.CameraFunctions.camera_point_to_projection_point(camera, camera_point);
		var screen_point = TLORM.CameraFunctions.projection_point_to_screen_point(projection_point, w, h);
		return screen_point;
	},
	screen_point_to_projection_point: function(point, w, h) {
		var hw = w/2;
		var hh = h/2;
		return new TLORM.Math.Point(
			(point.x - hw)/hw,
			(point.y - hh)/-hh
		);
	},
	projection_point_to_camera_point: function(camera_entity, point) {
		var camera = camera_entity.getComponentByType('Camera');
		var position = camera_entity.getComponentByType('Position').point;
		if (position.z == null) {
			return null;
		}
		return new TLORM.Math.Point(
			point.x / (camera.d / position.z),
			point.y / (camera.d / position.z)
		);
	},
	camera_point_to_world_point: function(camera_entity, point) {
		var position = camera_entity.getComponentByType('Position');
		return new TLORM.Math.Point(
			point.x + position.point.x,
			point.y + position.point.y
		);
	},
	screen_point_to_world_point: function(point, camera, w, h) {
		var projection_point = TLORM.CameraFunctions.screen_point_to_projection_point(point, w, h);
		var camera_point = TLORM.CameraFunctions.projection_point_to_camera_point(camera, projection_point);
		var world_point = TLORM.CameraFunctions.camera_point_to_world_point(camera, camera_point);
		return world_point;
	},
};