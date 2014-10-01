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
      controller: 'DashboardController',
      resolve: {
        authenticated: ['$location', '$auth', function($location, $auth) {
          if (!$auth.isAuthenticated()) {
            return $location.path('/');
          }
        }]
      }
    })
    .when('/session/add', {
      templateUrl: '/partials/session_new.html',
      controller: 'SessionController',
      resolve: {
        authenticated: ['$location', '$auth', function($location, $auth) {
          if (!$auth.isAuthenticated()) {
            return $location.path('/');
          }
        }]
      }
    })
    .when('/session/join', {
      templateUrl: '/partials/session_join.html',
      controller: 'MatchingController',
      resolve: {
        authenticated: ['$location', '$auth', function($location, $auth) {
          if (!$auth.isAuthenticated()) {
            return $location.path('/');
          }
        }]
      }
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

app.controller("DashboardController", function($scope, $http) {
  $http.get('/api/user/me')
    .success(function(data, status, headers, config) {
      $scope.user = data;
    });
  $http.get('/api/session/status')
    .success(function(data, status, headers, config) {
      $scope.sessionStatus = data;
    });
});


app.controller("SessionController", function($scope, $http, $location) {

  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();

  var hourOptions = $('#hour > option');
  var minuteOptions = $('#hour > option');

  for (var i = 0; i < hourOptions.length; i++) {
    if(hourOptions.eq(i).val() < hour) {
      hourOptions.eq(i).attr('disabled', 'disabled');
    }
  }

  $scope.hour = hour;

  $scope.minute = 0;

  $scope.addSession = function() {
    var session = {
      "description": $scope.description,
      "hour": $scope.hour,
      "minute": $scope.minute,
    };

    $http.post('/api/session', session)
      .success(function(data, status, headers, config) {
        $location.path('/dashboard');
      })
      .error(function(data, status, headers, config) {
        throw 'Error' + status;
      });
  };
});

app.controller("MatchingController", function($scope, $http) {

  $scope.joinSession = function() {
    $http.post('/api/session/random')
      .success(function(data, status, headers, config) {
        $scope.paired = true;
        $scope.data = data;
      })
      .error(function(data, status, headers, config) {
        throw 'Error' + status;
      });
  }

});


angular.module('ppRouletteApp')
  .directive('ampm', function () {
    return {
      restrict: 'A',
      link : function (scope, element, attrs, ngModelCtrl) {
        $(function() {
          var $hour = $('#hour');
          $hour.on('change', function(event) {
            if($hour.val() < 12) {
              $('#ampm').html('am');
            } else {
              $('#ampm').html('pm');
            }
          });
        });
      }
    };
  });
