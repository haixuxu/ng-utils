/**
 //     Usage:
 //     <input type="text" name="inputnum" ng-model="inputnum" vm-keybord-input ></input>
 //     All Usage(default):
 //      <input type="text" name="inputnum" ng-model="inputnum" vm-keybord-input mode="8.2" ></input>
 */
angular.module('vm2.utils').directive({
	vmKeybordInput: function () {
		return {
			restrict: 'A',
			require: 'ngModel',
			compile: function (tElement, tAttr) {
				var mode = tAttr.mode, $id = 'keybord' + Date.now();
				var template = $('<div id=' + $id + ' vm-keybord></div>');
				mode&&$(template).attr("mode", mode);
				tAttr.templateUrl&&$(template).attr("template-url", tAttr.templateUrl);
				tElement.parent().append(template);
				return function (scope, element, attrs, modelCtrl) {
					var keybord = {
						$modelValue: undefined
					};
					element.attr("readonly", "true");
					element.on('focus', function (event) {
						keybord.$modelValue = scope.$eval(attrs.ngModel) || '';
						scope.$broadcast("vmKeybord.OPEN", $id, keybord);
						element.blur();
					});
					scope.$on('vmKeybord.CLOSE', function (event, keyId, newKeybord) {
						if(keyId==$id){
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
	vmKeybord: function () {
		return {
			restrict: 'A',
			templateUrl: function (element, attrs) {
				return attrs.templateUrl || 'template/keybord1.html';
			},
			scope: true,
			link: function (scope, element, attrs) {
				var viewValue, lastModelVal, lastViewval,keyId=attrs.id;
				var isTouch = ("ontouchstart" in document.documentElement) ? true : false;
				var keybord = scope.keybord = {
					viewValue: undefined,
					modelValue: undefined
				};
				var intLength = 12, dotLength = 2, moveYLength = 30;
				var mode = attrs.mode;
				var MODE_REGEXP = /^(\d+)(\.(\d+))?$/;
				var NUMBER_REGEXP = /^\d+(\.\d*)?$/;
				if (MODE_REGEXP.test(mode)) {
					intLength = parseInt(RegExp.$1, 10);
					dotLength = RegExp.$2 && parseInt(RegExp.$3, 10) || dotLength;
				}
				element.addClass('ng-hide');
				scope.$on('vmKeybord.OPEN', function (event,$id, srcKeybord) {
					if(keyId==$id){
						keybord.modelValue = srcKeybord.$modelValue;
						keybord.viewValue = keybord.modelValue + '';
						viewValue = lastModelVal = lastViewval = keybord.viewValue;
						element.removeClass('ng-hide');
					}
				});
				$(element).on('vmKeybord.vmkey', function (event, key) {
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
				$(element).delegate("[vm-key]", isTouch ? "touchstart" : "mousedown", function (event) {
					keyPressStart.apply(this, arguments);
				});
				$(element).delegate("[vm-key]", isTouch ? "touchend" : "mouseup", function (event) {
					keyPressEnd.apply(this, arguments);
				});
				$(element).delegate("[vm-key]", isTouch ? "touchmove" : "mouseleave", function (event) {
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
							if (dotString.length > dotLength) {// Render the last valid input in the field
								setViewValue(lastViewval);
								return lastModelVal;
							} else if (index == value.length - 1) {
								return parseFloat(value, 10);
							}
						} else if (value.length > intLength) {// Render the last valid input in the field
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
						scope.$emit('vmKeybord.CANCEL',keyId);
						element.addClass('ng-hide');
					} else if (key === "OK") {
						scope.$emit('vmKeybord.CLOSE', keyId,keybord);
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