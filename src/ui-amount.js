/**
 * ui-amount directive.
 * Version: 0.0.2 by x373241884y
 *
 //     Usage:
 //     <input type="text" ui-amount mode="12.2" ></input>
 //     <input type="text" ui-amount mode="12.2" symbol='$' formatting='true' ></input>
 //     All Usage(default):
 //     <input type="text" name="testabc" ng-model="testabc" ui-amount mode="12.2" decimals="2" formatting="true"  symbol='$'>
 */
(function () {
	'use strict';
	/* global angular */
	angular.module('vm2.utils', []).directive('uiAmount', ['$locale', function ($locale) {

		return {
			link: link,
			require: 'ngModel',
			restrict: 'A'
		};

		function link(scope, el, attrs, ngModelCtrl) {
			var decimalSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP; //.
			var groupSeparator = $locale.NUMBER_FORMATS.GROUP_SEP; //,
			var intLength = 12;            // Maximum int length. Default max ECMA script.
			var dotLength = 2;            // Maximum dot length. Default max ECMA script.
			var decimals =/^\d+$/.test(attrs.decimals)?parseInt(attrs.decimals,10):2;                   // Number of decimals. Default 2.
			var formatting = attrs.formatting=='false'?false:true; //default true

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
			var symbol = attrs.symbol || '¥';
			// Create parsers and formatters.
			ngModelCtrl.$parsers.push(parseViewValue);
			ngModelCtrl.$formatters.push(formatViewValue);

			el.bind('blur', onBlur);        // Event handler for the leave event.
			el.bind('focus', onFocus);      // Event handler for the focus event.


			/**
			 * Format a number with the thousand group separator.
			 */
			function numberWithCommas(value) {
				if (formatting) {
					var parts = ("" + value).split(decimalSeparator);
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
})();