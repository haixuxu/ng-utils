/**
 //     Usage:
 //     <input type="text" vm-number ></input>
 //     All Usage(default):
 //     <input type="text" vm-number mode="12.2">
 */
angular.module('vm2.utils').directive('vmNumber', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attrs, ngModelCtrl) {
			var intLength = 12;            // Maximum int length. Default max ECMA script.
			var dotLength = 2;            // Maximum dot length. Default max ECMA script.
			var decimals =/^\d+$/.test(attrs.decimals)?parseInt(attrs.decimals,10):2;                   // Number of decimals. Default 2.
			var NUMBER_REGEXP = "^\\s*(\\-|\\+)?(\\d+|(\\d*(\\.\\d*)))\\s*$";
			// Create new regular expression with current decimal separator.
			var regex = new RegExp(NUMBER_REGEXP);
			var mode = attrs.mode;
			var MODE_REGEXP = /^(\d+)(\.(\d+))?$/;
			if (MODE_REGEXP.test(mode)) {
				intLength = parseInt(RegExp.$1, 10);
				dotLength = RegExp.$2 && parseInt(RegExp.$3, 10) || dotLength;
			}

			var lastValidValue;                 // Last valid value.
			ngModelCtrl.$parsers.push(parseViewValue);
			element.bind('blur', onBlur);        // Event handler for the leave event.
			function parseViewValue(value) {
				if (angular.isUndefined(value)||value=='') {
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
						if(intString.length>intLength||dotString.length > dotLength){// Render the last valid input in the field
							renderLastValidValue();
						} else {
							lastValidValue = parseFloat(value, 10);
						}
					} else {
						if (value.length > intLength) {// Render the last valid input in the field
							renderLastValidValue();
						} else {
							lastValidValue = parseFloat(value, 10);
						}
					}
				} else {// Render the last valid input in the field
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