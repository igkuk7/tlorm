

var common_components = {
	Position: true,
	Render2D: true,
	Collision: true,
	Velocity: true,
	Follow: true,
	KeyInput: true,
	MouseInput: true,
	TouchInput: true,
	Data: true,
	RenderData: true,
	Particles: true
};

$(document).ready(function() {

	var local_json = loadGameConfig();

	// get schema for a game config
	var tlorm_config_schema = TLORMEngine.GameConfig.schema();
	buildEntityComponentTable(tlorm_config_schema, local_json);
	return;

	// alpaca is fantastic, but cannot handle union types
	// combine union screen/component into single types with all choices
	// then fixScreenOptions below will show/hide as needed
	tlorm_config_schema = combineScreenUnionTypes(tlorm_config_schema);
	tlorm_config_schema = combineComponentUnionTypes(tlorm_config_schema);
});

function buildEntityComponentTable(schema, json) {
	// add div for import/export dialog
	var div = $("<div>").append($("<textarea>").attr("cols",80).attr("rows", 20)).hide();
	$("#entity_component_container").append(div);

	// header row of all components
	var component_objects = schema.properties.entities.items.properties.components.items.type;
	var component_types = component_objects.map(function(o) {
		return {
			type: o.properties.type.enum[0],
			args: o.properties.args.properties,
			args_schema: o.properties.args,
		};
	}).filter(function(c) { return common_components[c.type]; } ).sort( function(a,b) { return a.type.localeCompare(b.type); } );
	var component_type_headers = component_types.map(function(c) { return $("<th>").text(c.type); });

	var table_head =
		$("<thead>")
			.append($("<tr>")
				.append($("<th>"))
				.append($("<th>").attr("colspan", component_types.length).addClass("toptablelabel").text("Components"))
				.append($("<th>")))
			.append($("<tr>")
				.append($("<th>").text("Entities"))
				.append(component_type_headers)
				.append($("<th>")));

	var table_body = $("<tbody>");

	var table_foot =
		$("<tfoot>")
			.append($("<tr>")
				.append($("<td>").attr("colspan", component_types.length+2)
					.append($("<div>")
						.append($("<button>Add New Entity</button>").click(function() {
							newEntityRow(table_body,component_types);
						}))
						.append($("<button>Save</button>")
							.click(function() {
								table_body.parent().block({ message: "Saving..." });
								saveGameConfig(json);
								table_body.parent().unblock();
						}))
						.append($("<button>Import Config</button>")
							.click(function() {
								div.find("textarea").val("");
								div.dialog({
									width: "auto",
									modal: true,
									buttons: {
										"Import": function() {
											try {
												var imported_config = JSON.parse(div.find("textarea").val());
												if (imported_config) {
													json = imported_config;
													saveGameConfig(json);
													$("#entity_component_container > table").children().remove();
													buildEntityComponentTable(schema, json);
												}
											} catch(err) { }
											$(this).dialog( "close" );
										}
									}
								});
							}))
						.append($("<button>Export Config</button>")
							.click(function() {
								div.find("textarea").val(JSON.stringify(json, null, "\t"));
								div.dialog({
									width: "auto",
									modal: true,
									buttons: {
										"Close": function() {
											$(this).dialog( "close" );
										}
									}
								});
								//var display_config = JSON.stringify(json, null, "\t");
								//var url = "data:text/html;,"+encodeURI("<pre><code>"+display_config+"</code></pre>");
								//window.open(url, "_blank");
							}))
						.append($("<button>Reset to Pong</button>")
							.click(function() {
								json = pong_game_config();
								saveGameConfig(json);
								$("#entity_component_container > table").children().remove();
								buildEntityComponentTable(schema, json);
							}))
						.append($("<button>Reset to Empty</button>")
							.click(function() {
								json = empty_game_config();
								saveGameConfig(json);
								$("#entity_component_container > table").children().remove();
								buildEntityComponentTable(schema, json);
							}))
						.append($("<button>Play Game</button>")
							.click(function() {
								window.location = "play_game.html";
							})))));

	$("#entity_component_container")
		.append($("<table>").append(table_head).append(table_body).append(table_foot));

	// add rows for each entity
	for (var i=0; i<json.entities.length; ++i) {
		newEntityRow(table_body, component_types, json, json.entities[i]);
	}
}

function removeEntityRow(table_body, row) {
	row.hide("slow", function() { row.remove(); });
}

function newEntityRow(table_body, component_types, json, entity) {
	// if no entity incoming then set one up
	if (!entity) {
		entity = { name: "New Entity", components: [], not_changed: true }
		json.entities.push(entity);
	}

	table_body
		.append($("<tr>")
			.append($("<th>")
				.append($("<span>").text(entity.name ).show().click(function(e) {
					$(e.currentTarget).hide().siblings().show().select();
				}))
				.append($("<input>").val(entity.name).hide().blur(function(e) {
					entity.name = $(e.currentTarget).val();
					if (entity.name != "New Entity") {
						entity.not_changed = false;
					}
					$(e.currentTarget).hide().siblings().text(entity.name).show();
				})))
			.append(component_types.map(function(c) {
				var entity_component = null;
				for (var i=0; i<entity.components.length; ++i) {
					if (entity.components[i].type == c.type) {
						entity_component = entity.components[i];
						break;
					}
				}
				return entityComponentCell(json, entity, entity_component, c);
			}))
			.append($("<td>")
				.append($("<button>Remove</button>").click(function(e) {
					removeEntityRow(table_body, $(e.currentTarget).parents("tr"));
					for (var i=0; i<json.entities.length; ++i) {
						if (json.entities[i] == entity) {
							json.entities.splice(i, 1);
						}
					}
				})))
			.hide().show("slow"));
}

function entityComponentCell(json, entity, component, component_type) {
	var form = $("<form>");
	var alpaca_form;
	var opened = false;
	return $("<td>")
			.append($("<div>")
				.append(form))
				.prepend($("<button>").text("Collapse").hide()
					.click(function(e) {
						removeEntityComponent(entity, component_type);
						$(e.currentTarget).parent().children().hide("slow");
						$(e.currentTarget).parent().children("span").show("fast");
						e.stopPropagation();
					}))
				.prepend($("<button>").text("Remove").hide()
					.click(function(e) {
						removeEntityComponent(entity, component_type);
						saveGameConfig(json);
						$(e.currentTarget).parent().children("input").val("");
						$(e.currentTarget).parent().children().hide("slow");
						$(e.currentTarget).parent().children("span").show("fast").text('');
						e.stopPropagation();
					}))
				.prepend($("<button>").text("Save").hide()
					.click(function(e) {
						var form_component = alpaca_form.getValue();
						setEntityComponent(entity, { type: component_type.type, args: form_component });
						saveGameConfig(json);
						$(e.currentTarget).parent().children().hide("slow");
						$(e.currentTarget).parent().children("span").show("fast").text('Y');
						e.stopPropagation();
					}))
			.click(function(e) {
				if (!opened) {					
					form.alpaca({
						schema: component_type.args_schema,
						data: ( component ? component.args: null ),
						postRender: function(form) { alpaca_form = form; }
					});
					opened = true;
				}
				$(e.currentTarget).children().show("slow");
				$(e.currentTarget).parent().children("span").hide("fast");
			})
			.children().hide().parent()
			.append($("<span>").text(entityHasComponent(entity, component_type) ? 'Y' : ''));
}

function removeEntityComponent(entity, component) {
	if (component) {
		for (var i=0; i<entity.components.length; ++i) {
			if (entity.components[i].type == component.type) {
				entity.components.splice(i, 1);
				--i;
			}
		}
	}
}

function setEntityComponent(entity, component) {
	for (var i=0; i<entity.components.length; ++i) {
		if (entity.components[i].type == component.type) {
			entity.components[i] = component;
			return;
		}
	}
	entity.components.push(component);
}

function entityHasComponent(entity, component_type) {
	for (var i=0; i<entity.components.length; ++i) {
		if (entity.components[i].type == component_type.type) {
			return true;
		}
	}
	return false;
}

function saveGameConfig(config) {
	var game_config = {
		name: "Pong",
		width: 800,
		height: 600,
		screens: [ { type: "GameScreen", name: "Game", current_screen: true } ],
		entities: config.entities
	};
	localStorage.setItem("game_settings", JSON.stringify(game_config));
}



function loadGameConfig() {
	var local_json_stored = localStorage.getItem("game_settings");
	if (local_json_stored) {
		return JSON.parse(local_json_stored);
	} else {
		return empty_game_config();
	}
}

function empty_game_config() {
	return { entities: [] };
}

function pong_game_config() {
	return {
		"name": "Pong",
		"entities": [
			
			{
				"name": "Top",
				"components": [
					{ "type": "Position", "args": { "x": 0, "y": 0, "w": 800, "h": 10 } },
					{ "type": "Render2D", "args": { "fill_colour": "#000000" } },
					{ "type": "Collision", "args": { "group": "wall", "groups": [] } }
				]
			},
			{
				"name": "Bottom",
				"components": [
					{ "type": "Position", "args": { "x": 0, "y": 590, "w": 800, "h": 10 } },
					{ "type": "Render2D", "args": { "fill_colour": "#000000" } },
					{ "type": "Collision", "args": { "group": "wall", "groups": [] } }
				]
			},
			{
				"name": "Left",
				"components": [
					{ "type": "Position", "args": { "x": 0, "y": 0, "w": 10, "h": 600 } },
					{ "type": "Render2D", "args": { "fill_colour": "#000000" } },
					{ "type": "Collision", "args": { "group": "player_goal", "groups": [] } }
				]
			},
			{
				"name": "Right",
				"components": [
					{ "type": "Position", "args": { "x": 790, "y": 0, "w": 10, "h": 600 } },
					{ "type": "Render2D", "args": { "fill_colour": "#000000" } },
					{ "type": "Collision", "args": { "group": "opponent_goal", "groups": [] } }
				]
			},
			
			
			{
				"name": "Ball",
				"components": [
					{ "type": "Position", "args": { "x": 400, "y": 300, "w": 10, "h": 10 } },
					{ "type": "Render2D", "args": { "fill_colour": "#33DDBB" } },
					{ "type": "Velocity", "args": { "dx": -5, "dy": 3, "constant": true } },
					{ "type": "Collision", "args": { "group": "ball", "groups": [ "wall", "paddle"], "resolution": "bounce" } },
					{ "type": "Collision", "args": { "group": "ball", "groups": [ "paddle" ], "resolution": "edit_component", 
					                                  "component": "Velocity", "position": "all", "function": "increase", "function_args": [ 0.5, 0.5 ] } },
					{ "type": "Collision", "args": { "group": "ball", "groups": [ "player_goal" ], "resolution": "edit_component", 
					                                  "entity": "Opponent", "component": "Data", "function": "addToData", "function_args": [ "score", 1 ] } },
					{ "type": "Collision", "args": { "group": "ball", "groups": [ "opponent_goal" ], "resolution": "edit_component", 
					                                  "entity": "Player", "component": "Data", "function": "addToData", "function_args": [ "score", 1 ] } },
					{ "type": "Collision", "args": { "group": "ball", "groups": [ "player_goal", "opponent_goal" ], "resolution": "edit_component", 
					                                  "component": "Velocity", "position": "all", "function": "setRandom", "function_args": [ -5, -3, 2, 4 ] } },
					{ "type": "Collision", "args": { "group": "ball", "groups": [ "player_goal", "opponent_goal" ], "resolution": "edit_component", 
					                                  "component": "Position", "function": "moveTo", "function_args": [ 400, 300 ] } }
				]
			},

			
			{
				"name": "Player",
				"components": [
					{ "type": "Position", "args": { "x": 20, "y": 300, "w": 5, "h": 50 } },
					{ "type": "Render2D", "args": { "fill_colour": "#DDBB33" } },
					{ "type": "Collision", "args": { "group": "paddle", "groups": [ "wall"], "resolution": "push" } },
					{ "type": "MouseInput", "args": { 
						"move": { "type": "Translation", "args": { "move_middle": "true" }, "mouseYParam": "y" }
					} }, 
					{ "type": "TouchInput", "args": { 
						"drag": { "type": "Translation", "args": { "move_middle": "true" }, "mouseYParam": "y" }
					} }, 
					{ "type": "Data", "args": { "score": 0 } },
					{ "type": "RenderData", "args": { "x": 30, "y": 30 } }
				]
			},

			{
				"name": "Opponent",
				"components": [
					{ "type": "Position", "args": { "x": 780, "y": 300, "w": 5, "h": 50 } },
					{ "type": "Render2D", "args": { "fill_colour": "#DDBB33" } },
					{ "type": "Collision", "args": { "group": "paddle", "groups": [ "wall"], "resolution": "push" } },
					{ "type": "Data", "args": { "score": 0 } },
					{ "type": "RenderData", "args": { "x": 710, "y": 30 } },
					{ "type": "Follow", "args": { "entity": "Ball", "dx": 0, "dy": 5, "move_middle": true } }
				]
			}
		]
	};
}
