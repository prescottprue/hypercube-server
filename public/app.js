angular.module('hypercubeServer', [
    'ui.router', 
    'ngMaterial', 
    'ngStorage', 
    'angular-jwt',

    'hypercubeServer.auth',
    'hypercubeServer.account',
    'hypercubeServer.nav',
    'hypercubeServer.home', 
    'hypercubeServer.roles', 
    'hypercubeServer.users'
  ])
    .config(function ($httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });
.directive('stopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('mouseover', function (e){
        e.stopPropagation();
      })
      element.bind('click', function (e) {
        e.stopPropagation();
      });
    }
  };
 });