
  function updateUserPositionDisplay(locationData){
    $("#userlocation .userLong").html(locationData.longitude);
    $("#userlocation .userLat").html(locationData.latitude);
    $("#userlocation .userLocal").html('Your Current Location');
 }

  function getTelemetry(){
    $.ajax({
      accepts: "application/json",
        method: "GET",
        url: "https://api.wheretheiss.at/v1/satellites/25544",
        error: function(x, y) {

        },
        success: function(data) {
          $('#iss-live-update .latitude').html(data.latitude.toFixed(8) + '°');
          $('#iss-live-update .longitude').html(data.longitude.toFixed(8) + '°');
          $('#iss-live-update .velocity').html(data.velocity.toFixed(4) + " m/s");
          $('#iss-live-update .altitude').html(data.altitude.toFixed(4) + ' km');
          $('#iss-live-update .visibility').html(data.visibility);
      }
    })
  }
  
  function renderDateTimeElement(momentTime) { 
	  return '<time class="timeago" datetime="' + momentTime.format() + '">' + momentTime.format('LLLL') + '</time>';
  }

    function secondsToHms(d) {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);
      return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
    }

    function getSkyType(sunset,timeOfPass){
      var time = timeOfPass;
      var diff = (Math.round((sunset-timeOfPass)*-1)/60);
      var diffFormatted = secondsToHms(diff);
      if (timeOfPass>=sunset){
        return "Nightsky";
      } else {
        return "Daysky";
      }
    }

    function getSkyTypeTime(sunset,timeOfPass){
      var time = timeOfPass;
      // hrs since sunset
      var diffSince = (Math.round((sunset-timeOfPass)*-1)/60);
      var diffSinceFormatted = secondsToHms(diffSince);
      // hrs to sunset
      var diffTill = (Math.round((timeOfPass-sunset)*-1)/60);
      var diffTillFormatted = secondsToHms(diffTill);

      if (timeOfPass>=sunset){
        return diffSinceFormatted + "hrs";
      } else {
        return diffTillFormatted + "hrs";
      }
    }

    function secondsIntoMinutes(secs) {
			var minutes = Math.floor(secs / 60);
			if(secs>60){
				return minutes + ' min';
			} else {
				return secs + 'seconds';
			}

		}

		function UnixTimeToDate(unixtime) {
			// create a new javascript Date object based on the timestamp
			// multiplied by 1000 so that the argument is in milliseconds, not seconds
			var dateObj = new Date(unixtime*1000);
			var day = dateObj.getDate();
			var month = dateObj.getMonth();
			var year = dateObj.getFullYear();
			var hours = dateObj.getHours();
			var minutes = "0" + dateObj.getMinutes();
			var seconds = "0" + dateObj.getSeconds();
			// format time
			var formattedDate = day + '/' + month + '/' + year;
			return formattedDate;
		}

    function UnixTimeToTime(unixtime) {
      // create a new javascript Date object based on the timestamp
      // multiplied by 1000 so that the argument is in milliseconds, not seconds
      var dateObj = new Date(unixtime*1000);
      var day = dateObj.getDate();
      var month = dateObj.getMonth();
      var year = dateObj.getFullYear();
      var hours = dateObj.getHours();
      var minutes = "0" + dateObj.getMinutes();
      var seconds = "0" + dateObj.getSeconds();
      // format time
      var formattedTime = hours + ':' + minutes.substr(minutes.length-2);
      return formattedTime;
    }

	  function getNextPassInfo(locationData){
          var url = 'http://api.open-notify.org/iss-pass.json';
          var lati = locationData.latitude;
          var longi = locationData.longitude;
          var time;
          var passesData;

          $.getJSON(url + "?lat=" + lati + "&lon=" + longi + "&n=5&callback=?", function(passesData) {
            
              i = 0;
              $.each(passesData.response, function() { /// build pass tables
                  time =  moment.unix(passesData.response[i].risetime);
                  var nextPassDuration = secondsIntoMinutes(passesData.response[i].duration);
                  
                  if (i==0) {
                	  $('#locator-overlay span').html(renderDateTimeElement(time));
                  }
                  
                  $('#pass-table-'+i+' .dateVal').html(time.format('llll'));
                  $('#pass-table-'+i+' .durationVal').html(nextPassDuration);
                  getSummaryForecast(time.format('X'), locationData, i);
                  i++;
              });
              
              $("time.timeago").timeago();
          });              
      }

    function getSummaryForecast(timeOfPass, locationData, pass){
        var apiKey = 'd934966a8d982335008fd09321bc2b08';
        var url = 'https://api.forecast.io/forecast/';
        var lati = locationData.latitude;
        var longi = locationData.longitude;
        var time = timeOfPass;
        var data;
        $.getJSON(url + apiKey + "/" + lati + "," + longi + ","+ time + "?callback=?", function(data) {
          var cover = data.currently.cloudCover;
          var ozone = Math.round(data.currently.ozone) + "DU";
          var visibility = Math.round(data.currently.visibility);
          var skyType = getSkyType(data.daily.data[0].sunsetTime,timeOfPass);
          var skyTypeTime = getSkyTypeTime(data.daily.data[0].sunsetTime,timeOfPass);
          $('#pass-table-'+pass+' .ozoneVal').html(ozone);
          $('#pass-table-'+pass+' .visibilityVal').html(visibility + 'km');
          $('#pass-table-'+pass+' .cloudVal').html((cover*100) + '&#37;');
          $('#pass-table-'+pass+' .skyTypeVal').html(skyType);
          $('#pass-table-'+pass+' .skyTypeTimeVal').html(skyTypeTime);
        });
    }

$(document).ready(function(){

  $('#locationStatus .btn').hide();
	
  $(window).on("location/updated", function(event, locationData) {
    
	updateUserPositionDisplay(locationData);
    getNextPassInfo(locationData);
    $('#locationStatus .error').hide();
    $('#locationStatus').hide();
    $('#passInformation').css('opacity','1');
  
  });
  
  $(window).on("location/error", function(event, errorMessage) {
	  $('#locationStatus .requesting').hide();
	  $('#locationStatus .error span').html('('+errorMessage+')');
	  $('#locationStatus .error').show('slow');
	  $('#locationStatus .btn').show('slow');
  });
  
  $(window).on("location/requesting", function(event) { 
	  $('#locationStatus .error').hide();
	  $('#locationStatus .btn').hide();
	  $('#locationStatus .requesting').show();
  });
  
  $('#locationStatus .exeter').on('click',function() {
		var locationData = {
				altitude: 50,
				latitude: 50.7236000,
				longitude: -3.5275100
		};
		$(window).trigger("location/updated", locationData);
  });
  $('#locationStatus .retry').on('click',function() {
	  $(window).trigger("location/requesting");
	  doLocation();
  });
  
  // init slick slider
  $('.slick').slick({
    arrows: false,
    infinite: false
  });
  
});
