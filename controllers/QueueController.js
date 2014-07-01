radioApp.controller('QueueController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {

  $scope.update = function () {
    $http.get('/controller.php?r=getQueue').success(function(data) {
      $scope.queue = data.queue;
    });    
  }
  
  $scope.update();
  $interval(function() {
    $scope.update();
  }, 15000);
}]);