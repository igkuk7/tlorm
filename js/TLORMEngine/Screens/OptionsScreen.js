// DEPENDENCY: Screen.js

TLORMEngine.Screens.OptionsScreen = function(args) {
	TLORMEngine.Screens.Screen.call(this, args);

	this.options_changed = {};
}

// inherit from normal screen
TLORMEngine.Screens.OptionsScreen.extends(TLORMEngine.Screens.Screen);

TLORMEngine.Screens.OptionsScreen.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		options: { type: "object", title: "Settings" },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

// build GUI on init so we can access game and its options
TLORMEngine.Screens.OptionsScreen.prototype.init = function(game, reset) {
	TLORMEngine.Screens.Screen.prototype.init.call(this, game, reset);
	this.initSwitchScreens();

	// setup gui elements
	if (!this.gui_added) {
		this.container_el.appendChild(this.buildOptionsList(game));
		this.gui_added = true;
	}
};


TLORMEngine.Screens.OptionsScreen.prototype.buildOptionsList = function(game) {
	var list = document.createElement("ul");
	for (var option in this.options) {
		var list_item = this.buildOptionsListItem(game, option);
		list.appendChild(list_item);
	}

	return list;
};

TLORMEngine.Screens.OptionsScreen.prototype.buildOptionsListItem = function(game, option) {
	var list_item = document.createElement("li");

	var name = this.options[option].setting;
	var label = document.createElement("label");
	label.for = name;
	label.appendChild(document.createTextNode(option));
	list_item.appendChild(label);

	if (this.options[option].default) {
		game.setOption(name, this.options[option].default);
	}

	var input_item;
	if (this.options[option].flag) {
		input_item = document.createElement("input");
		input_item.type = "checkbox";
		input_item.checked = game.getOption(name);
	} else if (this.options[option].options) {
		input_item = document.createElement("select");
		for (var i=0; i<this.options[option].options.length; ++i) {
			var input_option = document.createElement("option");
			input_option.value = this.options[option].options[i];
			input_option.appendChild(document.createTextNode(input_option.value));
			input_option.selected = (game.getOption(name) == this.options[option].options[i] ? true : false);
			input_item.appendChild(input_option);
		}
	} else {
		input_item = document.createElement("input");
		input_item.type = "text";
		input_item.value = game.getOption(name);
	}

	input_item.name = name;
	input_item.id = name;
	list_item.appendChild(input_item);

	var menu_screen = this;
	list_item.addEventListener("change", function(event) {
		menu_screen.optionChanged(option);
		return false;
	});
	
	return list_item;
};

TLORMEngine.Screens.OptionsScreen.prototype.optionChanged = function(option) {
	var value;
	var input_item = document.getElementById(this.options[option].setting);
	if (this.options[option].flag) {
		value = input_item.checked;
	} else if (this.options[option].options) {
		value = input_item.options[input_item.selectedIndex].value;
	} else {
		values = input_item.value;
	}

	this.options_changed[option] = value; 
};

TLORMEngine.Screens.OptionsScreen.prototype.update = function(game, delta) {
	TLORMEngine.Screens.Screen.prototype.update.call(this, game, delta);

	var options_changed = this.options_changed;
	this.options_changed = {};
	for (var option in options_changed) {
		game.setOption(option, options_changed[option]);
	}
};