$app.factory('QueueService', function($rootScope) {
    var serviceInstance = {};

    serviceInstance.reloadQueue = function() {
      $rootScope.$broadcast('reloadQueue');
    }
    
    return serviceInstance;
  });