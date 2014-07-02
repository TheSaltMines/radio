$app.filter('duration', function () {
    return function (seconds) {
      if (seconds) {
        if (seconds<60) {
          return seconds
        } else {
          var minutes = Math.floor(seconds/60);
          var seconds = seconds%60;
          if (seconds<10) seconds = '0'+seconds;
          return minutes+':'+seconds;
        }
      } else {
        return seconds;
      }
    }
  });