(function($) {
	var socket;
	$.websocket = function(options, onMethods) {
		if ($.isPlainObject(options)) {
			if (socket == null || socket.readyState != WebSocket.OPEN) {
				// $.alert({
				// 	content: '发送失败: ',
				// 	style: 'danger'
				// });
			} else {
				socket.send(JSON.stringify(options));
			}
		} else {
			socket = new WebSocket('ws://' + location.host + '/api/DTcore');
			socket.onopen = function() {
				$.alert({
					content: '连接成功',
					style: 'success'
				});
				onMethods.onOpen();
			}
			var str = "";
			socket.onmessage = function(event) {
				var srcStr = event.data;
				var lastChar = srcStr.substr(srcStr.length - 1, 1);
				str += srcStr;
				if (lastChar == '}') {
					onMethods.onMessage($.parseJSON(str));
					str = "";
				}
			}
			socket.onclose = function() {
				$.alert({
					content: '连接关闭',
					style: 'danger'
				});
				onMethods.onClose();
			}
			socket.onerror = function(event) {
				$.alert({
					title: 'WebSocket错误！',
					content: event.data,
					style: 'danger'
				});
				onMethods.onError();
			}
		}
	}
	$(window).unload(function() {
		socket.close();
	});
})(jQuery);