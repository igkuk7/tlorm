TLORMEngine.Game = function(args) {

	// setup incoming args
	this.name = args.name || "Default Game";
	this.screen_ratio = args.screen_ratio || (9 / 16);
	this.width = args.width || 300;
	this.height = args.height || (this.width * this.screen_ratio);
	if (args.full_screen && args.full_screen.toString() == "true") {
		this.full_screen = true;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	} else {
		this.full_screen = false;
	}

	// setup requestAnimationFrame
	this.running = false;
	this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	// setup HTML and make it redo HTML on resize
	this.setupHTML();
	//var game = this;
	//window.onresize = function() { this.screen_manager.current_screen.init(); };

	// setup managers
	this.entity_manager    = new TLORMEngine.EntityManager();
	this.condition_manager = new TLORMEngine.ConditionManager();
	this.resource_manager  = new TLORMEngine.ResourceManager();
	this.screen_manager    = new TLORMEngine.ScreenManager({
		width: this.width,
		height: this.height,
		entity_manager: this.entity_manager,
		condition_manager: this.condition_manager,
		resource_manager: this.resource_manager,
		game: this,
	});

	// check for event handlers
	this.onstart = args.onstart;
	this.onupdate = args.onupdate;
	
	// seed random numbers
	var seed = this.getParam('seed');
	Math.seedrandom(seed);

	// place to store options
	this.options = {};

	// setup viewport for mobiles so user can't drag the page or zoom
	var viewport = document.createElement("meta");
	viewport.name = "viewport";
	viewport.content = "initial-scale=1, maximum-scale=1, user-scalable=no";
	document.getElementsByTagName("head")[0].appendChild(viewport);

	// this stops drag scrolling
	document.ontouchmove = function(event) { event.preventDefault(); }
};

TLORMEngine.Game.prototype.setOption = function(option, value) {
	this.options[option] = value;
};

TLORMEngine.Game.prototype.getOption = function(option) {
	return this.options[option];
};

TLORMEngine.Game.prototype.setupHTML = function() {

	// set page title
	this.setTitle(this.name);

	// empty page
	document.body.innerHTML = "";
};

TLORMEngine.Game.prototype.setTitle = function(title) {
	document.title = title;
};

TLORMEngine.Game.prototype.start = function() {
	if (!this.resource_manager.allLoaded()) {
		var game = this;
		setTimeout(function() { game.start(); }, 50);
		return;
	}

	this.init();

	if (this.onstart) {
		this.onstart();
	}

	this.running = true;
	this.render_count = 0;
	this.last_update_time = new Date().getTime();
	this.last_second_time = new Date().getTime();
	this.loop();
};

TLORMEngine.Game.prototype.stop = function() {
	this.running = false;
};

TLORMEngine.Game.prototype.getParam = function(incoming_param) {
	if (!this.params) {
		this.params = {};
		if (location.search) {
			var params = location.search.substring(1).split('&');
			for (var i = 0; i < params.length; i++) {
				var param = params[i].split('=');
				this.params[param[0]] = param[1];
			}
		}
	}
	return this.params[incoming_param];
};

TLORMEngine.Game.prototype.init = function() {
	this.screen_manager.init(this);
	this.entity_manager.initAllEntities(true);
};

TLORMEngine.Game.prototype.loop = function() {
	if (this.running) {

		// update with time since last update
		var delta = new Date().getTime() - this.last_update_time;
		this.update(delta/1000.0);
		this.last_update_time += delta;

		// render
		this.render();
		this.render_count += 1;

		// every second update ups/fps and reset counters
		delta = new Date().getTime() - this.last_second_time;
		if (delta >= 1000) {
			this.setTitle(this.render_count + " fps   |   " + this.name);
			this.update_count = 0;
			this.render_count = 0;
			this.last_second_time += delta;
		}

		// make it loo
		var game = this;
		if (this.requestAnimationFrame) {
			// loop requestAnimationFrame, must be called on window
			// see: http://stackoverflow.com/a/9678166/41468
			this.requestAnimationFrame.call(window, function() { game.loop(); });
		} else {
			// no request frame animation, just use set timeout with update time */
			setTimeout(function() { game.loop(); }, this.update_time);
		}
	}
};

TLORMEngine.Game.prototype.update = function(delta) {
	this.screen_manager.update(this, delta);
	this.entity_manager.update(this);
	if (this.onupdate) {
		this.onupdate();
	}
};

TLORMEngine.Game.prototype.render = function() {
	this.screen_manager.render(this);
};

// function takes in json_file name, loads it,
// and parses uit to make a game which
TLORMEngine.GameFromJSON = function(json_file) {
	var game_settings = TLORMEngine.Utils.get_json(json_file);
	if (game_settings == null) {
		TLORMEngine.Utils.error("Did not game setting from JSON file '"+json_file+"''", true);
	}

	return this.GameFromJSONObject(game_settings);
}

// function takes in json object, loads it,
// and parses uit to make a game which
TLORMEngine.GameFromJSONObject = function(game_settings) {
	// validate it
	//TLORMEngine.GameConfig.validate(game_settings);
	
	// setup game
	var game_args = game_settings.args || {};
	game_args.name = game_settings.name;
	game_args.width = game_settings.width;
	game_args.height = game_settings.height;
	var game = new TLORMEngine.Game(game_args);

	// setup game options
	var game_options = game_settings.options || {};
	for (var name in game_options) {
		game.setOption(name, game_options[name]);
	}

	// load sounds
	var sounds = game_settings.sounds || [];
	for (var i=0; i<sounds.length; ++i) {
		game.resource_manager.loadSound(sounds[i]);
	}
	
	// setup screens
	var screens = game_settings.screens || [];
	for (var i=0; i<screens.length; ++i) {
		var args = screens[i].args || {};
		args.name = screens[i].name;
		if (!TLORMEngine.Screens[screens[i].type]) {
			TLORMEngine.Utils.error("Unknown Screen Type '"+screens[i].type+"'");
		}
		if (screens[i].current_screen) {
			game.screen_manager.setCurrentScreen(new TLORMEngine.Screens[screens[i].type](args));
		} else {
			game.screen_manager.addScreen(new TLORMEngine.Screens[screens[i].type](args));
		}
	}

	// setup conditions
	var conditions = game_settings.conditions || [];
	for (var i=0; i<conditions.length; ++i) {
		var args = conditions[i].args || {};
		args.name = conditions[i].name;
		var condition = new TLORMEngine.Conditions.Condition(args);
		game.condition_manager.addCondition(condition);
	}
	
	// setup entities
	var entities = game_settings.entities || [];
	for (var i=0; i<entities.length; ++i) {
		var entity_components = entities[i].components || [];
		var components = [];
		for (var j=0; j<entity_components.length; ++j) {
			if (TLORMEngine.Components[entity_components[j].type]) {
				components.push(new TLORMEngine.Components[entity_components[j].type](entity_components[j].args || {}));
			}
		}

		var entity_type = entities[i].type || "Entity";
		var entity_args = entities[i].args || {};
		entity_args.name = entities[i].name;
		entity_args.game = game;
		entity_args.components = components;
		entity_args.screens = entities[i].screens;

		var entity = new TLORMEngine.Entities[entity_type](entity_args);
		game.entity_manager.addEntity(entity);
	}
	
	return game;
};
