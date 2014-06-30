radioApp.controller('CatalogController', ['$scope', '$http', function($scope, $http) {
  $http.get('/data.php').success(function(data) {
    $scope.artists = data;
  });
  
  $scope.getArtistDetail = function($event, $artistKey) {
    $http.get('/data.php?r='+$artistKey).success(function(data) {
      $scope.selectedArtist = data;
    });
  }
}]);