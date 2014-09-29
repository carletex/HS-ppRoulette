'use strict';

var app = angular.module('ppRouletteApp', ['ngRoute']);

app.controller("SessionList", function($scope, $http) {
  $scope.sessions = 'data';
  $http.get('/api')
    .success(function(data){
      $scope.sessions = data;
    })
    .error(function(data, status){
      $scope.sessions = data + status;
    });
});
