var cb = {};
var _QUEUE = new musicQueue();
var skip;
var playerstate = 2;
var muting = 0;

// Gets the latest queue from the server and passes it on to the JS:Queue object
// May be redundant with the existance of the updateQueue function.
// Consider combining in the future.
function getQueue() {
  $.ajax({
    url: '/controller.php',
    dataType: 'json',
    data: 'r=getQueue',
    async: false,
    success: function(d) {
      _QUEUE.init(d.queue);
      skip = d.timestamp - d.queue[0].startplay;      
      if (loggedIn) {
        player().rdio_play(_QUEUE.getNext().key);
      } else {
        _QUEUE.updateQueue(d.queue);
        if (window.fluid) { 
          window.fluid.dockBadge = _QUEUE.length();
        }
        refreshQueueDisplay();  
        refreshListeners(d.listeners);         
      }

    }
  });
}

// Get the latest queue from the server and pass it on to the JS:Queue object for processing.
function updateQueue() {
  $.ajax({
    url: '/controller.php',
    dataType: 'json',
    data: 'r=getQueue',
    success: function(d) {
      _QUEUE.updateQueue(d.queue);
      if (window.fluid) { 
        window.fluid.dockBadge = _QUEUE.length();
      }
      refreshQueueDisplay();  
      refreshListeners(d.listeners);    
    }
  });
  
  return true;
}

function playerMute() {
  player().rdio_setMute(1);
  window.fluid.removeDockMenuItem('Mute');
  window.fluid.addDockMenuItem('Unmute', function() { playerUnmute() });
}

function playerUnmute() {
  player().rdio_setMute(0);
  window.fluid.removeDockMenuItem('Unmute');
  window.fluid.addDockMenuItem('Mute', function() { playerMute() });
}


///////////////////////////////////////////
// Rdio SWF callback function assignments
///////////////////////////////////////////
cb.ready = function() {
/*
  if (window.fluid) {
    window.fluid.addDockMenuItem('Mute', function() { playerMute() });
  }
*/
  player().rdio_clearQueue();
  getQueue();
}

cb.playingTrackChanged = function(newTrack) {
  $('.song_title').html(newTrack.name);
  $('.song_artist').html(newTrack.artist);
  $('.song_album').html(newTrack.album);
}


cb.playStateChanged = function(state) {
  if (state==1) { // PLAY
    if (playerstate!=1) {
      if (skip>0) {
        player().rdio_seek(skip);
        skip = -1;
      }  

      updateQueue();
      playerstate=1;
    }
  } else
  if (state==2) { // STOP
    if (playerstate!=2) {
      playerstate=2;
      player().rdio_play(_QUEUE.getNext().key);
    }
  }
}

cb.playingSomewhereElse = function() {
  display("Sorry, you're streaming Rdio somewhere else");
}

cb.positionChanged = function(pos) {
  $('.progress').each(function() {
    progress = $(this);
    slider = progress.children('.slider');
    slider.css('width', parseInt(progress.width()*(pos/_QUEUE.currentTrack().duration))+'px');
    progress.find('.time_current').html(parseInt(pos/60)+':'+('0'+parseInt(pos%60)).substr(-2,2));
    progress.find('.time_total').html(parseInt(_QUEUE.currentTrack().duration/60)+':'+('0'+parseInt(_QUEUE.currentTrack().duration%60)).substr(-2,2))
  });
}

cb.volumeChanged = function(level) {
  if (muting!=1) {
    setVolumeIndicator(level);
  } else {
    muting = 0;
  }
}

function setVolumeIndicator(level) {
  $('#volume').children().each(function(i, e) {
    if (i<level) {
      $(e).attr('src','/theme/cramppbo/images/volnotch.gif');
    } else {
      $(e).attr('src','/theme/cramppbo/images/volnotchoff.gif');
    }
  });
}

$(document).ready(function() {

  function localbind() {
    $('.player_mute').unbind().click(function() {
      player().rdio_setMute(1);
      $(this).attr('src','/theme/cramppbo/images/tools/sound_mute.png').addClass('player_unmute').removeClass('player_mute');
      localbind();
    });
    
    $('.player_unmute').unbind().click(function() {
      muting = 1;
      player().rdio_setMute(0);
      $(this).attr('src','/theme/cramppbo/images/tools/sound_high.png').addClass('player_mute').removeClass('player_unmute');    
      localbind();      
    });
  }
  
  $('#volume img').click(function() {
    level = $(this).attr('rel');
    volume = $(this).parent();
    player().rdio_setVolume($(this).attr('rel')/10);
    setVolumeIndicator(level);
  })

  $('#collection .header').click(function() {
    $('#collection #browser').slideToggle();
  });
  
  $('#welcomelink').fancybox({
    'width': 700,  
    'padding': 0
  });
  
  $('#errorlink').fancybox({
    'width': 300,
    'showCloseButton': false
  })

  var flashvars = {
    'playbackToken': playbackToken,
    'domain': domain,
    'listener': 'cb'
    };
  var params = {
    'allowScriptAccess': 'always'
  };
  var attributes = {};
  swfobject.embedSWF(api_swf, 'api_swf', 1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
  bind();
  localbind();
})

function player() {
  return $('#api_swf').get(0);
}

function display(msg) {
  if (window.fluid) {
    $c = new Config();
    
    window.fluid.showGrowlNotification({
        title: 'rrrrradio', 
        description: msg
    });
  } else {
    $close = $('<br /><br /><a href="javascript:;" onClick="$.fancybox.close();">ok</a>');
    $('#error #message').html(msg).append($close);  
    $('#errorlink').trigger('click')
  }
}
