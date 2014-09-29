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


app.controller("SessionList", function($scope, $auth) {
  $scope.authenticate = function(provider) {
    $auth.authenticate(provider);
  };
});
