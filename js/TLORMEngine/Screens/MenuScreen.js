// DEPENDENCY: Screen.js

TLORMEngine.Screens.MenuScreen = function(args) {
	TLORMEngine.Screens.Screen.call(this, args);

	// setup gui elements
	this.container_el.appendChild(this.buildMenuList());
}

// inherit from normal screen
TLORMEngine.Screens.MenuScreen.extends(TLORMEngine.Screens.Screen);

TLORMEngine.Screens.MenuScreen.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		options: { type: "object", title: "Settings" },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};


TLORMEngine.Screens.MenuScreen.prototype.buildMenuList = function() {
	var list = document.createElement("ul");
	for (var option in this.options) {
		var list_item = this.buildMenuListItem(option);
		list.appendChild(list_item);
	}

	return list;
};

TLORMEngine.Screens.MenuScreen.prototype.buildMenuListItem = function(option) {
	var list_item = document.createElement("li");
	var link = document.createElement("a");
	link.href = "#";
	list_item.appendChild(link);
	link.appendChild(document.createTextNode(option));

	var menu_screen = this;
	link.addEventListener("click", function(event) {
		menu_screen.optionSelected(option);
		return false;
	});
	
	return list_item;
};

TLORMEngine.Screens.MenuScreen.prototype.optionSelected = function(option) {
	if (this.options[option]) {
		if (this.options[option].goto) {
			this.setChange(this.options[option].goto, this.options[option].reset);
		}
	}
};