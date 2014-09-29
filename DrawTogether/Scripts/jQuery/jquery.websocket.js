(function($) {
	var socket;
	$.websocket = function(options, callback) {
		if ($.isPlainObject(options)) {
			if (socket.readyState == WebSocket.OPEN) {
				socket.send(JSON.stringify(options));
			} else {
				$.alert('发送失败');
			}
		} else {
			socket = new WebSocket('ws://' + location.host + '/api/DTcore');
			socket.onopen = function() {
				$.alert('连接成功');
			}
			var str = "";
			socket.onmessage = function(event) {
				// var srcStr = event.data;
				// var lastChar = srcStr.substr(srcStr.length - 1, 1);
				// if(lastChar!='\"'){
				// 	str
				// }
				// if (event.data.)
				console.log(event.data);
				callback($.parseJSON(event.data));
			}
			socket.onclose = function() {
				$.alert('连接关闭');
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