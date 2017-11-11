/**
 * Created by toor on 17-11-11.
 */
var app = angular.module('app', ['ngRoute','vm2.utils']);

app.config(['$routeProvider','$controllerProvider', function($routeProvider,$controllerProvider){
    $controllerProvider.allowGlobals();
    var _when=$routeProvider.when;
    $routeProvider.when = function () {
        if(arguments.length===3){
            var cls = arguments[2];
            if(cls=='mobile') {
                $(document.body).removeClass('desktop');
                $(document.body).addClass('mobile');
            }else{
                $(document.body).removeClass('mobile');
                $(document.body).addClass('desktop');
            }
        }
        return _when.apply($routeProvider, arguments);
    };
    $routeProvider
        .when('/',{templateUrl:'htmls/home.html'})
        .when('/amount',{templateUrl:'htmls/example/amount.html'})
        .when('/number',{templateUrl:'htmls/example/number.html'})
        .when('/keyallow',{templateUrl:'htmls/example/keyallow.html'})
        .when('/keyfilter',{templateUrl:'htmls/example/keyfilter.html'})
        .when('/keybord',{templateUrl:'htmls/example/keybord.html'},'mobile')
        .otherwise({redirectTo:'/'});
}]);
app.controller("mainCtrl", ["$scope", "$http",function ($scope, $http) {

    $scope.changeBook = function (event, id) {

    }
}]);
