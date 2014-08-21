(function($) {
	$.websocket = function(options, callback) {
		var socket;
		if ($.isPlainObject(options)) {
			if (socket.readyState == WebSocket.OPEN) {
				var sendData = {
					'date': d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
					'time': d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
				}
				sendData = $.extend(sendData, options);
				socket.send(JSON.stringify(sendData));
			} else {
				$.alert('发送失败');
			}
		} else {
			socket = new WebSocket('ws://' + location.host + '/api/DTcore');
			socket.onopen = function() {
				$.alert('连接成功');
			}
			socket.onmessage = function(event) {
				callback(event.data);
			}
			socket.onclose = function() {
				$.alert('连接关闭');
			}
			socket.onerror = function(event) {
				$.alert({
					title: 'WebSocket错误！',
					content: event,
					style: 'danger'
				});
			}
		}
	}
	$(window).unload(function() {
		socket.close();
	});
})(jQuery);