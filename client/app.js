'use strict';

var app = angular.module('ppRouletteApp', ['ngRoute', 'satellizer', 'mm.foundation', 'mm.foundation.topbar']);

app.config(function($authProvider) {
  $authProvider.oauth2({
    url: '/auth/hackerschool',
    name: 'hackerschool',
    clientId: '2d82c40289390d68a60bb3cefec941d3b9f39000ca83edfc6b7ca6b6863e3b00',
    authorizationEndpoint: 'https://www.hackerschool.com/oauth/authorize',
    redirectUri: "http://roulette.herokuapp.com/"
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
    .when('/session/list', {
      templateUrl: '/partials/session_list.html',
      controller: 'SessionListController',
      resolve: {
        authenticated: ['$location', '$auth', function($location, $auth) {
          if (!$auth.isAuthenticated()) {
            return $location.path('/');
          }
        }]
      }
    })
    .when('/settings', {
      templateUrl: '/partials/settings.html',
      controller: 'SettingsController',
      resolve: {
        authenticated: ['$location', '$auth', function($location, $auth) {
          if (!$auth.isAuthenticated()) {
            return $location.path('/');
          }
        }]
      }
    })
    .when('/logout', {
      resolve: {
        logout: ['$location', '$auth', function($location, $auth) {
          $auth.logout();
          return $location.path('/');
        }]
      }
    })
    .otherwise({
      redirectTo: '/'
    });
}]);


app.controller("AuthController", function($scope, $auth, $location) {
  $scope.isAuthenticated = $auth.isAuthenticated();
});

app.controller("LoginController", function($scope, $auth, $location) {

  $scope.isAuthenticated = $auth.isAuthenticated();

  $scope.$watch('isAuthenticated', function(isAuthenticated) {
    if (isAuthenticated){
      $location.path('/dashboard');
    }
  });

  $scope.authenticate = function(provider) {
    $auth.authenticate(provider).then(function(argument) {
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

  $scope.hour = hour;
  $scope.minute = 0;
  $scope.day = 'today';

  if (now.getDay() === 5 || now.getDay() === 6 || now.getDay() === 0) {
    $scope.day = 'monday';
    $scope.hour = 11;
  } else if (hour < 18) {
    for (var i = 0; i < hourOptions.length; i++) {
      if(hourOptions.eq(i).val() < hour) {
        hourOptions.eq(i).attr('disabled', 'disabled');
      }
    }
  } else {
    $scope.day = 'tomorrow';
    $scope.hour = 11;
  }

  $scope.addSession = function() {
    var session = {
      "description": $scope.description,
      "day": $scope.day,
      "hour": $scope.hour,
      "minute": $scope.minute,
    };

    $http.post('/api/session/add', session)
      .success(function(data, status, headers, config) {
        if(!data.error) {
          $location.path('/dashboard');
        } else {
          $scope.error = data;
        }
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
        if(data.error === 'no credit') {
          $scope.paired = false;
          $scope.errorMessage = "I'm sorry, Dave. I'm afraid I can't do that. You need at least one credit. "+
          "Please open a session to gain credit!";
        } else {
          $scope.paired = true;
          $scope.data = data;
        }
      })
      .error(function(data, status, headers, config) {
        throw 'Error' + status;
      });
  };

});


app.controller("SessionListController", function($scope, $http) {
  $http.get('/api/session/list')
    .success(function(data, status, headers, config) {
      $scope.sessions = data;
    }).error(function(data, status, headers, config) {
      throw 'Error' + status;
    });
});


app.controller("SettingsController", function($scope, $http, $location) {
  $http.get('/api/user/me')
    .success(function(data, status, headers, config) {
      $scope.zulipEmail = data.zulipEmail;
    });

  $scope.updateSettings = function() {
    var postData = {
      zulipEmail: $scope.zulipEmail
    };

    $http.post('/api/user/me', postData)
      .success(function(data, status, headers, config) {
        $location.path('/dashboard');
      })
      .error(function(data, status, headers, config) {
        throw 'Error' + status;
      });
  };
});


angular.module('ppRouletteApp')
  .directive('ampm', function() {
    return {
      restrict: 'A',
      link : function(scope, element, attrs, ngModelCtrl) {
        $(function() {
          var $hour = $('#hour');
          var adjustTime = function() {
            if($hour.val() < 12) {
              $('#ampm').html('am');
            } else {
              $('#ampm').html('pm');
            }
          };
          adjustTime();
          $hour.on('change', function(event) {
            adjustTime();
          });
        });
      }
    };
  });
