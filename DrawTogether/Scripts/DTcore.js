(function() {
	//json.type的枚举
	var ProtJsonType = {
		MouseUp: 0,
		MouseDown: 1,
		MouseMove: 2,
		ImgBinary: 3,
		RequestImgBinary: 4,
		UserList: 5,
		Signin: 6,
		SigninSucceed: 7,
		Signout: 8,
		Error: 9
	};
	//笔触样式
	var penProperty = {
		color: '#000000',
		thickness: 1,
	};
	//坐标类
	var Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	//所有用户管理类
	var UserCanvasManager = {
		canvasWidth: screen.availWidth - 80 - 200,
		canvasHeight: screen.availHeight,
		//所有好友集合
		_users: [],
		User: {
			id: null,
			name: null,
			canvas: null,
			context: null
		},
		//好友上线时新建画布
		CreateUserCanvas: function(id, name) {
			var $newCanvas = $('<canvas class="user-canvas"></canvas>')
				.attr('data-userid', id)
				.attr('data-name', name);
			$(this.User.canvas).before($newCanvas);
			$newCanvas[0].height = this.canvasHeight;
			$newCanvas[0].width = this.canvasWidth;
			this._users.push({
				id: id,
				name: name,
				canvas: $newCanvas[0],
				context: $newCanvas[0].getContext('2d')
			});
		},
		//好友下线时删除画布
		RemoveUserCanvas: function(json) {
			this.Traverse(function(i, user) {
				if (user.id == json.id && user.name == json.name) {
					UserCanvasManager._users.splice(i, 1);
					$(UserCanvasManager.User.canvas).prev('[data-userid="' + user.id + '"]').remove();
				}
			});
		},
		//遍历_users集合
		Traverse: function(fun) {
			$.each(this._users, function(index, val) {
				fun(index, val);
			});
		},
		//根据json.id, json.name找到_users集合中的_users
		_findUser: function(json) {
			if (json.id == this.User.id) {
				return this.User;
			}
			var returnUser;
			this.Traverse(function(i, user) {
				if (user.id == json.id && user.name == json.name) {
					returnUser = user;
					return;
				}
			});
			return returnUser;
		},
		MouseDownReceived: function(json) {
			var user = this._findUser(json);
			var ctx = user.context;
			ctx.beginPath();
			ctx.fillStyle = json.penProperty.color;
			ctx.arc(json.oldPt.x, json.oldPt.y, json.penProperty.thickness / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
		},
		//关于鼠标信息接受时触发
		MouseMoveReceived: function(json) {
			var user = this._findUser(json);
			var midPt = json.midPt;
			var oldPt = json.oldPt;
			var oldMidPt = json.oldMidPt;

			var ctx = user.context;
			ctx.beginPath();
			ctx.lineWidth = json.penProperty.thickness;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = json.penProperty.color;
			ctx.moveTo(midPt.x, midPt.y);
			ctx.quadraticCurveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
			ctx.stroke();
		},
		//关于图片二进制接受时触发
		ImgBinaryReceived: function(json) {
			var user = this._findUser(json);
			user.context.clearRect(0, 0, this.User.canvas.width, this.User.canvas.height);
			var img = new Image();
			img.src = json.imgBinary
			user.context.drawImage(img, 0, 0);
		},
		//初始化当前用户
		Initalize: function() {
			var $userInfo = $('#userInfo');
			this.User.id = $userInfo.attr('data-userid');
			this.User.name = $userInfo.text();

			var canvas, ctx;

			canvas = this.User.canvas = $('#canvas')[0];
			ctx = this.User.context = canvas.getContext('2d');
			canvas.height = this.canvasHeight;
			canvas.width = this.canvasWidth;

			$(canvas).on('mousedown', function(event) {
				handleMouseDown(new Point(event.pageX - $(canvas).offset().left,
					event.pageY - $(canvas).offset().top));
			});
			var oldPt, oldMidPt;

			function handleMouseDown(e) {
				oldPt = new Point(e.x, e.y);
				oldMidPt = oldPt;
				ctx.beginPath()
				ctx.fillStyle = penProperty.color;
				ctx.arc(e.x, e.y, penProperty.thickness / 2, 0, Math.PI * 2);
				ctx.closePath();
				ctx.fill();
				$(canvas).on('mousemove', function(event) {
					handleMouseMove(new Point(event.pageX - $(canvas).offset().left,
						event.pageY - $(canvas).offset().top));
				});
				$(document).one('mouseup', handleMouseUp);
				$.websocket({
					type: ProtJsonType.MouseDown,
					oldPt: oldPt,
					penProperty: penProperty
				});
			}

			function handleMouseMove(e) {
				var midPt = new Point(oldPt.x + e.x >> 1, oldPt.y + e.y >> 1);
				ctx.beginPath();
				ctx.lineWidth = penProperty.thickness;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.strokeStyle = penProperty.color;
				ctx.moveTo(midPt.x, midPt.y);
				ctx.quadraticCurveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
				ctx.stroke();

				$.websocket({
					type: ProtJsonType.MouseMove,
					midPt: midPt,
					oldPt: oldPt,
					oldMidPt: oldMidPt,
					penProperty: penProperty
				});

				oldPt.x = e.x;
				oldPt.y = e.y;
				oldMidPt.x = midPt.x;
				oldMidPt.y = midPt.y;
			}

			function handleMouseUp(event) {
				$(canvas).off('mousemove');
				$.websocket({
					type: ProtJsonType.MouseUp,
				});
			}

			$('#clearShape').click(function(event) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			});
			$('#colorPicker').colpick({
				color: '000000',
				submitText: '取色',
				onSubmit: function(hsb, hex, rgb, el) {
					$(el).find('span').css('background-color', '#' + hex);
					$(el).colpickHide();
					penProperty.color = '#' + hex;
				}
			});

			$('.pen-thickness').click(function() {
				$('.pen-thickness').removeClass('active');
				$(this).toggleClass('active');
				penProperty.thickness = $(this).attr('data-property');
			});
			$('#saveCanvas').click(function() {
				$.websocket({
					type: ProtJsonType.ImgBinary,
					imgBinary: canvas.toDataURL()
				});
			});
			$('#thicknessPicker').scrollbar({
				onChange: function(val) {
					penProperty.thickness = val;
				}
			});

		}
	}

	//初始化WebSocket
	var initWebSocket = function() {
		function createUserListItem(name, id, email) {
			return $('<a href="javascript:;" class="list-group-item">')
				.text(name)
				.attr('data-userid', id)
				.attr('data-email', email)
		}
		var $userList = $('.slide-user-list .list-group');
		$.websocket('connect', {
			onMessage: function(json) {
				console.log(json);
				switch (json.type) {
					case ProtJsonType.Error:
						$.alert({
							content: json.errorInfo,
							type: 'danger'
						});
						break;
					case ProtJsonType.MouseDown:
						UserCanvasManager.MouseDownReceived(json);
						break;
					case ProtJsonType.MouseMove:
						UserCanvasManager.MouseMoveReceived(json);
						break;
					case ProtJsonType.ImgBinary:
						UserCanvasManager.ImgBinaryReceived(json);
						break;
					case ProtJsonType.RequestImgBinary:
						$.websocket({
							type: ProtJsonType.ImgBinary,
							imgBinary: UserCanvasManager.User.canvas.toDataURL()
						});
						break;
					case ProtJsonType.UserList:
						var userId = $userList.children(':eq(1)').attr('data-userid');
						$userList.children(':gt(1)').remove();
						$.each(json.userInfoList, function(index, val) {
							if (val.id != userId) {
								$userList.append(createUserListItem(val.name, val.id, val.email));
								UserCanvasManager.CreateUserCanvas(val.id, val.name);
							}
						});
						break;
					case ProtJsonType.Signin:
						var $items = $userList.children(':gt(1)');
						var isInserted = false;
						$items.each(function(index, el) {
							if (json.id < $(el).attr('data-userid')) {
								$(el).before(createUserListItem(json.name, json.id, json.email));
								isInserted = true;
							}
						});
						if (!isInserted) {
							$userList.append(createUserListItem(json.name, json.id, json.email));
						}
						UserCanvasManager.CreateUserCanvas(json.id, json.name);
						break;
					case ProtJsonType.SigninSucceed:
						$.alert()
					case ProtJsonType.Signout:
						var $items = $userList.children(':gt(1)');
						$items.each(function(index, el) {
							if (json.id == $(el).attr('data-userid')) {
								$(el).remove();
								UserCanvasManager.RemoveUserCanvas(json);
							}
						});
						break;

				}
			},
			onOpen: function() {
				//发送登录信息
				$.websocket({
					type: ProtJsonType.Signin,
					id: UserCanvasManager.User.id
				});
			}
		});
	};

	$(document).ready(function() {
		//初始化
		UserCanvasManager.Initalize();
		initWebSocket();
	});
})();