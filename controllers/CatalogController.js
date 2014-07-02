$app.controller('CatalogController', ['$scope', '$http', 'QueueService', function($scope, $http, QueueService) {
  $scope.modalShown = false;
  $scope.working = false;
  
  $http.get('/data.php').success(function(data) {
    $scope.artists = data;
  });
  
  $scope.getArtistDetail = function($event, $artistKey) {
    $http.get('/data.php?r='+$artistKey).success(function(data) {
      $scope.selectedArtist = data;
    });
  }
  
  $scope.getTrackDetail = function($albumIndex, $trackIndex) {
    $scope.selectedArtist.selectedAlbum = $scope.selectedArtist[$albumIndex];
    $scope.selectedArtist.selectedAlbum.selectedTrack = $scope.selectedArtist.selectedAlbum.tracks[$trackIndex];
    $scope.toggleModal();
  }
  
  $scope.queueTrack = function($trackKey) {
    $scope.working = true;
    $http.get('/controller.php?r=queue&key='+$trackKey).success(function(data) {
      QueueService.reloadQueue();    
      $scope.toggleModal();      
    }).then(function() {
      $scope.working = false;
    });
  }
  
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
  };    
}]);
