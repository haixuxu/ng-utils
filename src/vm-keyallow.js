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
angular.module('vm2.utils').directive('vmKeyallow', function () {
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
				if(REGEX_STRING_REGEXP.test(keyword)){
					rule = new RegExp(RegExp.$1, RegExp.$2);
				}
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