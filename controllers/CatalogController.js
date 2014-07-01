radioApp.controller('CatalogController', ['$scope', '$http', function($scope, $http) {
  $scope.modalShown = false;
  $http.get('/data.php').success(function(data) {
    $scope.artists = data;
  });
  
  $scope.getArtistDetail = function($event, $artistKey) {
    $http.get('/data.php?r='+$artistKey).success(function(data) {
      $scope.selectedArtist = data;
    });
  }
  
  $scope.getTrackDetail = function($event, $albumIndex, $trackIndex) {
    $scope.selectedArtist.selectedAlbum = $scope.selectedArtist[$albumIndex];
    $scope.selectedArtist.selectedAlbum.selectedTrack = $scope.selectedArtist.selectedAlbum.tracks[$trackIndex];
    console.log($scope.selectedArtist.selectedAlbum);
    $scope.toggleModal();
  }
  
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
  };    
}]);