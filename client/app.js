'use strict';

var app = angular.module('ppRouletteApp', ['ngRoute', 'satellizer']);

app.config(function($authProvider) {
  $authProvider.oauth2({
    url: '/auth/hackerschool',
    name: 'hackerschool',
    clientId: '09ba9c980f22ca1058d4aef36e1daff22d28581010f95265d6b1ae3e09a0d027',
    authorizationEndpoint: 'https://www.hackerschool.com/oauth/authorize',
    redirectUri: "http://127.0.0.1:8000"
  });
});

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/partials/login.html',
      controller: 'LoginController'
    })
    .when('/dashboard', {
      templateUrl: '/partials/dashboard.html',
      controller: 'DashboardController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);


app.controller("LoginController", function($scope, $auth, $location) {

  $scope.isAuthenticated = $auth.isAuthenticated();

  $scope.$watch('isAuthenticated', function(isAuthenticated) {
    if (isAuthenticated){
      $location.path('/dashboard');
    }
  });

  $scope.authenticate = function(provider) {
    $auth.authenticate(provider).then(function (argument) {
      $scope.isAuthenticated = true;
    });
  };

});

app.controller("DashboardController", function($scope, $auth) {
  $scope.user = 'Carlos';
});

