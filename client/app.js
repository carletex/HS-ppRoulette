'use strict';

var app = angular.module('ppRouletteApp', ['ngRoute', 'satellizer']);

app.config(function($authProvider) {

    $authProvider.hackerschool({
      clientId: '0dcf15561cd59ddd398c74118fc24ddfb1670cfeb3fa0816a540d68ae5df7c85'
    });

  });

app.controller("SessionList", function($scope) {

  $scope.authenticate = function(provider) {
      $auth.authenticate(provider);
  };

});
