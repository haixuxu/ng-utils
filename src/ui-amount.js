/**
 * Numeric directive.
 * Version: 1.0.0
 *
 * Numeric only input. Limits input to:
 * - max value: maximum input value. Default undefined (no max).
 * - min value: minimum input value. Default undefined (no min).
 * - decimals: number of decimals. Default 2.
 * - formatting: apply thousand separator formatting. Default true.
 */
(function () {
	'use strict';
	if(typeof module !== 'undefined') {
		module.exports = 'purplefox.numeric';
	}

	/* global angular */
	angular.module('vm2.utils',[]).directive('uiAmount', numeric);

	numeric.$inject = ['$locale'];

	function numeric($locale) {
		// Usage:
		//     <input type="text" decimals="3" min="-20" max="40" formatting="false" ></input>
		// Creates:
		//
		var directive = {
			link: link,
			require: 'ngModel',
			restrict: 'A'
		};
		return directive;


		function link(scope, el, attrs, ngModelCtrl) {
			console.log(el[0]);
			var decimalSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
			var groupSeparator = $locale.NUMBER_FORMATS.GROUP_SEP;

			// Create new regular expression with current decimal separator.
			var NUMBER_REGEXP = "^\\s*(\\-|\\+)?(\\d+|(\\d*(\\.\\d*)))\\s*$";
			var regex = new RegExp(NUMBER_REGEXP);

			var formatting = true;
			var maxInputLength = 16;            // Maximum input length. Default max ECMA script.
			var max;                            // Maximum value. Default undefined.
			var min;                            // Minimum value. Default undefined.
			var limitMax = true;                // Limit input to max value (value is capped). Default true.
			var limitMin = true;                // Limit input to min value (value is capped). Default true.
			var decimals = 2;                   // Number of decimals. Default 2.
			var lastValidValue;                 // Last valid value.

			// Create parsers and formatters.
			ngModelCtrl.$parsers.push(parseViewValue);
			// ngModelCtrl.$parsers.push(minValidator);
			// ngModelCtrl.$parsers.push(maxValidator);
			// ngModelCtrl.$formatters.push(formatViewValue);

			el.bind('blur', onBlur);        // Event handler for the leave event.
			el.bind('focus', onFocus);      // Event handler for the focus event.

			// Put a watch on the min, max and decimal value changes in the attribute.
			scope.$watch(attrs.min, onMinChanged);
			scope.$watch(attrs.max, onMaxChanged);
			scope.$watch(attrs.limitMax, onLimitMaxChanged);
			scope.$watch(attrs.limitMin, onLimitMinChanged);
			scope.$watch(attrs.decimals, onDecimalsChanged);
			scope.$watch(attrs.formatting, onFormattingChanged);
			var symbol = attrs.symbol || '¥';
			// Setup decimal formatting.
			if (decimals > -1) {
				ngModelCtrl.$parsers.push(function (value) {
					return (value) ? round(value) : value;
				});
				ngModelCtrl.$formatters.push(function (value) {
					return (value) ? formatPrecision(value) : value;
				});
			}

			function onMinChanged(value) {
				if (!angular.isUndefined(value)) {
					min = parseFloat(value);
					lastValidValue = minValidator(ngModelCtrl.$modelValue);
					ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
					ngModelCtrl.$render();
				}
			}

			function onMaxChanged(value) {
				if (!angular.isUndefined(value)) {
					max = parseFloat(value);
					maxInputLength = calculateMaxLength(max);
					lastValidValue = maxValidator(ngModelCtrl.$modelValue);
					ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
					ngModelCtrl.$render();
				}
			}

			function onDecimalsChanged(value) {
				if (!angular.isUndefined(value)) {
					decimals = parseFloat(value);
					maxInputLength = calculateMaxLength(max);
					if (lastValidValue !== undefined) {
						ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
						ngModelCtrl.$render();
					}
				}
			}

			function onFormattingChanged(value) {
				if (!angular.isUndefined(value)) {
					formatting = (value !== false);
					ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
					ngModelCtrl.$render();
				}
			}

			function onLimitMinChanged(value) {
				if (!angular.isUndefined(value)) {
					limitMin = (value == "true");
				}
			}

			function onLimitMaxChanged(value) {
				if (!angular.isUndefined(value)) {
					limitMax = (value == "true");
				}
			}

			/**
			 * Round the value to the closest decimal.
			 */
			function round(value) {
				var d = Math.pow(10, decimals);
				return Math.round(value * d) / d;
			}

			/**
			 * Format a number with the thousand group separator.
			 */
			function numberWithCommas(value) {
				if (formatting) {
					var parts = (""+value).split(decimalSeparator);
					parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
					return parts.join(decimalSeparator);
				}
				else {
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
				return symbol+numberWithCommas(formattedValue);
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
				if(value==null){
					value = '';
				}
				value = (""+value).replace(symbol, '');
				console.log(value);
				value = (""+value).replace(decimalSeparator, '.');

				// Handle leading decimal point, like ".5"
				if (value.indexOf('.') === 0) {
					value = '0' + value;
				}

				// Allow "-" inputs only when min < 0
				if (value.indexOf('-') === 0) {
					if (min >= 0) {
						value = null;
						ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
						ngModelCtrl.$render();
					}
					else if (value === '-') {
						value = '';
					}
				}

				var empty = ngModelCtrl.$isEmpty(value);
				if (empty) {
					lastValidValue = '';
					//ngModelCtrl.$modelValue = undefined;
				}
				else {
					if (regex.test(value) && (value.length <= maxInputLength)) {
						if ((value > max) && limitMax) {
							lastValidValue = max;
						}
						else if ((value < min) && limitMin) {
							lastValidValue = min;
						}
						else {
							lastValidValue = (value === '') ? null : parseFloat(value);
						}
					}
					else {
						// Render the last valid input in the field
						ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
						ngModelCtrl.$render();
					}
				}

				return lastValidValue;
			}

			/**
			 * Calculate the maximum input length in characters.
			 * If no maximum the input will be limited to 16; the maximum ECMA script int.
			 */
			function calculateMaxLength(value) {
				var length = 16;
				if (!angular.isUndefined(value)) {
					length = Math.floor(value).toString().length;
				}
				if (decimals > 0) {
					// Add extra length for the decimals plus one for the decimal separator.
					length += decimals + 1;
				}
				if (min < 0) {
					// Add extra length for the - sign.
					length++;
				}
				return length;
			}

			/**
			 * Minimum value validator.
			 */
			function minValidator(value) {
				if (!angular.isUndefined(min) && limitMin) {
					if (!ngModelCtrl.$isEmpty(value) && (value < min)) {
						return min;
					} else {
						return value;
					}
				}
				else {
					if (!limitMin) {
						ngModelCtrl.$setValidity('min', !(value < min));
					}
					return value;
				}
			}

			/**
			 * Maximum value validator.
			 */
			function maxValidator(value) {
				if (!angular.isUndefined(max) && limitMax) {
					if (!ngModelCtrl.$isEmpty(value) && (value > max)) {
						return max;
					} else {
						return value;
					}
				}
				else {
					if (!limitMax) {
						ngModelCtrl.$setValidity('max', !(value > max));
					}
					return value;
				}
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
					ngModelCtrl.$viewValue = (""+value).replace(".", decimalSeparator);
					ngModelCtrl.$render();
				}
			}
		}
	}

})();
