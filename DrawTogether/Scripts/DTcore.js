(function() {
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
		// 	$.post('/path/to/file', {
		// 		type: 0,
		// 		imgBack: stage.toDataURL()
		// 	});
		// }, 5000);
		var oldPt, oldMidPt;

		function handleMouseDown() {
			oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
			oldMidPt = oldPt;
			stage.addEventListener("stagemousemove", handleMouseMove);
			$.websocket({
				type: 0,
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
				status: 1,
				type: 1,
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
				type: -1,
			});
		}

		$('#clearShape').click(function(event) {
			stage.clear();
			shape.clear();
			stage.update();
		});
		$('.pen-color').click(function() {
			$('.pen-color').removeClass('btn-primary').addClass('btn-default');
			$(this).toggleClass('btn-primary btn-default');
			penProperty.color = $(this).attr('data-property');
		});
		$('.pen-thickness').click(function() {
			$('.pen-thickness').removeClass('btn-primary').addClass('btn-default');
			$(this).toggleClass('btn-primary btn-default');
			penProperty.thickness = $(this).attr('data-property');
		});
		$('#tool').click(function(){
			$.websocket({
				type:2,
				imgBinary: stage.toDataURL()
			})
		})
	}

	function initStageBg() {
		stageBg = new createjs.Stage("canvasBg");
		stageBg.autoClear = false;
		var img = new Image();
		img.src = '/Content/image/testPic.png'
		img.onload = function() {
			// var bitmap = new createjs.Bitmap(img);
			// var blurFilter = new createjs.BlurFilter(5, 5, 10);
			// bitmap.filters = [blurFilter];
			// bitmap.cache(0, 0, img.width, img.height);
			// stageBg.addChild(bitmap);
			// stageBg.update();
		}
	}

	function initWebSocket() {
		var shape = new createjs.Shape();
		stageBg.addChild(shape);
		$.websocket('connect', function(json) {
			if (json.status == 0) {
				$.alert(json.errorInfo);
			} else {
				if (json.type == 1) {
					var midPt = json.midPt;
					var oldPt = json.oldPt;
					var oldMidPt = json.oldMidPt;
					shape.graphics.clear()
						.setStrokeStyle(json.penProperty.thickness, 'round', 'round')
						.beginStroke(json.penProperty.color)
						.moveTo(midPt.x, midPt.y)
						.curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);
					stageBg.update();
				} else if (json.type == 2) {
					stageBg.clear();
					shape.clear();
					var bitmap = new createjs.Bitmap(json.imgBinary);
					stage.addChild(bitmap);
					bitmap.onload = function(){
						bitmap.draw(stageBg.canvas.getContext('2d'));
						stageBg.update();
					}
				}
			}
		});
	}

	function main() {
		initStage();
		initStageBg();
		initWebSocket();
	}
})();