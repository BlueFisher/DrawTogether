$(document).ready(function() {
	$.websocket('connect');
});

$(window).on('load resize', function() {
	var $container = $('.canvas-container');
	var $canvas = $('#canvas');
	$canvas.height($container.height());
	$canvas.width($container.width());
});

$(window).unload(function() {
	$.closeWebSocket();
});