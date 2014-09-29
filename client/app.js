'use strict';

var app = angular.module('ppRouletteApp', ['ngRoute', 'satellizer']);

app.config(function($authProvider) {
  $authProvider.oauth2({
    url: '/auth/hackerschool',
    name: 'hackerschool',
    clientId: '0dcf15561cd59ddd398c74118fc24ddfb1670cfeb3fa0816a540d68ae5df7c85',
    authorizationEndpoint: 'https://www.hackerschool.com/oauth/authorize',
    redirectUri: window.location.origin,
    scope: [],
    scopeDelimiter: ' ',
    display: 'popup',
    type: '2.0',
    popupOptions: { width: 1000, height: 500 }
  });
});


app.controller("SessionList", function($scope, $auth) {
  $scope.authenticate = function(provider) {
    $auth.authenticate(provider);
  };
});
