// DEPENDENCY: Component.js

TLORMEngine.Components.Dungeon = function(args) {
	args.type = 'Dungeon';
	TLORMEngine.Components.Component.call(this, args);

	this.w = args.w;
	this.h = args.h;
	this.gw = args.gw || 50;
	this.gh = args.gh || 50;
	this.offset_x = 0;
	this.offset_y = 0;
	this.entities = [];
	this.rooms = [];
	this.corridors = [];
	this.map = [];
	if (args.from_random) {
		this.generateRandomDungeon();
	}

};

// inherit from normal component
TLORMEngine.Components.Dungeon.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Dungeon.prototype.generateRandomDungeon = function() {
	for (var i=0; i<this.w*this.h; ++i) {
		this.map[i] = 0;
	}

	for (var i=0; i<5; ++i) {
		var x = Math.round(Math.random()*(this.w-1));
		var y = Math.round(Math.random()*(this.h-1));
		this.generateRandomRoom(x, y);
		this.map[x+y*this.h] = 1;
	}

	for (var i=1; i<this.rooms.length; ++i) {
		this.generateCorridor(this.rooms[i-1], this.rooms[i]);
	}
	this.generateCorridor(this.rooms[i-1], this.rooms[0]);
};

TLORMEngine.Components.Dungeon.prototype.generateRandomRoom = function(x, y) {
	var room_entity = new TLORMEngine.Entities.Entity({
		name: "room_"+x+"_"+y,
		components: [
			new TLORMEngine.Components.Position({ x: x*this.gw, y: y*this.gh, w: this.gw, h: this.gh }),
			new TLORMEngine.Components.Render2D({ fill_colour: "#BB44DD", stroke_colour: "#111111", z: 2, show_name: true }),
			new TLORMEngine.Components.DungeonRoom({ }),
		]
	});
	this.rooms.push({ entity : room_entity, x: x, y: y });
	this.entities.push(room_entity);
};

TLORMEngine.Components.Dungeon.prototype.generateCorridor = function(room_a, room_b) {
	if (room_a.x < room_b.x) {
		this.generateHorizontalCorridor(room_a, room_b);
	} else if (room_a.x > room_b.x) {
		this.generateHorizontalCorridor(room_b, room_a);
	}

	if (room_a.y < room_b.y) {
		this.generateVerticalCorridor(room_a, room_b);
	} else if (room_a.y > room_b.y) {
		this.generateVerticalCorridor(room_b, room_a);
	}
};

TLORMEngine.Components.Dungeon.prototype.generateHorizontalCorridor = function(from_room, to_room) {
	var y = from_room.y;
	for (var x=from_room.x; x<to_room.x; ++x) {
		var corridor_entity = new TLORMEngine.Entities.Entity({
			name: "corridor"+x+"_"+y,
			components: [
				new TLORMEngine.Components.Position({ x: x*this.gw, y: y*this.gh, w: this.gw, h: this.gh }),
				new TLORMEngine.Components.Render2D({ fill_colour: "#AA22BB", z: 1 }),
			]
		});
		this.corridors.push(corridor_entity);
		this.map[x+y*this.h] = 2
	}
};

TLORMEngine.Components.Dungeon.prototype.generateVerticalCorridor = function(from_room, to_room) {
	var x = from_room.x;
	for (var y=from_room.y; y<to_room.y; ++y) {
		var corridor_entity = new TLORMEngine.Entities.Entity({
			name: "corridor"+x+"_"+y,
			components: [
				new TLORMEngine.Components.Position({ x: x*this.gw, y: y*this.gh, w: this.gw, h: this.gh }),
				new TLORMEngine.Components.Render2D({ fill_colour: "#AA22BB", z: 1 }),
			]
		});
		this.corridors.push(corridor_entity);
		this.map[x+y*this.h] = 2;
	}
};

TLORMEngine.Components.Dungeon.prototype.entitiesToAdd = function() {
	var entities = this.entities;
	this.entities = [];
	return entities;
};
