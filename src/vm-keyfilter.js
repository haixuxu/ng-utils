/*
 * Class style:
 * <input type="text" vm-keyfilter="/\d+/" />
 *
 * Available classes:
 * mask-pint:     /[\d]/
 * mask-int:      /[\d\-]/
 * mask-pnum:     /[\d\.]/
 * mask-money     /[\d\.\s,]/
 * mask-num:      /[\d\-\.]/
 * mask-hex:      /[0-9a-f]/i
 * mask-email:    /[a-z0-9_\.\-@]/i
 * mask-alpha:    /[a-z_]/i
 * mask-alphanum: /[a-z0-9_]/i
 */

(function (window, angular) {
	// $browser fallback for jQuery 1.9+.
	var $browser = (function () {
		var ua_match = function (ua) {
				ua = ua.toLowerCase();
				var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
					/(webkit)[ \/]([\w.]+)/.exec(ua) ||
					/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
					/(msie) ([\w.]+)/.exec(ua) ||
					ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
					[];

				return {browser: match[1] || "", version: match[2] || "0"};
			},
			matched = ua_match(navigator.userAgent),
			browser = {};

		if (matched.browser) {
			browser[matched.browser] = true;
			browser.version = matched.version;
		}

		if (browser.chrome) {
			browser.webkit = true;
		} else if (browser.webkit) {
			browser.safari = true;
		}
		return browser;
	})();
	var Keys = {
		TAB: 9,
		RETURN: 13,
		ESC: 27,
		BACKSPACE: 8,
		DELETE: 46
	};
	var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/;
	// safari keypress events for special keys return bad keycodes
	var SafariKeys = {
		63234: 37, // left
		63235: 39, // right
		63232: 38, // up
		63233: 40, // down
		63276: 33, // page up
		63277: 34, // page down
		63272: 46, // delete
		63273: 36, // home
		63275: 35  // end
	};

	function isNavKeyPress(e) {
		var k = e.keyCode;
		k = $browser.safari ? (SafariKeys[k] || k) : k;
		return (k >= 33 && k <= 40) || k == Keys.RETURN || k == Keys.TAB || k == Keys.ESC;
	}

	function isSpecialKey(e) {
		var k = e.keyCode;
		var c = e.charCode;
		return k == 9 || k == 13 || k == 27 ||
			k == 16 || k == 17 ||
			(k >= 18 && k <= 20) ||
			($browser.opera && !e.shiftKey && (k == 8 || (k >= 33 && k <= 35) || (k >= 36 && k <= 39) || (k >= 44 && k <= 45)));
	}

	/**
	 * Returns a normalized keyCode for the event.
	 * @return {Number} The key code
	 */
	function getKey(e) {
		var k = e.keyCode || e.charCode;
		return $browser.safari ? (SafariKeys[k] || k) : k;
	}

	function getCharCode(e) {
		return e.charCode || e.keyCode || e.which;
	}

	angular.module('vm2.utils').directive("vmKeyfilter", function () {
		return {
			restrict: 'A',
			compile: function () {
				return {
					pre:function (scope, element, attr) {
						var regex = attr.vmKeyfilter;
						if(!regex){
							return;
						}
						if(REGEX_STRING_REGEXP.test(regex)){
							regex = new RegExp(RegExp.$1, RegExp.$2);
						}
						element.on("keypress", function (event) {
							if (event.ctrlKey || event.altKey) {
								return;
							}
							var k = getKey(event);
							if ($browser.mozilla && (isNavKeyPress(event) || k == Keys.BACKSPACE || (k == Keys.DELETE && event.charCode == 0))) {
								return;
							}
							var c = getCharCode(event), cc = String.fromCharCode(c), ok = true;
							if (!$browser.mozilla && (isSpecialKey(event) || !cc)) {
								return;
							}
							if (regex.test) {
								ok = regex.test(cc);
							} else {
								ok = scope.$eval(attr.vmKeyfilter,{$event:event});
							}
							if (!ok) {
								event.preventDefault();
							}
						});
					}
				}
			}
		}
	});


})(window, angular);