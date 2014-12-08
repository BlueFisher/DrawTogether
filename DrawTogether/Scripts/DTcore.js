(function() {

	var ProtJsonType = {
		MouseUp: -1,
		MouseDown: 0,
		MouseMove: 1,
		ImgBinary: 2,
		UserList: 3,
		Signin: 4,
		Signout: 5
	}

	var $container, canvas, canvasBg;
	$(window).on('load', function() {
		//初始化
		$container = $('.canvas-container');
		canvas = $('#canvas')[0];
		canvasBg = $('#canvasBg')[0];
		canvasBg.height = canvas.height = $container.height();
		canvasBg.width = canvas.width = $container.width();
		//调用主函数
		main();
	});

	function main() {
		initStage();
		initStageBg();
		initWebSocket();
	}

	var maxWidth = 0,
		maxHeight = 0;
	$(window).on('resize', function() {
		var height = $container.height();
		var width = $container.width();
		var bufferImg = new Image();
		bufferImg.src = stage.toDataURL();
		var isReloaded = false;
		if (height > maxHeight) {
			canvas.height = canvasBg.height = maxHeight = height;
			isReloaded = true;
		}
		if (width > maxWidth) {
			canvas.width = canvasBg.width = maxWidth = width;
			isReloaded = true;
		}
		if (isReloaded) {
			// bufferImg.onload = function() {
			var bitmap = new createjs.Bitmap(bufferImg);
			stage.addChild(bitmap);
			bitmap.draw(stage.canvas.getContext('2d'));
			stage.removeChild(bitmap);
			stage.update();
			stageBg.update();
			// bufferImg.onload = false;
			// }
		}
	});



	var stage, stageBg;
	var penProperty = {
		color: 'black',
		thickness: 5,
	};

	function initStage() {
		stage = new createjs.Stage("canvas");
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

	function initStageBg() {
		stageBg = new createjs.Stage("canvasBg");
		stageBg.autoClear = false;
	}

	function initWebSocket() {
		var shape = new createjs.Shape();
		stageBg.addChild(shape);
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
						var midPt = json.midPt;
						var oldPt = json.oldPt;
						var oldMidPt = json.oldMidPt;
						shape.graphics.clear()
							.setStrokeStyle(json.penProperty.thickness, 'round', 'round')
							.beginStroke(json.penProperty.color)
							.moveTo(midPt.x, midPt.y)
							.curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
						stageBg.update();
						break;
					case ProtJsonType.ImgBinary:
						stageBg.clear();
						shape.graphics.clear();
						var bitmap = new createjs.Bitmap(json.imgBinary);
						stageBg.addChild(bitmap);
						bitmap.draw(stageBg.canvas.getContext('2d'));
						stageBg.removeChild(bitmap);
						stageBg.update();
						break;
					case ProtJsonType.UserList:
						var userId = $userList.children(':eq(1)').attr('data-userid');
						$userList.children(':gt(1)').remove();
						$.each(json.userInfoList, function(index, val) {
							if (val.id != userId) {
								$userList.append(getItem(val.name, val.id, val.email));
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
						if(!isInserted){
							$userList.append(getItem(json.name, json.id, json.email));
						}
						break;
					case ProtJsonType.Signout:
						var $items = $userList.children(':gt(1)');
						$items.each(function(index, el) {
							if (json.id == $(el).attr('data-userid')) {
								$(el).remove();
							}
						});
						break;
				}
			}
		});
	}
})();