/**
 * ui-amount directive.
 * Version: 0.0.1 by x373241884y
 //     Usage:
 //     <input type="text" ui-onlynumber ></input>
 //     All Usage(default):
 //     <input type="text" ui-onlynumber mode="12.2">
 */
(function (window, angular) {
	angular.module('vm2.utils').directive('uiOnlynumber', function () {
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
				if(attrs.type=='number'&&dotLength>0){
					var count = 0,lastval;
					element.bind('keydown', function (event) {
						if(event.keyCode==190){
							count++;
							if(count>1){
								scope.$apply(function () {
									scope[attrs.ngModel] = undefined;
								});
								event.stopPropagation();
								event.preventDefault();
								count = 0;
							}else{
								lastval = element.val();
							}
						}else{
							lastval = element.val();
						}
					});
				}
				function parseViewValue(value) {
					console.log(value);
					if (angular.isUndefined(value)) {
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
})(window, angular);