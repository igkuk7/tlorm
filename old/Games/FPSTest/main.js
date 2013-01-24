TLORM.Component.CameraType = 'H';
var game;
var w = window.innerWidth-20, h = window.innerHeight-20;

window.onload = function() {
	start_game();
};

function start_game(seed) {
	var canvas = document.getElementById("tlorm_game_canvas");
	
	if (game) { game.stop(); }
	game = new TLORM.Game("FPS Test", canvas);
	
	var audio = game.resource_manager.addAudio("bark.ogg");
	
	//TLORM.QuickEntity.Grid(game, "g", -100, 100, 25, 0, 20, 5, -50, 50, 10);
	/*TLORM.QuickEntity.Terrain(
		game, "land",
		-2000, -20, 0,
		4000, 20, 2000,
		'rgba(100,100,100,0.95)',
		[]
	);*/
	/*
	for (var x=0; x<=200; x += 10) {
		for (var z=100; z<=1000; z += 20) {
			TLORM.QuickEntity.Building(
				game, "buildingx1",
				Math.floor((x-5)+(Math.random()*10)), 0, z,
				Math.floor(2+Math.random()*4), // w
				Math.floor(10+Math.random()*200), // h
				Math.floor(1+Math.random()*4), // d
				'rgba('+Math.floor(20+(Math.random()*20))+','+Math.floor(20+(Math.random()*20))+','+Math.floor(20+(Math.random()*20))+',0.95)'
			);
		}
	}*/
	/* background */
	var bg = TLORM.QuickEntity.Box(game, "bg", -10000, -10000, -10000, 20000, 20000, 20000, '#F00', "images/stars.jpg");
	var f1 = TLORM.QuickEntity.BuildingFloor(game, "f1", -300, 0, -200, 600, 200, 1000, '#CCC', 20,100,20,100, '#0A0');
	
	var p1 = TLORM.QuickEntity.Player(game, "p1", 0, 0, -220, 20, 10, 20, '#F00', function(entity, direction) {
		p1_pos.point.x -= dx; 
		p1_pos.point.y -= dy; 
		p1_pos.point.z -= dz; 
	});
	var p1_pos = p1.getComponentByType('Position');
	
	var cam1 = null; // TLORM.QuickEntity.Camera(game, "cam1", 0, -300, -0, Math.PI/2,  p1, 10, 50, -50);
	var cam_pos = null; //cam1.getComponentByType('Position');
	var cam_cam = null; //cam1.getComponentByType('Camera');
	
	
	canvas.onmousewheel = function(event) {
		if (event.wheelDelta > 0) {
			if (TLORM.Component.CameraType == 'H' ) {
				cam_pos.point.z += 5; 
			} else if (TLORM.Component.CameraType == 'V' ) {
				cam_pos.point.y += 5; 
			}
		} else if (event.wheelDelta < 0) {
			if (TLORM.Component.CameraType == 'H' ) {
				cam_pos.point.z -= 5; 
			} else if (TLORM.Component.CameraType == 'V' ) {
				cam_pos.point.y -= 5; 
			}
		}
		event.preventDefault();
	};
	var startX, startY;
	canvas.onmousedown = function(event) {
		if (event.which == 1) {
			audio.pause();
			audio.play();
			startX = event.offsetX;
			startY = event.offsetY;
		}
	};
	canvas.onmousemove = function(event) {
		if (event.which == 1 && startX) {
			cam_pos.point.x += Math.floor((startX - event.offsetX)/10);
			if (TLORM.Component.CameraType == 'H' ) {
				cam_pos.point.y -= Math.floor((startY - event.offsetY)/5);
			} else if (TLORM.Component.CameraType == 'V' ) {
				cam_pos.point.z -= Math.floor((startY - event.offsetY)/5);
			}
			startX = event.offsetX;
			startY = event.offsetY;
		}
	};
	canvas.onmouseup = function(event) {
		if (event.which == 1) {
			startX = null;
			startY = null;
		}
	};
	
	var keys_down = {};
	document.onkeydown = function(event) {
		keys_down[event.keyCode] = true;
		console.log(event.keyCode);
		event.preventDefault();
	};
	document.onkeyup = function(event) {
		delete keys_down[event.keyCode];
		event.preventDefault();
	};

	var dx=0, dy=0, dz=0;
	var destination = null;
	var count = 0;
	var speed = 0.5;
	setInterval(function() {
		for (var keyCode in keys_down) {
			dx = 0;
			dy = 0;
			dz = 0;
			if (keyCode == 38) { // up
				dz = 1;
			} else if (keyCode == 40) { // down
				dz = -1;
			} else if (keyCode == 37) { // left
				dx = -1 
			} else if (keyCode == 39) { // right
				dx = 1;
			} else if (keyCode == 65) { // A
				cam_cam.setFOV(cam_cam.fov+0.01);
			} else if (keyCode == 83) { // S
				cam_cam.setFOV(cam_cam.fov-0.01);
			} else if (keyCode == 90) { // Z
				dy = 1;
			} else if (keyCode == 88) { // X
				if (p1_pos.point.y > 0) {
					dy = -1;
				}
			} else if (keyCode == 72) { // H
				TLORM.Component.CameraType = 'H';
				cam_pos.point.x = 0;
				cam_pos.point.y = 200;
				cam_pos.point.z = -600;
			} else if (keyCode == 86) { // V
				TLORM.Component.CameraType = 'V';
				cam_pos.point.x = 0;
				cam_pos.point.y = -1000;
				cam_pos.point.z = 200;
			}
			p1_pos.point.x += dx; 
			p1_pos.point.y += dy; 
			p1_pos.point.z += dz; 
		}
	}, 33);
	
	
	game.setSize(w, h);
	game.start();
}