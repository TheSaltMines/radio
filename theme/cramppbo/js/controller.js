

  function getMarkButtons(key) {
    $d = $('<div></div>');
    $d.append(
      $('<div></div>').attr('rel', key).addClass('like').html('Love it!').prepend($('<img>').attr('src','/theme/cramppbo/images/heart.png')).qtip({
        content: {
          text: "Mark this song as a favorite. In the future, you will be able to reference your favorite tracks for easy queueing."
        },
        position: {
          target: 'mouse',
          my: 'bottom center',
          adjust: {
            y: -15
          }          
        },
        show: {
          delay: 1000
        },
        style: {
          classes: 'ui-tooltip-light ui-tooltip-shadow ui-tooltip-rounded'
        }
        
      }).click(function() { 
        $('.qtip').qtip('hide');
        setmark($(this).attr('rel'), 1); 
      })
    ).append(
      $('<div></div>').attr('rel', key).addClass('dislike').html('Hate it!').prepend($('<img>').attr('src','/theme/cramppbo/images/cancel.png')).qtip({
        content: {
          text: "Mark this song as 'disliked.' In the future, this song will play less often when you're listening."
        },
        position: {
          target: 'mouse',
          my: 'bottom center',
          adjust: {
            y: -15
          }          
        },
        show: {
          delay: 1000
        },        
        style: {
          classes: 'ui-tooltip-light ui-tooltip-shadow ui-tooltip-rounded'
        }
        
      }).click(function() { 
        $('.qtip').qtip('hide');
        setmark($(this).attr('rel'), -1); 
      })
    ).click(function() { setmark($(this).attr('rel'), -1); });
    
    return $d;
  }
  
  function getMarkStatus(key, mark) {
    $d = $('<div></div>');  

    switch (parseInt(mark)) {
      case 1:
        $d.append(
          $('<div></div>').addClass('markstatus').html('You love it!').prepend($('<img>').attr('src','/theme/cramppbo/images/heart.png'))
        );
        break;
      case -1:
        $d.append(
          $('<div></div>').addClass('markstatus').html('You hate it!').prepend($('<img>').attr('src','/theme/cramppbo/images/cancel.png'))
        );
        break;
    }
    
    $d.append(
      $('<div></div>').attr('rel', key).addClass('unmark').html('(unmark)').click(function() { setmark($(this).attr('rel'), 0); })        
    );
    
    return $d;
  
  }

  // UI Function: Loads up the contents of the JS:Queue object into the user interface
  function refreshQueueDisplay() {
    $('#queue .track').remove();
    $.each(_QUEUE.q.slice(_QUEUE.ptr), function(i, track) {
      if (i==_QUEUE.ptr) {
        $('.song_title').html(track.name);
        $('.song_artist').html(track.artist);
        $('.song_album').html(track.album);
      }    
    
      $t = $('<div></div>').attr('id', track.key).addClass('track').css('background-image', 'url('+track.icon+')');
      $title = $('<div></div>').addClass('title');
      $track = $('<div></div>').addClass('trackname').append($('<a></a>').attr('href', '#!/'+track.artistKey+"/"+track.albumKey).html(track.name));
      $artist = $('<div></div>').addClass('artist').append($('<a></a>').attr('href', '#!/'+track.artistKey).html(track.artist));
      $title.append($track).append($artist);
      
      if (track.user != null) {
        $userpic = $('<img>').addClass('userpic').attr('src', track.user.icon).attr('width', '14').attr('height', '14');
        $username = $('<div></div>').addClass('username').html('Requested by '+track.user.username);
        $user = $('<div></div>').addClass('user').append($userpic).append($username);

        $t.addClass('request').attr('rel',track.user.username).append($('<div></div>').addClass('indicator')).append($user);
      }
      
      $details = $('<div></div>').addClass('detail');
      if (playerstate==1) {
        if (track.mark==null) {
          $details.append(getMarkButtons(track.key));
        } else {
          $details.append(getMarkStatus(track.key, track.mark));
        }
      } else if (i==0) {
        $details.append($('<img>').attr('src', '/theme/cramppbo/images/play_button_overlay.png').attr('id', 'playbutton').click(function() {
          $(this).attr('src', '/theme/cramppbo/images/ajax-loader-large-dark.gif').delay(2000).fadeOut(500, function() {
            radioplay()
          });
        }));
      }
      
      $t.append($details).append($title);
      if (playerstate==1) {
        $t.hover(function() {
          $('.request[rel='+$(this).attr('rel')+']').find('.user').fadeIn();
          $(this).children('.detail').fadeIn();        
        }, function() {
          $(this).children('.detail').fadeOut();      
          $('.request[rel='+$(this).attr('rel')+']').find('.user').fadeOut();
        });
      }
  
      if (i==0) {
        $('#queue').prepend($t);
      } else {
        $('#queue').append($t);
      }
    });
    
    bind();
  }
    
  function refreshListeners(listeners) {
    $('#toolbar .listeners').empty();
    $.each(listeners, function(i, listener) {
      $l = $('<img>').attr('src', listener.icon).attr('alt', listener.username).attr('title', listener.username).qtip({
        content: {
          text: 'Loading...',
          ajax: {
            url: 'profile.php',
            type: 'GET',
            data: { key: listener.key },
            once: false
          }
        },
        position: {
          my: 'top right',
          adjust: {
            x: -16,
            y: 5
          }          
        },
        style: {
          classes: 'ui-tooltip-dark ui-tooltip-shadow ui-tooltip-rounded'
        }
      });
      $('#toolbar .listeners').append($l);
    })
  }

  function bind() {
   
    $('#toolbar').bind('mouseenter', function() {
      $(this).find('#tools #nowplaying').animate({ top: '-30px' }, 150)
      $(this).find('#tools #ops').animate({ top: 0 }, 150)      
    }).bind('mouseleave blur focusout', function () {
      $(this).find('#tools #nowplaying').animate({ top: 0 }, 150)    
      $(this).find('#tools #ops').animate({ top: '30' }, 150)          
    });
    
    $(window).bind('blur', function() {
      $('#tools #nowplaying').animate({ top: 0 }, 150)    
      $('#tools #ops').animate({ top: '30' }, 150)          
      $('div.qtip:visible').qtip('hide');  
      $('.track .user:visible').fadeOut();    
    });
  
  
    $('li.artist').unbind();
    $('li.artist.closed').unbind().click(function(event, albumKey) {
      node = $(this);
  
      $.ajax({
        url: '/data.php',
        dataType: 'json',
        data: 'r='+$(this).attr('id'),
        async: false,
        beforeSend: function() {
          node.append($('<div class="ajax-loader"></div>'));        
        },
        success: function(d) {
          $('#collection #browser #album').empty();
          for (i=0; i<d.length; i++) {
            if (d[i].canStream) {
              $a = $('<div></div>').addClass('album').attr('id', d[i].key);
              $a.append($('<img>').attr('src',d[i].icon).attr('width','125').attr('height','125'));
              
              $d = $('<div></div>').addClass('detail');
              $d.append($('<h1></h1>').html(d[i].name));
              
              $tracks = $('<ol></ol>');
              $prevtrack = 0;
              for (j=0; j<d[i].tracks.length; j++) {
                if (d[i].tracks[i].canStream && (d[i].tracks[j].trackNum!=$prevtrack)) {
                  $t = $('<li></li>').addClass('track').attr('id', d[i].tracks[j].key).attr('value', d[i].tracks[j].trackNum).html(d[i].tracks[j].name);
                  if (d[i].tracks[j].randomable==1) $t.addClass('randomable');
                  $tracks.append($t);
                }
                $prevtrack = d[i].tracks[j].trackNum;
              }
              $d.append($tracks);
              
              $('#collection #browser #album').append($a.append($d));
            }
          }
          bind();
          $('.ajax-loader').remove();
        },
        complete: function() {
          //alert($('#'+albumKey).position().top);
          if (albumKey.length>0) $('#collection #browser #album').scrollTo('#'+albumKey+' .detail', 400);
        }      
      });
    }).dblclick(function() {
      node = $(this);
  
      $.ajax({
        url: '/data.php',
        dataType: 'json',
        data: 'r='+$(this).attr('id')+'&force=1',

        beforeSend: function() {
          node.append($('<div class="ajax-loader"></div>'));        
        },
        success: function(d) {
          $('#collection #browser #album').empty();
          for (i=0; i<d.length; i++) {
            $a = $('<div></div>').addClass('album closed').attr('id', d[i].key);
            $a.append($('<img>').attr('src',d[i].icon).attr('width','125').attr('height','125'));
            $a.append($('<p></p>').html(d[i].name));
            $('#collection #browser #album').append($a);
          }
          bind();
          $('.ajax-loader').remove();
        }      
      });
    });
    
    $('li.track').unbind().click(function() {
      node = $(this);
      queueTrack($(this).attr('id'));
    });
    
    $('a[href^="#!/"]').unbind().click(function() {
      scrollTo($(this).attr('href').substr(3));
      return false;
    });
  }
  
  function scrollTo(linkInfo) {
    linkInfo = linkInfo.split('/');
    
    $('#collection #browser').slideDown(400, function() {
      $(this).children('#music').scrollTo('#'+linkInfo[0], 800, {
        onAfter: function() { 
          $('#'+linkInfo[0]).trigger('click', [linkInfo[1]]);
        }
      });
    });    
  }
  
  
  if (window.fluid) {
    window.resizeTo(660, 770);
  }