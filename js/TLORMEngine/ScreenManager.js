TLORMEngine.ScreenManager = function(args) {
	this.next_id = 1;
	this.screens = [];
	this.screens_by_id = {};
	this.screens_by_name = {};
	this.current_screen = null;
	this.width = args.width;
	this.height = args.height;
	this.entity_manager = args.entity_manager;
	this.condition_manager = args.condition_manager;
	this.resource_manager = args.resource_manager;
	this.game = args.game;
	this.screens_visited = [];
};


TLORMEngine.ScreenManager.prototype.addScreen = function(screen) {
	if (screen.id) {
		return;
	}
	screen.id = this.next_id++;
	this.screens.push(screen);
	this.screens_by_id[screen.id] = screen;
	this.screens_by_name[screen.name] = screen;

	screen.setSize(this.width, this.height);
	screen.setEntityManager(this.entity_manager);
	screen.setConditionManager(this.condition_manager);
	screen.setResourceManager(this.resource_manager);
	screen.setGame(this.game);
};

TLORMEngine.ScreenManager.prototype.setCurrentScreen = function(screen) {
	this.addScreen(screen);
	this.current_screen = screen;
	this.screens_visited.push(this.current_screen.name);
};

TLORMEngine.ScreenManager.prototype.getGameScreen = function() {
	for (var i=0; i<this.screens.length; ++i) {
		if (this.screens[i] instanceof TLORMEngine.Screens.GameScreen) {
			return this.screens[i];
		}
	};
};

TLORMEngine.ScreenManager.prototype.init = function(game) {
	if (!this.current_screen) {
		this.current_screen = this.screens[0];
	}
	this.current_screen.init(game);
};

TLORMEngine.ScreenManager.prototype.update = function(game, delta) {
	var change = this.current_screen.needsChange();
	if (change) {
		var old_screen = this.current_screen;
		var reset = old_screen.needsReset();
		old_screen.clearChange();
		old_screen.cleanUp();

		// TODO: remove this horrible text check
		if (change == "TLORM_BACK") {
			this.screens_visited.pop();
			change = this.screens_visited.pop();
		}

		this.setCurrentScreen(this.screens_by_name[change]);
		this.current_screen.init(game, reset);
	}
	this.current_screen.update(game, delta);
};

TLORMEngine.ScreenManager.prototype.render = function(game, context) {
	this.current_screen.render(game, context);
};