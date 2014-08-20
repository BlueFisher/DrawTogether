(function($) {
	var socket = null;
	$.websocket = function(options, callback) {
		if ($.isPlainObject(options)) {
			if (socket.readyState == WebSocket.OPEN) {
				var sendData = {
					'date': d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
					'time': d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
				}
				sendData = $.extend(sendData, options);
				socket.send(JSON.stringify(sendData));
			}else{
				$.alert('发送失败');
			}
		} else {
			switch (options) {
				case 'connect':
					{
						socket = new WebSocket('ws://' + location.host + '/api/WSChat');
						$.alert('正在连接...');
						socket.onopen = function(event) {
							$.alert('连接成功');
						}
						socket.onmessage = function(event) {
							callback(event.data);
						}
						socket.onclose = function(event) {
							$.alert('连接关闭');
						}
					}
				case 'disconnect':
					{
						socket.close();
					}
			}
		}
	}
})(jQuery);