(function() {
	var $container;

	//json.type的枚举
	var ProtJsonType = {
		MouseUp: -1,
		MouseDown: 0,
		MouseMove: 1,
		ImgBinary: 2,
		UserList: 3,
		Signin: 4,
		Signout: 5
	};
	//笔触样式
	var penProperty = {
		color: 'black',
		thickness: 5,
	};
	//所有用户管理类
	var UserCanvasManager = {
		//所有好友集合
		_users: [],
		//当前用户的canvas
		UserCanvas: null,
		//当前用户的Stage
		UserStage: null,
		//好友上线时新建画布
		CreateUserCanvas: function(id, name) {
			var $newCanvas = $('<canvas class="user-canvas"></canvas>')
				.attr('data-userid', id)
				.attr('data-name', name);
			$(this.UserCanvas).before($newCanvas);
			var tCanvas = $newCanvas[0];
			$newCanvas[0].height = $container.height();
			$newCanvas[0].width = $container.width();
			var tShape = new createjs.Shape();
			var tStage = new createjs.Stage($newCanvas[0]);
			tStage.autoClear = false;
			tStage.addChild(tShape);
			this._users.push({
				id: id,
				name: name,
				canvas: tCanvas,
				stage: tStage,
				shape: tShape
			});
		},
		RemoveUserCanvas: function(json) {
			this.Traverse(function(i, user) {
				if (user.id == json.id && user.name == json.name) {
					_users.splice(i, 1);
				}
			})
		},
		//遍历_users集合
		Traverse: function(fun) {
			$.each(this._users, function(index, val) {
				fun(index, val);
			});
		},
		//根据json.id, json.name找到_users集合中的_users
		_findUser: function(json) {
			var returnUser;
			this.Traverse(function(i, user) {
				if (user.id == json.id && user.name == json.name) {
					returnUser = user;
					return;
				}
			})
			return returnUser;
		},
		//关于鼠标信息接受时触发
		MouseInfoReceived: function(json) {
			var user = this._findUser(json);

			var midPt = json.midPt;
			var oldPt = json.oldPt;
			var oldMidPt = json.oldMidPt;
			user.shape.graphics.clear()
				.setStrokeStyle(json.penProperty.thickness, 'round', 'round')
				.beginStroke(json.penProperty.color)
				.moveTo(midPt.x, midPt.y)
				.curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
			user.stage.update();
		},
		//关于图片二进制接受时触发
		ImgBinaryReceived: function(json) {
			var user = this._findUser(json);

			user.stage.clear();
			user.shape.graphics.clear();
			var bitmap = new createjs.Bitmap(json.imgBinary);
			user.stage.addChild(bitmap);
			bitmap.draw(user.stage.canvas.getContext('2d'));
			user.stage.removeChild(bitmap);
			user.stage.update();
		},
		//初始化当前用户
		Initalize: function() {
			var canvas, stage;

			canvas = this.UserCanvas = $('#canvas')[0];
			canvas.height = $container.height();
			canvas.width = $container.width();

			stage = this.UserStage = new createjs.Stage(canvas);
			stage.autoClear = false;

			var shape = new createjs.Shape();

			stage.addEventListener("stagemousedown", handleMouseDown);
			stage.addEventListener("stagemouseup", handleMouseUp);
			stage.addChild(shape);
			stage.update();
			// setInterval(function() {
			// 	$.websocket({
			// 		type: ProtJsonType.ImgBinary,
			// 		imgBinary: stage.toDataURL()
			// 	});
			// }, 1000);
			var oldPt, oldMidPt;

			function handleMouseDown() {
				oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
				oldMidPt = oldPt;
				stage.addEventListener("stagemousemove", handleMouseMove);
				$.websocket({
					type: ProtJsonType.MouseDown,
					oldPt: oldPt,
					oldMidPt: oldMidPt,
				});
			}

			function handleMouseMove() {
				var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1, oldPt.y + stage.mouseY >> 1);
				shape.graphics.clear()
					.setStrokeStyle(penProperty.thickness, 'round', 'round')
					.beginStroke(penProperty.color)
					.moveTo(midPt.x, midPt.y)
					.curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
				stage.update();

				$.websocket({
					type: ProtJsonType.MouseMove,
					midPt: midPt,
					oldPt: oldPt,
					oldMidPt: oldMidPt,
					penProperty: penProperty
				})

				oldPt.x = stage.mouseX;
				oldPt.y = stage.mouseY;
				oldMidPt.x = midPt.x;
				oldMidPt.y = midPt.y;
			}

			function handleMouseUp(event) {
				stage.removeEventListener("stagemousemove", handleMouseMove);
				$.websocket({
					type: ProtJsonType.MouseUp,
				});
			}

			$('#clearShape').click(function(event) {
				stage.clear();
				shape.graphics.clear();
				stage.update();
			});
			$('.pen-color').click(function() {
				$('.pen-color').removeClass('active');
				$(this).toggleClass('active');
				penProperty.color = $(this).attr('data-property');
			});
			$('.pen-thickness').click(function() {
				$('.pen-thickness').removeClass('active');
				$(this).toggleClass('active');
				penProperty.thickness = $(this).attr('data-property');
			});
			$('#tool').click(function() {
				$.websocket({
					type: 2,
					imgBinary: stage.toDataURL()
				})
			})
		}
	}

	$(window).on('load', function() {
		//初始化
		$container = $('.canvas-container');
		UserCanvasManager.Initalize();
		initWebSocket();
	});

	var maxWidth = 0,
		maxHeight = 0;
	$(window).on('resize', function() {
		var height = $container.height();
		var width = $container.width();
		var bufferImg = new Image();
		bufferImg.src = UserCanvasManager.UserStage.toDataURL();
		var isReloaded = false;
		if (height > maxHeight) {
			UserCanvasManager.UserCanvas.height = maxHeight = height;
			UserCanvasManager.Traverse(function(i, user) {
				user.canvas.height = height;
			});
			isReloaded = true;
		}
		if (width > maxWidth) {
			UserCanvasManager.UserCanvas.width = maxWidth = width;
			UserCanvasManager.Traverse(function(i, user) {
				user.canvas.width = width;
			});
			isReloaded = true;
		}
		if (isReloaded) {
			// bufferImg.onload = function() {
			var bitmap = new createjs.Bitmap(bufferImg);
			UserCanvasManager.UserStage.addChild(bitmap);
			bitmap.draw(UserCanvasManager.UserStage.canvas.getContext('2d'));
			UserCanvasManager.UserStage.removeChild(bitmap);
			UserCanvasManager.UserStage.update();
			// stageBg.update();
			// bufferImg.onload = false;
			// }
		}
	});

	//初始化WebSocket
	function initWebSocket() {
		$.websocket('connect', function(json) {
			if (json.status == 0) {
				$.alert(json.errorInfo);
			} else {
				var $userList = $('.slide-user-list .list-group');

				function getItem(name, id, email) {
					return $('<a href="javascript:;" class="list-group-item">')
						.text(name)
						.attr('data-userid', id)
						.attr('data-email', email)
				}
				switch (json.type) {
					case ProtJsonType.MouseMove:
						UserCanvasManager.MouseInfoReceived(json);
						break;
					case ProtJsonType.ImgBinary:
						UserCanvasManager.ImgBinaryReceived(json);
						break;
						
					case ProtJsonType.UserList:
						var userId = $userList.children(':eq(1)').attr('data-userid');
						$userList.children(':gt(1)').remove();
						$.each(json.userInfoList, function(index, val) {
							if (val.id != userId) {
								$userList.append(getItem(val.name, val.id, val.email));
								UserCanvasManager.CreateUserCanvas(val.id, val.name);
							}
						});
						break;
					case ProtJsonType.Signin:
						var $items = $userList.children(':gt(1)');
						var isInserted = false;
						$items.each(function(index, el) {
							if (json.id < $(el).attr('data-userid')) {
								$(el).before(getItem(json.name, json.id, json.email));
								isInserted = true;
							}
						});
						if (!isInserted) {
							$userList.append(getItem(json.name, json.id, json.email));
						}
						UserCanvasManager.CreateUserCanvas(json.id, json.name);
						break;
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
			}
		});
	}
})();