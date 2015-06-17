angular.module('hypercubeServer.account')
.controller('AccountCtrl', ['$scope','AuthService', '$state', function($scope, AuthService, $state){
	
	// set-up loading state
	$scope.signupForm = {
		loading: false,
		error:null
	};
	$scope.loginForm = {
		loading: false,
		error:null
	};

	// --------------- Auth Session ----------------- //
	$scope.login = function() {
		$scope.loginForm.loading = true;
		AuthService.login($scope.loginForm)
		.then(function (authData){
			console.log('Successful login:', authData);
			$scope.loginForm.loading = false;
			$scope.showToast("Logged in");
			$state.go('users');
		}, function (err){
			$scope.loginForm = {loading:false, email:null, password:null};
		});
	};
	$scope.logout = function(){
		AuthService.logout().then(function(){
			console.log('logout successful');
      // $scope.showToast('Successfully Logged Out');
			//TODO: Refresh page after logout
			$state.go('home');
		}, function(err){
			console.error('error logging out');
		});
	};
	$scope.signup = function(){
		AuthService.signup($scope.signupForm).then(function(){
			console.log('Signup successful');
			//TODO: Refresh page after logout
      // $scope.showToast('Successfully signed up');
			$state.go('users');
		}, function(err){
			console.error('error siging up:', err);
		});
	};
}])