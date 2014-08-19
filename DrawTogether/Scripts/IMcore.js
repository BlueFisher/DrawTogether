// var socket;

// function addReceive(message) {
// 	console.log(message);
// 	switch(message.type){
// 		case "message": default:{
// 			var node = document.createElement("div");
// 			node.className = "receiver";
// 			node.innerHTML = "[" + message.date + " " + message.time + "] " + message.username + "<br/>" + message.message;
// 			var IMwindow = document.getElementById("message_frame");
// 			IMwindow.appendChild(node);
// 			IMwindow.scrollTop = IMwindow.scrollHeight;
// 			break;
// 		}
// 		case "online": {
// 			var user_list = document.getElementById("user_list").getElementsByTagName("ul")[0];
// 			user_list.innerHTML += "<li>" + message.username + "</li>";
// 			break;
// 		}
// 		case "offline": {
// 			var user_list = document.getElementById("user_list").getElementsByTagName("ul")[0];
// 			var li = user_list.getElementsByTagName("li");
// 			for (var i = 0; i < li.length; i++) {
// 				if (li[i].innerText == message.username) {
// 					user_list.removeChild(li[i]);
// 				}
// 			}
// 			break;
// 		}
// 		case "userList": {
// 			var user_list = document.getElementById("user_list").getElementsByTagName("ul")[0];
// 			for(var i in message.userlist){
// 				user_list.innerHTML += "<li>" + message.userlist[i] + "</li>";
// 			}
// 			break;
// 		}
// 	}
// }

// function addSend(message) {
// 	var node = document.createElement("div");
// 	node.className = "sender";
// 	node.innerHTML = "[" + message.date + " " + message.time + "] You<br/>" + message.message;
// 	var IMwindow = document.getElementById("message_frame");
// 	IMwindow.appendChild(node);
// 	IMwindow.scrollTop = IMwindow.scrollHeight;
// }

// function connectWS() {
// 	socket = new WebSocket("ws://" + location.host + "/api/WSChat");
// 	addReceive(getMessage("正在连接"));
// 	socket.onopen = function(event) {
// 		addReceive(getMessage("连接成功"));
// 	}
// 	socket.onmessage = function(event) {
// 		addReceive(eval("(" + event.data + ")"));
// 	}
// 	socket.onclose = function(event) {
// 		addReceive(getMessage("连接关闭"));
// 	}
// }

// function sendWS() {
// 	if (socket.readyState == WebSocket.OPEN) {
// 		var message = document.getElementById("message_txt").value
// 		socket.send(JSON.stringify(getMessage(message)));
// 		addSend(getMessage(message));
// 		document.getElementById("message_txt").value = "";
// 	}
// }

// function closeWS() {
// 	socket.close();
// 	window.location = "Logout";
// }

// function keypress(e) {
// 	if (e.keyCode == 13) {
// 		sendWS();
// 	}
// }

// function getMessage(message) {
// 	/*json = {
// 			date: ,
// 			time: ,
// 			message: ,
// 	}*/
// 	var d = new Date();
// 	return {
// 		"message": message,
// 		"date": d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate(),
// 		"time": d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(),
// 		"username": ""
// 	}
// }

// window.onload = function() {
// 	connectWS();
// }
// window.onunload= function () {
// 	socket.close();
// }


$.extend({
	startWebSocket: function(){
		this.socket.connect();
	},
	sendWebSocket: function(){
		var d = new Date();
		this.socket.addSend({
			"message": $('#message').val(),
			"time": d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
		});
		this.socket.send();
	},
	closeWebSocket: function(){
		this.socket.close();
	},
	"socket": {
		socket: null,
		connect: function(){
			this.socket = new WebSocket("ws://" + location.host + "/api/WSChat");
			this.addInfo("正在连接...");
			this.socket.onopen = function(event) {
				$.socket.addInfo("连接成功");
			}
			this.socket.onmessage = function(event) {
				$.socket.MsgReceive(eval("(" + event.data + ")"));
			}
			this.socket.onclose = function(event) {
				$.socket.addInfo("连接关闭");
			}
		},
		send: function() {
			if (this.socket.readyState == WebSocket.OPEN) {
				var d = new Date();
				this.socket.send(JSON.stringify({
					"type": "message",
					"message": $("#message").val(),
					"date": d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate(),
					"time": d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
				}));
				this.addSend(getMessage(message));
			}
		},
		close: function(){
			this.socket.close();
		},
		MsgReceive: function(message){
			console.log(message);
			switch(message.type){
				case "online": {
					$('#user-list').append($('<li class="list-group-item">').text(message.username));
					break;
				}
				case "offline": {
					$('#user-list li').each(function() {
						if ($(this).text() == message.username) {
							$(this).remove();
						}
					});
					break;
				}
				case "userList": {
					$('#user-list').empty();
					for(var i in message.userlist){
						$('#user-list').append($('<li class="list-group-item">').text(message.userlist[i]));
					}
					break;
				}
				case "info": {
					this.addInfo(message.message);
					break;
				}
				case "signinAgain": {
					this.addInfo('该账户在另一个主机上登录');
					break;
				}
				case "message": {
					this.addReceive(message);
					break;
				}
			}
		},
		addReceive: function(message){
			var divMsg = $('<div>').addClass('msg-receiver').text(message.message);
			var avatar = $('<div>').addClass('avatar');
			// avatar.append($('<img>').attr('src', '~/content/image/logo.png'));
			avatar.append(message.username + ' ');
			avatar.append($('<small>').text(message.time));
			divMsg.prepend(avatar);
			$(".window").append(divMsg);
			$(".window").scrollTop($(".window").outerHeight());
		},
		addSend: function(message){
			var divMsg = $('<div>').addClass('msg-sender').text(message.message);
			var avatar = $('<div>').addClass('avatar');
			// avatar.append($('<img>').attr('src', '~/content/image/logo.png'));
			avatar.append('You ');
			avatar.append($('<small>').text(message.time));
			divMsg.prepend(avatar);
			$(".window").append(divMsg);
			$(".window").scrollTop($(".window").outerHeight());
		},
		addInfo: function(message){
			$(".window").append($('<div>').addClass('msg-info').text(message));
		}
	}
});

$(document).ready(function() {
	$.startWebSocket();
});

$(window).unload(function(){
	$.closeWebSocket();
});