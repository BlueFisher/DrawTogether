var stage;

$(document).ready(function() {
	$.websocket();
	stage = new createjs.Stage("canvas");
	var shape = new createjs.Shape();
	stage.addChild(shape);
	var x, y;
	createjs.Ticker.setFPS(30);
	stage.addEventListener('stagemousemove', function(e) {
		if (e.nativeEvent.which === 1) {
			shape.graphics.beginStroke('black').moveTo(x, y).lineTo(stage.mouseX, stage.mouseY);
			x = stage.mouseX;
			y = stage.mouseY;
			stage.update();
		}
	});
	stage.addEventListener('stagemousedown', function() {
		x = stage.mouseX;
		y = stage.mouseY;
	});
});

$(window).on('load resize', function() {
	var $container = $('.canvas-container');
	var canvas = $('#canvas')[0];
	canvas.height = $container.height();
	canvas.width = $container.width();
	stage.update();
});