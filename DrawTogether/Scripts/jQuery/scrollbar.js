;
(function($) {

	var scrollbar = {
		defaults: {
			min: 1,
			max: 20,
			onChange: null,
		},
		init: function(options) {
			var options = $.extend(scrollbar.defaults, options);
			var $this = this,
				$bar = $this.find('.progress-vertical-bar'),
				$handler = $this.find('.progress-vertical-handler');
			$handler[0].ondragstart = function() {
				return false;
			};
			var height = $this.height();
			$handler.mousedown(function(e) {
				var oldY = e.pageY - parseInt($handler.css('top'));
				var mousemoveEvent;
				$(document).mousemove(function(e) {
					var value = e.pageY - oldY + 10;
					mousemoveEvent = e;
					if (value >= 0 && value <= height) {
						$handler.css('top', value - 10 + 'px');
						$bar.height(value);
						options.onChange(Math.round(value / height * (options.max - options.min) + options.min));
					}

				});
				$(document).one('mouseup', function() {
					$(document).off(mousemoveEvent);
				});
			});
		}
	}

	$.fn.scrollbar = function(options) {
		var $this = this;
		$(window).load(function(){
			scrollbar.init.call($this, options);
		});
	}

})(jQuery)