$app.controller('QueueController', ['$scope', '$http', '$interval', function($scope, $http, $interval, QueueService) {

  $scope.update = function () {
    $http.get('/controller.php?r=getQueue').success(function(data) {
      $scope.queue = data.queue;
    });    
  }
  
  $scope.update();
  $interval(function() {
    $scope.update();
  }, 150000);
  
  $scope.$on('reloadQueue', function() {
    $scope.update();
  });
}]);
