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
			width: '500px'
		})
	);
});
$.alert = function(options, style) {
	var alertOptions = {
		title: '提示！',
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

	var $alert = $('<div>').addClass('alert alert-' + alertOptions.style + ' fade in');
	$alert.append('<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>');
	$alert.append('<p><strong>' + alertOptions.title + '</strong> ' + alertOptions.content + '</p>');
	if (alertOptions.type == "confirm") {
		$alert.append('<p><button class="btn btn-danger btn-sm">确定</button> <button class="btn btn-default btn-sm">取消</button></p>');
		$alert.find('.btn-danger').click(function() {
			$alert.alert('close');
			alertOptions.callback(true);
		});
		$alert.find('.btn-default').click(function() {
			$alert.alert('close');
			alertOptions.callback(false);
		});
	}
	$('.alert-container').append($alert);
	var timeout = setTimeout(function() {
		$alert.alert('close');
		clearTimeout(timeout);
	}, alertOptions.cleartime);
}