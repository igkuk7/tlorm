// DEPENDENCY: Component.js

TLORMEngine.Components.DungeonRoom = function(args) {
	args.type = 'DungeonRoom';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.DungeonRoom.extends(TLORMEngine.Components.Component);


