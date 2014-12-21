/* 
 * alert v0.1 - 2014-08-06
 * 一个简单的基于bootstrap的错误提示框.
 *
 * Copyright 2014 Fisher Chang; MIT Licensed
 */

$(document).ready(function() {
	$('body').append($('<div class="alert-container">').css({
		position: 'fixed',
		right: 0,
		top: 0,
		zIndex: 999999,
		margin: '20px',
		width: '300px'
	}));
});
$.alert = function(options, style) {

	var alertOptions = {
		title: '',
		content: '',
		type: "alert",
		style: "warning",
		cleartime: 5000,
		callback: null
	}

	if (!$.isPlainObject(options)) {
		style = style == undefined ? 'warning' : style;
		options = {
			content: options,
			style: style,
		}
	}
	alertOptions = $.extend(alertOptions, options);

	var $alert = $('<div>').addClass('alert alert-' + alertOptions.style + ' animated flipInX');
	$alert.close = function() {
		$alert.addClass('flipOutX');
		setTimeout(function() {
			$alert.remove();
		}, 1000);
	};

	$alert.append('<button class="close">&times;</button>')
		.append('<p><strong>' + alertOptions.title + '</strong> ' + alertOptions.content + '</p>');
	if (alertOptions.type == "confirm") {
		$alert.append('<hr>')
			.append('<button id="alertYes" class="btn btn-danger">确 定</button> ')
			.append('<button id="alertNo" class="btn btn-default">取 消</button>')
		$alert.find('#alertYes').click(function() {
			$alert.close()
			alertOptions.callback(true);
		});
		$alert.find('#alertNo').click(function() {
			$alert.close()
			alertOptions.callback(false);
		});
	}
	$alert.find('button.close').click(function() {
		$alert.close();
	});
	$('.alert-container').append($alert);
	if (alertOptions.cleartime != 'infinity' && alertOptions.type != 'confirm') {
		setTimeout(function() {
			$alert.close()
		}, alertOptions.cleartime);
	}
}