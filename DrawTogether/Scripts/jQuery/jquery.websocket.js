(function($) {
	var socket;
	$.websocket = function(options, callback) {
		if ($.isPlainObject(options)) {
			if (socket.readyState == WebSocket.OPEN) {
				socket.send(JSON.stringify(options));
			} else {
				$.alert({
					content: '发送失败: ',
					style: 'danger'
				});
			}
		} else {
			socket = new WebSocket('ws://' + location.host + '/api/DTcore');
			socket.onopen = function() {
				$.alert({
					content: '连接成功',
					style: 'success'
				});
				$.websocket({
					type: 4,
					id: $('#userInfo').attr('data-userid')
				});
			}
			var str = "";
			socket.onmessage = function(event) {
				var srcStr = event.data;
				var lastChar = srcStr.substr(srcStr.length - 1, 1);
				str += srcStr;
				if (lastChar == '}') {
					callback($.parseJSON(str));
					str = "";
				}
			}
			socket.onclose = function() {
				$.alert({
					content: '连接关闭',
					style: 'danger'
				});
			}
			socket.onerror = function(event) {
				$.alert({
					title: 'WebSocket错误！',
					content: event.data,
					style: 'danger'
				});
			}
		}
	}
	$(window).unload(function() {
		socket.close();
	});
})(jQuery);