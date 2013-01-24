#!/bin/bash

GAME_NAME=$1
CURRENT_DIR=${PWD##*/}

if [ "$CURRENT_DIR" != "Games" ]
then
	echo "Please run from in the 'Games' folder."
	exit
fi

if [ "$GAME_NAME" == "" ]
then
	echo "Usage: build_game.sh [game_name]"
	exit
fi

echo "Setting up game '$GAME_NAME'"

mkdir $GAME_NAME
cd $GAME_NAME
mkdir Component QuickEntity System

# JS template
echo "
window.onload = function() {
	setup_game();
};

function setup_game() {
	var canvas = document.getElementById(\"tlorm_game_canvas\");
	var game = new TLORM.Game(\"$GAME_NAME\", canvas);
	
	/* Setup entities */
	
	/* Setup systems */
	
	/* start the game */
	game.start();
};
" > main.js

# HTML template
echo "
<html>
	<head>
		<title>$GAME_NAME</title>
		<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0\" />
		<style>
			body, canvas {
				margin: 0;
				padding: 0;
				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				-o-user-select: none;
				user-select: none;
				-webkit-tap-highlight-color: rgba(0,0,0,0);
			}
		</style>
		
		<!-- From engine -->
		<script type=\"text/javascript\" src=\"../../src/TLORM.js\"></script>
		    
		<!-- Custom -->
		<script type=\"text/javascript\" src=\"$GAME_NAME.js\"></script>
	</head>
	<body>
		<canvas id=\"tlorm_game_canvas\"></canvas>
	</body>
</html>
" > $GAME_NAME.html

# run script to setup JS
../../src/game_combiner.sh $GAME_NAME.js &> /dev/null

echo "Setup game '$GAME_NAME'"
