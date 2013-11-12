<?php 
  include("../configuration.php");
  include("../classes/Db.class.php");
  include("../classes/Rdio.class.php");
  include("../classes/User.class.php");
  include("../classes/SearchResult.class.php");  
  include("../classes/Collection.class.php");
  include("../include/functions.php");
  
  $c = new Config();
  $db = new Db();
  $rdio = new Rdio(RDIO_CONSKEY, RDIO_CONSSEC);
  session_start();  
  authenticate();  
  if (in_array($_SERVER['REMOTE_ADDR'], $c->requests_restrict)) { 
  
    $sqlx = "SELECT volume, expires, overridetoken FROM volume WHERE `set`<NOW() AND (expires>NOW() OR expires IS NULL) ORDER BY (expires IS NULL), `set` DESC LIMIT 1";
    $rs = $db->query($sqlx);    
    if (($rec = mysql_fetch_array($rs)) && (is_null($rec['expires']))) {  
      $overridetoken = substr(md5(microtime()),0,20);
      $_SESSION['overridetoken'] = $overridetoken;
    
      $sqlx = "INSERT INTO volume (volume, `set`, expires, overridetoken) VALUES (3, NOW(), DATE_ADD(NOW(), INTERVAL 15 minute), '".$overridetoken."')";
      $db->query($sqlx);
    } elseif ($_SESSION['overridetoken']==$rec['overridetoken']) {
      $sqlx = "DELETE FROM volume WHERE overridetoken='" . $_SESSION['overridetoken'] . "' AND expires>NOW() LIMIT 1";
      $db->query($sqlx);
    }
  }
  header("Location: http://radio.saltmines.us");  
?>

