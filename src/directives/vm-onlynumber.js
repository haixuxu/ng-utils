/**
 //     Usage:
 //     <input type="text" vm-onlynumber ></input>
 //     All Usage(default):
 //     <input type="text" vm-onlynumber max="11">
 */
angular.module('vm2.utils').directive('vmOnlynumber', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attrs, modelCtrl) {
			if(attrs.type!='text'){
				throw Error("element must be type='text'");
			}
			var max = -1,lastValidVal;
			if(/^\d+$/.test(attrs.max)) {
				max = parseInt(attrs.max);
			}
			modelCtrl.$parsers.push(function (inputValue) {
				if (inputValue == undefined) return '';
				if (/^\d+$/.test(inputValue)) {
					if(max>0&&inputValue.length>max){
						modelCtrl.$setViewValue(lastValidVal);
						modelCtrl.$render();
					}else{
						lastValidVal = inputValue;
					}
				}else{
					modelCtrl.$setViewValue(lastValidVal);
					modelCtrl.$render();
				}
				return lastValidVal;
			});
		}
	};
});