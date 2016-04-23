<!DOCTYPE html>
<!--[if lt IE 7]><html class="no-js lt-ie9 lt-ie8 lt-ie7"><![endif]-->
<!--[if IE 7]><html class="no-js lt-ie9 lt-ie8"><![endif]-->
<!--[if IE 8]><html class="no-js lt-ie9"><![endif]-->
<!--[if gt IE 8]><!--><html class="no-js"><!--<![endif]-->
<head>
    <!-- Meta -->
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>ISS Orbit</title>
    <meta name="viewport" content="initial-scale = 1.0,maximum-scale = 1.0" />
    <meta name="description" content="Locate the International Space Station using your GPS enabled device.">
    <link rel="author" href="humans.txt" />

    <!-- Web app meta -->
    <meta name="apple-mobile-web-app-title" content="ISS Orbit">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="application-name" content="ISS Orbit"/>
    <?php include_once "includes/_favicons.php"; ?>

    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="css/ui.css" />
    <link rel="stylesheet" type="text/css" href="css/tracking.css" />
    <link rel="stylesheet" type="text/css" href="css/global.css" />
    <link rel="stylesheet" type="text/css" href='http://fonts.googleapis.com/css?family=Inconsolata:400,700'/>
	<link rel="stylesheet" type="text/css" href="css/font-awesome.min.css" />
	<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css"/>
   
    <!-- JS -->
    <script type="text/javascript" src="//code.jquery.com/jquery-1.11.2.min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/three.js/r71/three.js"></script>
    <script type="text/javascript" src="//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js"></script>
    <script src="lib/DeviceOrientationController.js"></script>
    <script src="lib/CanvasRenderer.js"></script>
    <script src="lib/Projector.js"></script>
    <script src="lib/moment-with-locales.min.js"></script>
    <script src="lib/jquery.timeago.js"></script>
    <script src="js/AtSatScene.js"></script>
    <script src="js/spaceApp.js"></script>
    <script src="js/issStts.js"></script>

    <style>
    	body { margin:0px; padding:0px; }
    	#debug-container span { margin:0px 1em;}
    </style>
</head>

<body >
<script type="text/javascript">
	jQuery.timeago.settings.allowFuture = true;
	moment.locale('en');
</script>

    <!--[if lt IE 9]>
        <link rel="stylesheet" href="css/ie.css">
        <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]-->
    
    <div class="infoView-wrapper active" >
      <div class="content-col cen-vert">
        <h1>ISS ORBIT</h1>    
        
    <div id="locationStatus">
    	<div class="requesting">Requesting your location <i class="fa fa-compass fa-spin fa-2x"></i></div>
    	<div class="message error">
    	 <i class="fa fa-exclamation-triangle fa-2x"></i> Sorry, we were unable to determine your location <span></span>
    	</div>
    	<div class="btn hidden retry" style="display:none;">
    		<i class="fa fa-refresh"></i> Click to retry
    	</div>
    	<div class="btn hidden exeter" style="display:none;">
    		<i class="fa fa-compass"></i> Click to set your location to Exeter, UK
    	</div>
    </div>
    
    <div id="passInformation">
        
          <div class="table-wrap clearfix slick">
            <?php include_once "_pass-table.php"; ?>
          </div>

          <p class="stats-note">
            Swipe for more passes<br>
            Ozone: columnar density in Dobson units.<br>
            Nightsky: pass time (in hrs) following sunset.<br>
            Daysky: pass time (in hrs) before sunset</p>
            
          <div class="close-wrapper">
    	      <a href="#" id="info--close" class="close"><i class="fa fa-crosshairs"></i> Locate ISS</a>
          </div>            
            
		</div>

      </div>
      <div class="earth-image"><img src="images/earth-image.jpg"></div>
    </div>
    <!-- #infoView-wrapper -->

    <div id="locatorView" class="locatorView-wrapper">
      <div class="open-holder"><a href="#" id="info--open" class="open">BACK</a></div>
      <div id="locator-overlay" class="next-pass-info">Next Pass: <span ></span></div>
        <div>
        </div>
        <div id="container">
        </div>
             <?php include_once "_html-objects.php"; ?>
    </div>
	<script type="text/javascript">
		doLocation();
	  getTelemetry();
	  setInterval(function(){getTelemetry()}, 15000);
	</script>
</body>
</html>
