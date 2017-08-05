/**
 *  directive    key-allow
 *  value    number    允许输入数字
 *  value    word    允许输入数字、字母
 *  value   tel     允许输入数字、-
 *  value   amount  允许输入数字和小数点
 *  usage    key-allow   key-allow="number|word|symbol"
 */
/**
 * vm-keyallow directive.
 * Version: 0.0.1 by x373241884y
 //     Usage:
 //     <input type="text" vm-keyallow ></input>
 //     All Usage(default):
 //     <input type="text" vm-keyallow max="11">
 */
(function (window, angular) {
	angular.module('vm2.utils').directive('vmKeyallow', function () {

		var defaultMasks = {
			"number": /^\d*$/,
			"word": /^[0-9a-zA-Z]*$/,
			"tel": /^[0-9-]*$/,
			"amount": /^\d+(\.\d*)?$/,
		};
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attrs, modelCtrl) {
				if (attrs.type != 'text') {
					throw Error("element must be type='text'");
				}
				var keyword = attrs.vmKeyallow, rule, lastValidVal;
				if (defaultMasks[keyword]) {
					rule = defaultMasks[keyword];
				} else {
					console.log(keyword);
					rule = keyword;
				}
				modelCtrl.$parsers.push(function (inputValue) {
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
})(window, angular);