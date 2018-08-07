import _ from 'underscore'
(function($) {
	/**
	 * Auto-growing textareas; technique ripped from Facebook
	 *
	 *
	 * http://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
	 */
	$.fn.autogrow = function(options) {
		var shadow = $("div.autogrow-shadow");
		if (!shadow.length) {
			shadow = $('<div></div>').addClass("autogrow-shadow").appendTo(document.body);
		}
		return this.filter('textarea').each(function() {
			var self = this;
			var $self = $(self);
			const minHeight = $self.height();
			var settings = $.extend({
				postGrowCallback: null
			}, options);

			const maxHeight = window.getComputedStyle(self)['max-height'].replace('px', '');

			shadow.css({
				position: 'absolute',
				top: -10000,
				left: -10000,
				width: $self.width(),
				fontSize: $self.css('fontSize'),
				fontFamily: $self.css('fontFamily'),
				fontWeight: $self.css('fontWeight'),
				lineHeight: $self.css('lineHeight'),
				resize: 'none',
				wordWrap: 'break-word'
			});

			const trigger = _.debounce(() => {
				$self.trigger('autogrow', []);
			})

			const times = function(string, number) {
				for (let i = 0, r = ''; i < number; i++) r += string;
				return r;
			};

			const update = _.debounce(function(event) {

				var val = self.value.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/&/g, '&amp;')
					.replace(/\n$/, '<br/>&nbsp;')
					.replace(/\n/g, '<br/>')
					.replace(/ {2,}/g, function(space) {
						return times('&nbsp;', space.length - 1) + ' ';
					});

				// Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
				if (event && event.data && event.data.event === 'keydown' && event.keyCode === 13 && (event.shiftKey || event.ctrlKey || event.altKey)) {
					val += '<br/>';
				}

				shadow.css('width', $self.width());
				shadow.html(val);

				let newHeight = Math.max(shadow.height() + 1, minHeight) + 1;

				let overflow = 'hidden';

				if(maxHeight <= newHeight){
					newHeight = maxHeight;
					overflow = ''
				}

				if(newHeight == $self[0].offsetHeight){
					return true;
				}

				$self.stop().animate( { height: newHeight }, { duration: 100, complete: trigger }).css('overflow', overflow);

				if (settings.postGrowCallback !== null) {
					settings.postGrowCallback($self);
				}

				trigger()
			}, 500);

			$self.on('focus change input', update);
			$(window).resize(update);

			update();
			self.updateAutogrow = update;
		});
	};
})(jQuery);
