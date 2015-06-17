angular.module('hypercubeServer.nav')
.controller('NavCtrl', ['$scope', 'AuthService', function ($scope, AuthService){
  $scope.logout = function () {
    AuthService.logout().then(function () {
      $scope.showToast("Logout Successful");
      $state.go('home');
    }, function (err){
      console.error('Error logging out:', err);
      $state.go('home');
    });
  };
}])