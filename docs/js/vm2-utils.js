/**
 * Created by x373241884y
 */
(function(angular, window, undefined) {
    angular.module("vm2.utils", []);
    /**
     //     Usage:
     //     <input type="text" ui-amount mode="12.2" ></input>
     //     <input type="text" ui-amount mode="12.2" symbol='$' formatting='true' ></input>
     //     All Usage(default):
     //     <input type="text" name="testabc" ng-model="testabc" ui-amount mode="12.2" decimals="2" formatting="true"  symbol='$'>
     */
    angular.module('vm2.utils').directive('uiAmount', ['$locale', function($locale) {

        return {
            link: link,
            require: 'ngModel',
            restrict: 'A'
        };

        function link(scope, el, attrs, ngModelCtrl) {
            var decimalSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP; //.
            var groupSeparator = $locale.NUMBER_FORMATS.GROUP_SEP; //,
            var intLength = 12; // Maximum int length. Default max ECMA script.
            var dotLength = 2; // Maximum dot length. Default max ECMA script.
            var decimals = /^\d+$/.test(attrs.decimals) ? parseInt(attrs.decimals, 10) : 2; // Number of decimals. Default 2.
            var formatting = attrs.formatting == 'false' ? false : true; //default true

            var NUMBER_REGEXP = "^\\s*(\\-|\\+)?(\\d+|(\\d*(\\.\\d*)))\\s*$";
            // Create new regular expression with current decimal separator.
            var regex = new RegExp(NUMBER_REGEXP);
            var mode = attrs.mode;
            var MODE_REGEXP = /^(\d+)(\.(\d+))?$/;
            if (MODE_REGEXP.test(mode)) {
                intLength = parseInt(RegExp.$1, 10);
                dotLength = RegExp.$2 && parseInt(RegExp.$3, 10) || dotLength;
            }

            var lastValidValue; // Last valid value.
            var symbol = attrs.symbol || '';
            // Create parsers and formatters.
            ngModelCtrl.$parsers.push(parseViewValue);
            ngModelCtrl.$formatters.push(formatViewValue);

            el.bind('blur', onBlur); // Event handler for the leave event.
            el.bind('focus', onFocus); // Event handler for the focus event.


            /**
             * Format a number with the thousand group separator.
             */
            function numberWithCommas(value) {
                if (formatting) {
                    var parts = ("" + value).split(decimalSeparator);
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
                    return parts.join(decimalSeparator);
                } else {
                    // No formatting applies.
                    return value;
                }
            }

            /**
             * Format a value with thousand group separator and correct decimal char.
             */
            function formatPrecision(value) {
                if (!(value || value === 0)) {
                    return '';
                }
                var formattedValue = parseFloat(value).toFixed(decimals);
                formattedValue = formattedValue.replace('.', decimalSeparator);
                return symbol + numberWithCommas(formattedValue);
            }

            function formatViewValue(value) {
                return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
            }

            /**
             * Parse the view value.
             */
            function parseViewValue(value) {
                if (angular.isUndefined(value)) {
                    value = '';
                }
                value = ("" + value).replace(symbol, '');
                // value = (""+value).replace(decimalSeparator, '.');

                // Handle leading decimal point, like ".5"
                if (value.indexOf('.') === 0) {
                    value = '0' + value;
                }

                if (ngModelCtrl.$isEmpty(value)) {
                    lastValidValue = '';
                    //ngModelCtrl.$modelValue = undefined;
                } else if (regex.test(value)) {
                    var index = value.indexOf('.');
                    if (index > 0) {
                        var intString = value.substring(0, index);
                        var dotString = value.substring(index + 1, value.length);
                        if (intString.length > intLength || dotString.length > dotLength) { // Render the last valid input in the field
                            renderLastValidValue();
                        } else {
                            lastValidValue = parseFloat(value, 10);
                        }
                    } else {
                        if (value.length > intLength) { // Render the last valid input in the field
                            renderLastValidValue();
                        } else {
                            lastValidValue = parseFloat(value, 10);
                        }
                    }
                } else { // Render the last valid input in the field
                    renderLastValidValue();
                }
                return lastValidValue;
            }

            function renderLastValidValue() {
                ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
                ngModelCtrl.$render();
            }
            /**
             * Function for handeling the blur (leave) event on the control.
             */
            function onBlur() {
                var value = ngModelCtrl.$modelValue;
                if (!angular.isUndefined(value)) {
                    // Format the model value.
                    ngModelCtrl.$viewValue = formatPrecision(value);
                    ngModelCtrl.$render();
                }
            }
            /**
             * Function for handeling the focus (enter) event on the control.
             * On focus show the value without the group separators.
             */
            function onFocus() {
                var value = ngModelCtrl.$modelValue;
                if (!angular.isUndefined(value)) {
                    ngModelCtrl.$viewValue = ("" + value).replace(".", decimalSeparator);
                    ngModelCtrl.$render();
                }
            }
        }
    }]);
    /**
     *  directive    key-allow
     *  value    number    允许输入数字
     *  value    word    允许输入数字、字母
     *  value   tel     允许输入数字、-
     *  value   amount  允许输入数字和小数点
     *  usage    key-allow   key-allow="number|word|symbol"
     */
    /**
     //     Usage:
     //     <input type="text" vm-keyallow ></input>
     //     All Usage(default):
     //     <input type="text" vm-keyallow max="11">
     */
    angular.module('vm2.utils').directive('vmKeyallow', function() {
        var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/;
        var defaultMasks = {
            "number": /^\d*$/,
            "word": /^[0-9a-zA-Z]*$/,
            "tel": /^[0-9-]*$/,
            "amount": /^\d+(\.\d*)?$/,
        };
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                if (attrs.type != 'text') {
                    throw Error("element must be type='text'");
                }
                var keyword = attrs.vmKeyallow,
                    rule, lastValidVal;
                if (defaultMasks[keyword]) {
                    rule = defaultMasks[keyword];
                } else {
                    console.log(keyword);
                    rule = keyword;
                    if (REGEX_STRING_REGEXP.test(keyword)) {
                        rule = new RegExp(RegExp.$1, RegExp.$2);
                    }
                }
                modelCtrl.$parsers.push(function(inputValue) {
                    if (inputValue == undefined) return '';
                    if (rule.test(inputValue)) {
                        lastValidVal = inputValue;
                    } else {
                        modelCtrl.$setViewValue(lastValidVal);
                        modelCtrl.$render();
                    }
                    return lastValidVal;
                });
            }
        };
    });
    /**
     //     Usage:
     //     <input type="text" name="inputnum" ng-model="inputnum" vm-keybord-input ></input>
     //     All Usage(default):
     //      <input type="text" name="inputnum" ng-model="inputnum" vm-keybord-input mode="8.2" ></input>
     */
    angular.module('vm2.utils').directive({
        vmKeybordInput: function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                compile: function(tElement, tAttr) {
                    var mode = tAttr.mode,
                        $id = 'keybord' + Date.now();
                    var template = $('<div id=' + $id + ' vm-keybord></div>');
                    mode && $(template).attr("mode", mode);
                    tAttr.templateUrl && $(template).attr("template-url", tAttr.templateUrl);
                    tElement.parent().append(template);
                    return function(scope, element, attrs, modelCtrl) {
                        var keybord = {
                            $modelValue: undefined
                        };
                        element.attr("readonly", "true");
                        element.on('focus', function(event) {
                            keybord.$modelValue = scope.$eval(attrs.ngModel) || '';
                            scope.$broadcast("vmKeybord.OPEN", $id, keybord);
                            element.blur();
                        });
                        scope.$on('vmKeybord.CLOSE', function(event, keyId, newKeybord) {
                            if (keyId == $id) {
                                keybord.$modelValue = newKeybord.modelValue;
                                element.val(keybord.$modelValue);
                                modelCtrl.$setViewValue(keybord.$modelValue);
                                modelCtrl.$render();
                            }
                        });
                    }

                }
            };
        },
        vmKeybord: function() {
            return {
                restrict: 'A',
                templateUrl: function(element, attrs) {
                    return attrs.templateUrl || '/template/keybord1.html';
                },
                scope: true,
                link: function(scope, element, attrs) {
                    var viewValue, lastModelVal, lastViewval, keyId = attrs.id;
                    var isTouch = ("ontouchstart" in document.documentElement) ? true : false;
                    var keybord = scope.keybord = {
                        viewValue: undefined,
                        modelValue: undefined
                    };
                    var intLength = 12,
                        dotLength = 2,
                        moveYLength = 30;
                    var mode = attrs.mode;
                    var MODE_REGEXP = /^(\d+)(\.(\d+))?$/;
                    var NUMBER_REGEXP = /^\d+(\.\d*)?$/;
                    if (MODE_REGEXP.test(mode)) {
                        intLength = parseInt(RegExp.$1, 10);
                        dotLength = RegExp.$2 && parseInt(RegExp.$3, 10) || dotLength;
                    }
                    element.addClass('ng-hide');
                    scope.$on('vmKeybord.OPEN', function(event, $id, srcKeybord) {
                        if (keyId == $id) {
                            keybord.modelValue = srcKeybord.$modelValue;
                            keybord.viewValue = keybord.modelValue + '';
                            viewValue = lastModelVal = lastViewval = keybord.viewValue;
                            element.removeClass('ng-hide');
                        }
                    });
                    $(element).on('vmKeybord.vmkey', function(event, key) {
                        if (key.indexOf('[') === -1 && key.indexOf(']') === -1) {
                            normalKeyPressed(key);
                        } else {
                            key = key.substring(1, key.length - 1);
                            fnKeyPressed(key);
                        }
                        keybord.viewValue = viewValue;
                        lastModelVal = keybord.modelValue = parseViewValue(viewValue);
                        viewValue = lastViewval = keybord.viewValue;
                        scope.$apply();
                        event.stopPropagation();
                    });
                    $(element).delegate("[vm-key]", isTouch ? "touchstart" : "mousedown", function(event) {
                        keyPressStart.apply(this, arguments);
                    });
                    $(element).delegate("[vm-key]", isTouch ? "touchend" : "mouseup", function(event) {
                        keyPressEnd.apply(this, arguments);
                    });
                    $(element).delegate("[vm-key]", isTouch ? "touchmove" : "mouseleave", function(event) {
                        keyPressOut.apply(this, arguments);
                    });

                    function parseViewValue(value) {
                        if (value == '.') {
                            setViewValue('');
                            value = '';
                        }
                        if (angular.isUndefined(value) || value == '') {
                            return value;
                        }
                        var index = value.indexOf('.');
                        if (NUMBER_REGEXP.test(value)) {
                            if (index > 0) {
                                var dotString = value.substring(index + 1, value.length);
                                if (dotString.length > dotLength) { // Render the last valid input in the field
                                    setViewValue(lastViewval);
                                    return lastModelVal;
                                } else if (index == value.length - 1) {
                                    return parseFloat(value, 10);
                                }
                            } else if (value.length > intLength) { // Render the last valid input in the field
                                setViewValue(lastViewval);
                                return lastModelVal;
                            }
                            return parseFloat(value, 10);
                        } else {
                            setViewValue(lastViewval);
                            return lastModelVal;
                        }
                    }

                    function setViewValue(value) {
                        if (keybord.viewValue !== value) {
                            keybord.viewValue = value;
                        }
                    }

                    function normalKeyPressed(key) {
                        if (!viewValue) {
                            viewValue = "";
                        }
                        viewValue += key;
                    }

                    function fnKeyPressed(key, self) {
                        if (key === "DELETE") {
                            if (lastViewval) {
                                viewValue = lastViewval.slice(0, -1);
                            } else {
                                viewValue = '';
                            }
                        } else if (key === "CANCEL") {
                            scope.$emit('vmKeybord.CANCEL', keyId);
                            element.addClass('ng-hide');
                        } else if (key === "OK") {
                            scope.$emit('vmKeybord.CLOSE', keyId, keybord);
                            element.addClass('ng-hide');
                        }
                    }

                    function keyPressStart(event) {
                        $(this).addClass('pressed');
                        if (isTouch) {
                            var orginE = event.originalEvent;
                            var touch = orginE.touches[0];
                            this.startPosition = {
                                x: touch.pageX,
                                y: touch.pageY
                            };
                        }
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }

                    function keyPressEnd(event) {
                        $(element).trigger('vmKeybord.vmkey', $(this).attr("vm-key"));
                        $(this).removeClass('pressed');
                    }

                    /**
                     * 移出数字键范围时，去除按下样式，解除绑定
                     */
                    function keyPressOut(event) {
                        //计算移动端touchmove时移动的距离，用于模拟取消输入手势
                        // if (isTouch) {
                        // 	var orginE = event.originalEvent;
                        // 	var touch = orginE.touches[0];
                        // 	this.endPosition = {
                        // 		x: touch.pageX,
                        // 		y: touch.pageY
                        // 	};
                        // 	var deltaY = this.endPosition.y - this.startPosition.y;
                        // 	var moveLength = Math.abs(deltaY);
                        // 	if (moveLength > moveYLength) { //如果Y轴移动距离大于moveYLength，判定为取消输入
                        // 		$(this).removeClass('pressed');
                        // 	} else { //否则，作为正常数字键按下响应
                        // 		keyPressEnd.apply(this);
                        // 	}
                        // } else {
                        // 	$(this).removeClass('pressed');
                        // }
                        $(this).removeClass('pressed');
                    }
                }
            }
        }
    });
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

    // $browser fallback for jQuery 1.9+.
    var $browser = (function() {
        var ua_match = function(ua) {
                ua = ua.toLowerCase();
                var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) ||
                    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

                return {
                    browser: match[1] || "",
                    version: match[2] || "0"
                };
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
        63275: 35 // end
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
    angular.module('vm2.utils').directive("vmKeyfilter", function() {
        return {
            restrict: 'A',
            compile: function() {
                return {
                    pre: function(scope, element, attr) {
                        var regex = attr.vmKeyfilter;
                        if (!regex) {
                            return;
                        }
                        if (REGEX_STRING_REGEXP.test(regex)) {
                            regex = new RegExp(RegExp.$1, RegExp.$2);
                        }
                        element.on("keypress", function(event) {
                            if (event.ctrlKey || event.altKey) {
                                return;
                            }
                            var k = getKey(event);
                            if ($browser.mozilla && (isNavKeyPress(event) || k == Keys.BACKSPACE || (k == Keys.DELETE && event.charCode == 0))) {
                                return;
                            }
                            var c = getCharCode(event),
                                cc = String.fromCharCode(c),
                                ok = true;
                            if (!$browser.mozilla && (isSpecialKey(event) || !cc)) {
                                return;
                            }
                            if (regex.test) {
                                ok = regex.test(cc);
                            } else {
                                ok = scope.$eval(attr.vmKeyfilter, {
                                    $event: event
                                });
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
    /**
     //     Usage:
     //     <input type="text" vm-number ></input>
     //     All Usage(default):
     //     <input type="text" vm-number mode="12.2">
     */
    angular.module('vm2.utils').directive('vmNumber', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                var intLength = 12; // Maximum int length. Default max ECMA script.
                var dotLength = 2; // Maximum dot length. Default max ECMA script.
                var decimals = /^\d+$/.test(attrs.decimals) ? parseInt(attrs.decimals, 10) : 2; // Number of decimals. Default 2.
                var NUMBER_REGEXP = "^\\s*(\\-|\\+)?(\\d+|(\\d*(\\.\\d*)))\\s*$";
                // Create new regular expression with current decimal separator.
                var regex = new RegExp(NUMBER_REGEXP);
                var mode = attrs.mode;
                var MODE_REGEXP = /^(\d+)(\.(\d+))?$/;
                if (MODE_REGEXP.test(mode)) {
                    intLength = parseInt(RegExp.$1, 10);
                    dotLength = RegExp.$2 && parseInt(RegExp.$3, 10) || dotLength;
                }

                var lastValidValue; // Last valid value.
                ngModelCtrl.$parsers.push(parseViewValue);
                element.bind('blur', onBlur); // Event handler for the leave event.
                function parseViewValue(value) {
                    if (angular.isUndefined(value) || value == '') {
                        return value;
                    }
                    value = '' + value;
                    // Handle leading decimal point, like ".5"
                    if (value.indexOf('.') === 0) {
                        value = '0' + value;
                    }
                    if (regex.test(value)) {
                        var index = value.indexOf('.');
                        if (index > 0) {
                            var intString = value.substring(0, index);
                            var dotString = value.substring(index + 1, value.length);
                            if (intString.length > intLength || dotString.length > dotLength) { // Render the last valid input in the field
                                renderLastValidValue();
                            } else {
                                lastValidValue = parseFloat(value, 10);
                            }
                        } else {
                            if (value.length > intLength) { // Render the last valid input in the field
                                renderLastValidValue();
                            } else {
                                lastValidValue = parseFloat(value, 10);
                            }
                        }
                    } else { // Render the last valid input in the field
                        renderLastValidValue();
                    }
                    return lastValidValue;
                }

                function renderLastValidValue() {
                    ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
                    ngModelCtrl.$render();
                }

                function round(value) {
                    var d = Math.pow(10, decimals);
                    return Math.round(value * d) / d;
                }

                function formatViewValue(value) {
                    return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
                }

                function onBlur() {
                    var value = ngModelCtrl.$modelValue;
                    if (!angular.isUndefined(value)) {
                        // Format the model value.
                        ngModelCtrl.$viewValue = round(value);
                        ngModelCtrl.$render();
                    }
                }
            }
        };
    });
    /**
     //     Usage:
     //     <input type="text" vm-onlynumber ></input>
     //     All Usage(default):
     //     <input type="text" vm-onlynumber max="11">
     */
    angular.module('vm2.utils').directive('vmOnlynumber', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                if (attrs.type != 'text') {
                    throw Error("element must be type='text'");
                }
                var max = -1,
                    lastValidVal;
                if (/^\d+$/.test(attrs.max)) {
                    max = parseInt(attrs.max);
                }
                modelCtrl.$parsers.push(function(inputValue) {
                    if (inputValue == undefined) return '';
                    if (/^\d+$/.test(inputValue)) {
                        if (max > 0 && inputValue.length > max) {
                            modelCtrl.$setViewValue(lastValidVal);
                            modelCtrl.$render();
                        } else {
                            lastValidVal = inputValue;
                        }
                    } else {
                        modelCtrl.$setViewValue(lastValidVal);
                        modelCtrl.$render();
                    }
                    return lastValidVal;
                });
            }
        };
    });
})(angular, window);