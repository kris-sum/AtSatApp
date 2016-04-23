"use strict";

function AtSatScene() {

	this.PI2 = Math.PI * 2;
	this.API_URL = '/api/iss1.py';
	this.renderWidth = 0;
	this.rednerHeight = 0;

	this.worldsize = 200;
	this.radiusSatellites = 190;
	this.radiusPlanets= 195;
	this.radiusStars = 198;
	this.iss = {};
	
	this.userPosition = {};
	this.apiData = {};

	this.scene = {}
	this.sceneRenderer = {};
	this.sceneCamera = {}
	this.sceneControls = {}
	this.sceneObjects = {
			satellites: {
				iss : { } 
			},
			planets: { },
			stars: { }
	};
	
	this.init();
	this.bindEvents();

}

/**
 * Scene setup
 */
AtSatScene.prototype.init = function(){ 
	
	var $container = $('#container');

	if ( webglAvailable() ) {
		this.sceneRenderer= new THREE.WebGLRenderer();
	} else {
		this.sceneRenderer = new THREE.CanvasRenderer();
	}
	this.sceneRenderer.setSize( window.innerWidth,  window.innerHeight);
	


	this.scene = new THREE.Scene();
	
	this.sceneCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 500 );

	this.sceneControls = new DeviceOrientationController( this.sceneCamera, this.sceneRenderer.domElement );
	this.sceneControls.connect();

	this.sceneCamera.position.x = 0;
	this.sceneCamera.position.y = 5; // we need to be slightly higher to see our North line!
	this.sceneCamera.position.z = 0;

	$container.append(this.sceneRenderer.domElement);
	
	this.renderWidth = this.sceneRenderer.context.canvas.width;
	this.renderHeight = this.sceneRenderer.context.canvas.height;
	
	this.addWorld();
	this.addCompass();
	this.addISS();
	this.addSunAndMoon();
	
	return this;

}

/**
 * Bind event listeners
 */
AtSatScene.prototype.bindEvents = function () { 
	window.addEventListener( 'resize', function(){
		this.onWindowResize();
	}.bind(this), false );
	
	setInterval(function(){ 
		this.getApiData();
		}.bind(this), 3000);
	
	$(window).on("datafeed/updated",function() {
		this.updatePositions();
	}.bind(this));
	
	$(window).on("location/updated", function(event, locationData) {
		this.userPosition = locationData;
	}.bind(this));
	
	
}

AtSatScene.prototype.onWindowResize = function () {
	this.sceneRenderer.setSize( window.innerWidth, window.innerHeight );
	this.sceneCamera.aspect = window.innerWidth / window.innerHeight;
	this.sceneCamera.updateProjectionMatrix();
	
	this.renderWidth = this.sceneRenderer.context.canvas.width;
	this.renderHeight = this.sceneRenderer.context.canvas.height;
	
}

/**
 * This function must be called to start the scene rendering
 */
AtSatScene.prototype.startRendering = function(){
	requestAnimationFrame(this.startRendering.bind(this));
	this.render();
	return this;
}

/**
 * This method is called every scene tick (up to 60fps) 
 */
AtSatScene.prototype.render = function(){
	this.sceneControls.update();
	this.sceneRenderer.render( this.scene, this.sceneCamera );
	this.update2d();
}

/**
 * Draw the world sphere that the camera is contained in.
 */
AtSatScene.prototype.addWorld = function(){ 
	
	// set up the sphere vars
	var segments = 16,
	rings = 16;

	if (webglAvailable()) {
		var spaceBackground = THREE.ImageUtils.loadTexture( 'images/background.jpg' );
		spaceBackground.minFilter = THREE.NearestFilter;
		var spaceMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.4, map: spaceBackground, side:  THREE.BackSide} );
	} else {
		var spaceMaterial = new THREE.MeshBasicMaterial({
			"wireframe":true,
		});
		spaceMaterial.side = THREE.BackSide;
	}
	
	// DEBUG
	//var spaceMaterial = new THREE.MeshBasicMaterial({
	//	"wireframe":true,
	//});
	//spaceMaterial.side = THREE.BackSide;

	// new THREE.MeshNormalMaterial()
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(
			this.worldsize,
			segments,
			rings
		),
		spaceMaterial
	);

	// add the sphere to the scene
	this.scene.add(sphere);
	
	// create a light source
	var ambient = new THREE.AmbientLight( 0xFFFFFF );
	this.scene.add( ambient );
	
	return this;
	
}

/**
 * Draw the compass points and North line
 */
AtSatScene.prototype.addCompass = function () { 

	// NORTH line
	var material = new THREE.LineBasicMaterial({
		color: 0xff0000
	});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	geometry.vertices.push(new THREE.Vector3(0, 0, 0-this.worldsize-5));
	var line = new THREE.Line(geometry, material);
	this.scene.add(line);

	// compass points
	var xyz = getXYZfromAzEl(0, 0, this.worldsize-5);
	var geometry = new THREE.BoxGeometry( 3, 3, 3 );
	var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	var cube = new THREE.Mesh( geometry, material );
	cube.name = 'compass-north';
	cube.position.set( xyz.x,xyz.y,xyz.z );
	this.scene.add( cube );

	var label = document.createElement('div');
	label.id = 'label-compass-north';
	label.className = 'label-compass';
	label.innerHTML = 'NORTH';
	$('#container').append(label);

	var xyz = getXYZfromAzEl(90, 0, this.worldsize-5);
	var geometry = new THREE.BoxGeometry( 3, 3, 3 );
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	var cube = new THREE.Mesh( geometry, material );
	cube.name = 'compass-east';
	cube.position.set( xyz.x,xyz.y,xyz.z );
	this.scene.add( cube );

	var label = document.createElement('div');
	label.id = 'label-compass-east';
	label.className = 'label-compass';
	label.innerHTML = 'EAST';
	$('#container').append(label);	

	var xyz = getXYZfromAzEl(180, 0, this.worldsize-5);
	var geometry = new THREE.BoxGeometry( 3, 3, 3 );
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	var cube = new THREE.Mesh( geometry, material );
	cube.name = 'compass-south';
	cube.position.set( xyz.x,xyz.y,xyz.z );
	this.scene.add( cube );
	
	var label = document.createElement('div');
	label.id = 'label-compass-south';
	label.className = 'label-compass';
	label.innerHTML = 'SOUTH';
	$('#container').append(label);	
	

	var xyz = getXYZfromAzEl(270, 0, this.worldsize-5);
	var geometry = new THREE.BoxGeometry( 3, 3, 3 );
	var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
	var cube = new THREE.Mesh( geometry, material );
	cube.name = 'compass-west';
	cube.position.set( xyz.x,xyz.y,xyz.z );
	this.scene.add( cube );
	
	var label = document.createElement('div');
	label.id = 'label-compass-west';
	label.className = 'label-compass';
	label.innerHTML = 'WEST';
	$('#container').append(label);	
	
	
	return this;
	
}

AtSatScene.prototype.addISS = function(){ 
	
	var geometry = new THREE.SphereGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0x7ED321} );
	this.sceneObjects.satellites.iss = new THREE.Mesh( geometry, material );
	
	var xyz = getXYZfromAzEl(0, 45, this.radiusSatellites);
	this.sceneObjects.satellites.iss.position.set( xyz.x,xyz.y,xyz.z );
	this.sceneObjects.satellites.iss.scale.x = this.sceneObjects.satellites.iss.scale.y = 1;
	this.scene.add(this.sceneObjects.satellites.iss);
	
	// add guide lines
	var material = new THREE.LineBasicMaterial({
		color: 0x7ED321
	});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, this.worldsize, 1));
	geometry.vertices.push(new THREE.Vector3(xyz.x, xyz.y ,xyz.z));
	geometry.vertices.push(new THREE.Vector3(0,0,0));
	
	this.sceneObjects.satellites.isslocvert= new THREE.Line(geometry, material);
	this.sceneObjects.satellites.isslocvert.name='iss-line-vert';
	this.scene.add(this.sceneObjects.satellites.isslocvert);
	
}

AtSatScene.prototype.addSunAndMoon = function() {
	
	// sun
	var geometry = new THREE.SphereGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0xD0021B} );
	this.sceneObjects.planets.sun = new THREE.Mesh( geometry, material );
	
	var xyz = getXYZfromAzEl(90,10, this.radiusPlanets);
	this.sceneObjects.planets.sun.position.set( xyz.x, xyz.y, xyz.z );
	this.sceneObjects.planets.sun.scale.x = this.sceneObjects.planets.sun.scale.y = 1;
	this.scene.add( this.sceneObjects.planets.sun );
	
	// moon
	var geometry = new THREE.SphereGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0xD0021B} );
	this.sceneObjects.planets.moon = new THREE.Mesh( geometry, material );
	
	var xyz = getXYZfromAzEl(100 ,80, this.radiusPlanets);
	this.sceneObjects.planets.moon.position.set( xyz.x, xyz.y, xyz.z );
	this.sceneObjects.planets.moon.scale.x = this.sceneObjects.planets.moon.scale.y = 1;
	this.scene.add( this.sceneObjects.planets.moon );
	
}

/**
 * Based on the latest data from this.apiData , reposition all the sceneObjects
 */
AtSatScene.prototype.updatePositions = function() {
	
	// do iss
	var xyz = getXYZfromAzEl(this.apiData.iss.azimuth, this.apiData.iss.elevation, this.radiusSatellites);
	this.sceneObjects.satellites.iss.position.set( xyz.x,xyz.y,xyz.z );

	this.sceneObjects.satellites.isslocvert.geometry.vertices[1].set( xyz.x,xyz.y,xyz.z +15);
	this.sceneObjects.satellites.isslocvert.geometry.verticesNeedUpdate = true;
	
	// do sun
	var xyz = getXYZfromAzEl(this.apiData.planets.Sun.azimuth, this.apiData.planets.Sun.elevation, this.radiusPlanets);
	this.sceneObjects.planets.sun.position.set( xyz.x, xyz.y, xyz.z );
	
	// do moon
	var xyz = getXYZfromAzEl(this.apiData.planets.Moon.azimuth, this.apiData.planets.Moon.elevation, this.radiusPlanets);
	this.sceneObjects.planets.moon.position.set( xyz.x, xyz.y, xyz.z );
	
	// do other planets
	/*
	for (var planet in this.apiData.planets) {
		// have we already created this sceneObject?
		
		if (!(planet in this.sceneObjects.planets)) { 
		
			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
			var sceneObject = new THREE.Mesh( geometry, material );
			sceneObject.name = planet;
			sceneObject.scale.x = sceneObject.scale.y = 1;
		
			this.sceneObjects.planets[planet] = sceneObject;
			this.scene.add(sceneObject);
	
		} else {
		  var sceneObject = this.sceneObjects.planets[planet];

		}
		var xyz = getXYZfromAzEl(this.apiData.planets[planet].azimuth, this.apiData.planets[planet].elevation, this.radiusPlanets);
		sceneObject.position.set( xyz.x, xyz.y, xyz.z );
		
	}
	*/
	// do other stars
	for (var star in this.apiData.stars) {
		// have we already created this sceneObject?
		if (!(star in this.sceneObjects.stars)) { 
		
			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
			var sceneObject = new THREE.Mesh( geometry, material );
			sceneObject.name = star;
			sceneObject.scale.x = sceneObject.scale.y = 1;
		
			this.sceneObjects.stars[star] = sceneObject;
			this.scene.add(sceneObject);
	
		} else {
		  var sceneObject = this.sceneObjects.stars[star];

		}
		var xyz = getXYZfromAzEl(this.apiData.stars[star].azimuth, this.apiData.stars[star].elevation, this.radiusStars);
		sceneObject.position.set( xyz.x, xyz.y, xyz.z );
	}
	
}

/**
 * Fetch the latest positional data from the API
 */
AtSatScene.prototype.getApiData = function() {
	$.ajax({
		method: "GET",
		url: this.API_URL,
		cache: false,
		data: this.getLocationData()
	}).done(function(data) {
		this.apiData = data;
		$(window).trigger("datafeed/updated");
	}.bind(this));
}

AtSatScene.prototype.getLocationData = function() {
	return this.userPosition;
}

AtSatScene.prototype.update2d = function() {
	
	var worldIsVisible = $('.infoView-wrapper').hasClass('active')==false;
	
	// move compass points
	var compassPoints = ['compass-north','compass-east','compass-south','compass-west'];
	compassPoints.forEach(function(elementName) { 
		var label = $('#label-'+elementName);
		var element = this.scene.getObjectByName(elementName, true );
		if (element) { 
			if (!element.visible || !worldIsVisible) { 
				label.hide();
			} else { 
				var pos = this.toXY(element);
				
				// check element is in front of the camera
				if (pos.z<1 && (pos.x < (this.renderWidth+label.width())) && (pos.y < (this.renderHeight + label.height()))) {
					label.show();
					label.css('left', pos.x - (label.width()/2));
					label.css('top', pos.y - (label.height() + 5));
				} else { 
					label.hide();
				}
			}
		}
	}.bind(this));

	// position iss object
	var label = $('#issObject');
	var elementIss = this.sceneObjects.satellites.iss;
	if (!elementIss.visible || !worldIsVisible) { 
		label.hide();
	} else { 
		var pos = this.toXY(elementIss);
		// check elementIss is in front of the camera
		if (pos.z<1 && (pos.x < (this.renderWidth+label.width())) && (pos.y < (this.renderHeight + label.height()))) {
			label.show();
			label.css('left', pos.x - 55);
			label.css('top', pos.y - 55);
		} else { 
			label.hide();
		}
	}

	// position ISS stats next to ISS 
	var label = $('#iss-update-wrapper');
	var element = this.sceneObjects.satellites.iss;
	if (!element.visible || !worldIsVisible) { 
		label.hide();
	} else { 
		var pos = this.toXY(element);
		// check element is in front of the camera
		if (pos.z<1 && (pos.x < (this.renderWidth+label.width())) && (pos.y < (this.renderHeight + label.height()))) {
			label.show();
			label.css('left', pos.x + 48);
			label.css('top', pos.y + 48);
		} else { 
			label.hide();
		}
	}

	// position sun object
	var label = $('#sunObject');
	var elementSun = this.sceneObjects.planets.sun;
	if (!elementSun.visible || !worldIsVisible) { 
		label.hide();
	} else { 
		var pos = this.toXY(elementSun);
		// check elementSun is in front of the camera
		var glowSize = 250;
		if (pos.z<1 && (pos.x < (this.renderWidth+label.width()+glowSize)) && (pos.y < (this.renderHeight + label.height()+glowSize))) {
			label.show();
			label.css('left', pos.x);
			label.css('top', pos.y);
		} else { 
			label.hide();
		}
	}

	// position moon object
	var label = $('#moonObject');
	var elementMoon = this.sceneObjects.planets.moon;
	if (!elementMoon.visible || !worldIsVisible) { 
		label.hide();
	} else { 
		var glowSize = 250;
		var pos = this.toXY(elementMoon);
		if (pos.z<1 && (pos.x < (this.renderWidth+label.width()+glowSize)) && (pos.y < (this.renderHeight + label.height()+glowSize))) {
			label.show();
			label.css('left', pos.x);
			label.css('top', pos.y);
		} else { 
			label.hide();
		}
	}
	
	// position star labels;
	for (var star in this.sceneObjects.stars) {
		var element = this.sceneObjects.stars[star];
		var label = $('#label-star-'+star);
		
		if (label.length==0) { 
			var label = document.createElement('div');
			label.id = 'label-star-'+star;
			label.className = 'label-star';
			label.style.position = 'absolute';
			label.style.top = '-200px';
			label.style.left = '0px';
			label.innerHTML = star;
			$('#container').append(label);	
		}
		if (!element.visible || !worldIsVisible) { 
			$(label).hide();//this 
		} else { 
			var pos = this.toXY(element);
			// check element is in front of the camera
			if (pos.z<1 && (pos.x < (this.renderWidth+label.width())) && (pos.y < (this.renderHeight + label.height()))) {
				label.show();
				label.css('left', pos.x );
				label.css('top', pos.y);
			} else { 
				label.hide();
			}
		}
		
		
	}
	
}

AtSatScene.prototype.toXY = function (object){
	
	var vector = object.position.clone();
	vector.project(this.sceneCamera );
	
	return { 
	    x: ( vector.x + 1 ) * 0.5 * (this.renderWidth),
	    y: -( vector.y - 1 ) * 0.5 * (this.renderHeight),
	    z: vector.z
	};

}
