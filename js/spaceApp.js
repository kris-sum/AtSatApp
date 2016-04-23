"use strict";

function webglAvailable() {
	try {
		var canvas = document.createElement( 'canvas' );
		return !!( window.WebGLRenderingContext && (
				canvas.getContext( 'webgl' ) ||
				canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
}

function getXYZfromAzEl(azimuth, elevation, R) { 
	/**
	 * Three JS has y as the vertical axis and z as the 'depth' axis, 
	 * unlike most reference materials
	 */
	var azimuthRad   = THREE.Math.degToRad(azimuth - 90)
	var elevationRad = THREE.Math.degToRad(90 - elevation)
	
	var x = (R * Math.sin(elevationRad) * Math.cos(azimuthRad)).toFixed(2);
	var z = (R * Math.sin(elevationRad) * Math.sin(azimuthRad)).toFixed(2);
	var y = (R * Math.cos(elevationRad)).toFixed(2);
	
	return { "x": x, "y":y, "z": z }
}

var locationTimeout = 0;

function doLocation () {
	
	locationTimeout=1;
	setTimeout(function() {
		
		if (locationTimeout==1) {
			$(window).trigger("location/error", 'Timed out waiting for device location');
		}
		locationTimeout = 0;
	},5000)
	
	if (navigator && navigator.geolocation) {

		navigator.geolocation.getCurrentPosition(function(position) {
				// success
				var locationData = {
						altitude: position.coords.altitude,
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
				};
				locationTimeout = 0;
				$(window).trigger("location/updated", locationData);
			}, function(err) {
				// error
				locationTimeout = 0;
				$(window).trigger("location/error", err.message);
			},  
		{
				enableHighAccuracy: false,
				timeout: 5000,
				maximumAge: 3600
		});
	} else {
		locationTimeout = 0;
		$(window).trigger("location/error", 'Location info is not supported on this device');
	}
}

var myScene = {};

$(document).ready(function(){

	$(".infoView-wrapper").addClass("active"); // inital page load display view
  
  	$("#info--open").click(function() {
		$(".infoView-wrapper").addClass("active");
	});

	$("#info--close").click(function() {
		$(".infoView-wrapper").removeClass("active");
	});
	
	myScene = new AtSatScene();
	myScene.startRendering();
	
});
