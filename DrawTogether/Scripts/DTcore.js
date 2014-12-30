(function() {
	//json.type的枚举
	var ProtJsonTypeEnum = {
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
	//鼠标移动时的绘图状态
	var ProtMouseStatusEnum = {
		Draw: 0,
		Erase: 1
	};
	//笔触样式
	var DrawingStyle = {
		color: '#000000',
		thickness: 2,
		mouseStatus: ProtMouseStatusEnum.Draw
	};
	//坐标类
	var Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	var DrawingHandler = {
		DrawLine: function(ctx, oldPt, oldMidPt, midPt, style) {
			ctx.beginPath();
			ctx.lineWidth = style.thickness;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = style.color;
			ctx.moveTo(midPt.x, midPt.y);
			ctx.quadraticCurveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
			ctx.stroke();
		},
		DrawPoint: function(ctx, point, style) {
			ctx.beginPath();
			ctx.fillStyle = style.color;
			ctx.arc(point.x, point.y, style.thickness / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
		},
		Erase: function(ctx, point, style) {
			// ctx.save();
			// ctx.beginPath();
			// ctx.arc(point.x, point.y, style.thickness + 5, 0, Math.PI * 2);
			// ctx.clip();
			// ctx.clearRect(point.x - 50, point.y - 50, 100, 100);
			// ctx.restore();
			var t = style.thickness;
			ctx.clearRect(point.x - t / 2, point.y - t / 2, t, t);
		}
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
			var point = json.oldPt;
			var style = json.drawingStyle;
			var ctx = user.context;

			switch (json.drawingStyle.mouseStatus) {
				case ProtMouseStatusEnum.Draw:
					DrawingHandler.DrawPoint(ctx, point, style);
					break;
				case ProtMouseStatusEnum.Erase:
					DrawingHandler.Erase(ctx, point, style);
					break;
			}
		},
		//关于鼠标信息接受时触发
		MouseMoveReceived: function(json) {
			var user = this._findUser(json);
			var midPt = json.midPt;
			var oldPt = json.oldPt;
			var oldMidPt = json.oldMidPt;
			var style = json.drawingStyle;
			var ctx = user.context;

			switch (json.drawingStyle.mouseStatus) {
				case ProtMouseStatusEnum.Draw:
					DrawingHandler.DrawLine(ctx, oldPt, oldMidPt, midPt, style);
					break;
				case ProtMouseStatusEnum.Erase:
					DrawingHandler.Erase(ctx, oldPt, style);
					break;
			}
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

			var $canvas, canvas, ctx;

			$canvas = $('#canvas');
			canvas = this.User.canvas = $canvas[0];
			ctx = this.User.context = canvas.getContext('2d');
			canvas.height = this.canvasHeight;
			canvas.width = this.canvasWidth;

			$canvas.on('mousedown', function(event) {
				var newPoint = new Point(event.pageX - $canvas.offset().left, event.pageY - $canvas.offset().top);
				handleMouseDown(newPoint);
			});

			var oldPt, oldMidPt;

			function handleMouseDown(point) {
				oldMidPt = oldPt = point;

				switch (DrawingStyle.mouseStatus) {
					case ProtMouseStatusEnum.Draw:
						DrawingHandler.DrawPoint(ctx, point, DrawingStyle);
						break;
					case ProtMouseStatusEnum.Erase:
						DrawingHandler.Erase(ctx, point, DrawingStyle)
						break;
				}

				$canvas.on('mousemove', function(event) {
					var newPoint = new Point(event.pageX - $canvas.offset().left, event.pageY - $canvas.offset().top);
					switch (DrawingStyle.mouseStatus) {
						case ProtMouseStatusEnum.Draw:
							handleMouseMove_Draw(newPoint);
							break;
						case ProtMouseStatusEnum.Erase:
							handleMouseMove_Erase(newPoint);
							break;
					}
				});
				$(document).one('mouseup', handleMouseUp);
				$.websocket({
					type: ProtJsonTypeEnum.MouseDown,
					oldPt: point,
					drawingStyle: DrawingStyle
				});
			}

			function handleMouseMove_Draw(point) {
				var midPt = new Point(oldPt.x + point.x >> 1, oldPt.y + point.y >> 1);
				DrawingHandler.DrawLine(ctx, oldPt, oldMidPt, midPt, DrawingStyle);

				$.websocket({
					type: ProtJsonTypeEnum.MouseMove,
					midPt: midPt,
					oldPt: oldPt,
					oldMidPt: oldMidPt,
					drawingStyle: DrawingStyle
				});

				oldPt = point;
				oldMidPt = midPt;
			}

			function handleMouseMove_Erase(point) {
				DrawingHandler.Erase(ctx, point, DrawingStyle);

				$.websocket({
					type: ProtJsonTypeEnum.MouseMove,
					oldPt: point,
					drawingStyle: DrawingStyle
				});
			}

			function handleMouseUp(event) {
				$canvas.off('mousemove');
				$.websocket({
					type: ProtJsonTypeEnum.MouseUp,
				});
			}

			$('#colorPicker').colpick({
				color: '000000',
				submitText: '取色',
				onSubmit: function(hsb, hex, rgb, el) {
					$(el).find('span').css('background-color', '#' + hex);
					$(el).colpickHide();
					DrawingStyle.color = '#' + hex;
				},
				onShow: function() {
					var $colpick = $('.colpick');
					$colpick.css('top', parseInt($colpick.css('top')) - 170 + 'px');
				}
			});

			$('#statusDraw').click(function() {
				var $this = $(this);
				if (!$this.hasClass('active')) {
					$this.addClass('active');
					DrawingStyle.mouseStatus = ProtMouseStatusEnum.Draw;
					$('#statusErase').removeClass('active');
				}
			});
			$('#statusErase').click(function() {
				var $this = $(this);
				if (!$this.hasClass('active')) {
					$this.addClass('active');
					DrawingStyle.mouseStatus = ProtMouseStatusEnum.Erase;
					$('#statusDraw').removeClass('active');
				}
			});
			$('.btn-thickness').click(function() {
				DrawingStyle.thickness = $(this).attr('data-thickness');
				$('.btn-thickness').removeClass('active');
				$(this).addClass('active');
			}).find('span').css('height', function() {
				return $(this).parent().attr('data-thickness') + 'px';
			});

			$('#clearShape').click(function(event) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			});
			$('#saveCanvas').click(function() {
				$.websocket({
					type: ProtJsonTypeEnum.ImgBinary,
					imgBinary: canvas.toDataURL()
				});
			});
			$(document).keydown(function(event) {
				if (event.shiftKey && event.which == 107) {
					DrawingStyle.thickness++;
				} else if (event.shiftKey && event.which == 109) {
					DrawingStyle.thickness--;
				}

				if (DrawingStyle.thickness <= 0) {
					DrawingStyle.thickness = 1;
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
				// console.log(json);
				switch (json.type) {
					case ProtJsonTypeEnum.Error:
						$.alert({
							content: json.errorInfo,
							type: 'danger'
						});
						break;
					case ProtJsonTypeEnum.MouseDown:
						UserCanvasManager.MouseDownReceived(json);
						break;
					case ProtJsonTypeEnum.MouseMove:
						UserCanvasManager.MouseMoveReceived(json);
						break;
					case ProtJsonTypeEnum.ImgBinary:
						UserCanvasManager.ImgBinaryReceived(json);
						break;
					case ProtJsonTypeEnum.RequestImgBinary:
						$.websocket({
							type: ProtJsonTypeEnum.ImgBinary,
							imgBinary: UserCanvasManager.User.canvas.toDataURL()
						});
						break;
					case ProtJsonTypeEnum.UserList:
						var userId = $userList.children(':eq(1)').attr('data-userid');
						$userList.children(':gt(1)').remove();
						$.each(json.userInfoList, function(index, val) {
							if (val.id != userId) {
								$userList.append(createUserListItem(val.name, val.id, val.email));
								UserCanvasManager.CreateUserCanvas(val.id, val.name);
							}
						});
						break;
					case ProtJsonTypeEnum.Signin:
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
					case ProtJsonTypeEnum.SigninSucceed:
						$.alert();
					case ProtJsonTypeEnum.Signout:
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
					type: ProtJsonTypeEnum.Signin,
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