angular.module('hypercubeServer.applications')
.controller('ApplicationsCtrl', ['$scope', '$http', '$log', 'applicationsService', function($scope, $http, $log, applicationsService){
		$scope.data = {
			loading:true,
			error:null
		};
		console.log('ApplicationListController');
		applicationsService.get().then(function (applicationsList){
			$log.log('applications list loaded:', applicationsList);
			$scope.data.loading = false;
			$scope.applications = applicationsList;
		}, function (err){
			$log.error('Error loading applications', err);
			$scope.data.loading = false;
			$scope.data.error = err;
		});
		$scope.delete = function(ind){
			$scope.data.loading = true;
			var applicationId = $scope.applications[ind]._id;
			$log.log('calling delete with id:', applicationId);
			applicationsService.del(applicationId).then(function(response){
				$log.log('application deleted successfully');
				$scope.applications.splice(ind, 1);
			}, function(err){
				$log.error('Error loading applications', err);
				$scope.data.loading = false;
				$scope.data.error = err;
			});
		};
}])