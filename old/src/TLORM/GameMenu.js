
TLORM.GameMenu = function(game, menus_def_file) {
	this.game = game;
	this.context = this.game.canvasContext();
	
	/* load the game menu definition */
	this.menus_def = game.resource_manager.loadJSON(menus_def_file);
	this.w = this.menus_def.w;
	this.h = this.menus_def.h;
	
	/* grab function to start the game */
	this.start_game = this.menus_def.game;

	/* parse the menus, add extra details needed for display */
	this.menus = {};
	for (var menu in this.menus_def.menus) {
		var menu_def = this.menus_def.menus[menu];
		this.menus[menu] = menu_def;
	}
	
	/* setup handlers to track user input */
	this.option_position = {
		x: 30,
		y: this.h/2,
		w: this.w - 60,
		h: 30,
		dh: 20,
		label_x: this.w/2,
		label_dy: 23
	};
	
	/* reset the menus */
	this.reset();
};

TLORM.GameMenu.prototype.reset = function() {
	this.current_menu = this.menus_def.start;
	this.current_option_args = [];
	this.game.setSize(this.w, this.h);
	
	var game_menu = this;
	this.game.unregisterAllEvents();
	this.game.registerEvent("click",  function(event) { game_menu.clickHandler(event); } );
	this.game.registerEvent("touch",  function(event) { game_menu.clickHandler(event); } );
};

TLORM.GameMenu.prototype.show = function() {
	if (this.current_menu == 'game') {
		/* unregister listeners */
		this.game.unregisterAllEvents();
		
		/* time to start the game */
		var args = this.current_option_args.slice();
		args.unshift(this.game);
		this.start_game.apply(this.start_game, args);
	} else {
		/* otherwise display the menu */
		this.display(this.current_menu);
		this.game.update();
	}
};

TLORM.GameMenu.prototype.display = function(menu) {
	/* draw current page and setup handlers to parse user input */
	var menu_def = this.menus[menu];
	this.context.fillStyle = menu_def.background;
	this.context.fillRect(0, 0, this.w, this.h);
	
	/* show title */
	this.context.fillStyle = '#000';
	this.context.font = '30px Arial';
	this.context.textAlign = 'center';
	this.context.fillText(menu_def.title, this.w/2, 30);
	
	/* show messages */
	this.context.font = '20px Arial';
	for (var i=0; i<menu_def.messages.length; ++i) {
		var y = 60+(30*i);
		this.context.fillText(menu_def.messages[i], this.w/2, y);
	}
	
	/* show options */
	this.context.font = '20px Arial';
	this.context.textAlign = 'center';
	this.context.strokeStyle = '#000';
	for (var i=0; i<menu_def.options.length; ++i) {
		var y = this.option_position.y+((this.option_position.h+this.option_position.dh)*i);
		this.context.fillStyle = '#ABC';
		this.context.fillRect(this.option_position.x, y, this.option_position.w, this.option_position.h);
		this.context.strokeRect(this.option_position.x, y, this.option_position.w, this.option_position.h);
		this.context.fillStyle = '#000';
		this.context.fillText(menu_def.options[i].title, this.option_position.label_x, y+this.option_position.label_dy);
	}
};

TLORM.GameMenu.prototype.clickHandler = function(event) {
	var current_options = this.menus[this.current_menu].options;
	if (   this.option_position.x <= event.offsetX && event.offsetX <= this.option_position.x + this.option_position.w
	    && this.option_position.y <= event.offsetY && event.offsetY <= this.option_position.y + ((this.option_position.h+this.option_position.dh)*current_options.length)
	) {
		var position = Math.floor((event.offsetY-this.option_position.y)/(this.option_position.h+this.option_position.dh));
		
		/* ignore the spaces between */
		if (event.offsetY <= this.option_position.y + ((this.option_position.h+this.option_position.dh)*position) + this.option_position.h) {
			this.current_menu = current_options[position].destination;
			this.current_option_args = current_options[position].args;
			this.show();
		}
	}
};

