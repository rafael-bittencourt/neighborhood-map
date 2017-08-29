// color values used
var MARKER_ORIGINAL = 'c0b283';
var MARKER_BOUNCE = 'ffffff';

// Global reference to the map
var map;
var bounds;
// Used to control the map zoom on the initial setup
var zoomControl = true;

var Location = function(data) {
	var self = this; // refers to the Location
	this.title = ko.observable(data.title);
	this.location = ko.observable(data.location);
	this.infoWindow = new google.maps.InfoWindow();
	this.marker = new google.maps.Marker({
			position: data.location,
			animation: google.maps.Animation.DROP,
			map: map,
			icon: makeMarkerIcon(MARKER_ORIGINAL),
			title: data.title
	});

	// Control if the marker is on the map or not
	this.onMap = ko.observable(true);
	this.showMarker = ko.computed(function() {
		if (self.onMap() === true) {
			self.marker.setMap(map);
			bounds.extend(self.marker.position);
		} else {
			self.marker.setMap(null);
		}
		if (zoomControl) {
			map.fitBounds(bounds);
		}
	}, self);

	// Foursquare credentials
	var clientID = "YXNTUQ4Y5AD5NHQF0WWNIAGR3H0P0CBWOV4C01WECFXAJEXZ";
	var clientSecret = "IB00R5MESIZZTV5MTKNINUDLLWAD0QEZPCVUUG3MHSA0CPH3";

	// Foursquare request URL format
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.location().lat + ',' + this.location().lng +
						'&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170824';
	var infoContent; 

	// Grab the location data with foursquare api and populate the infowindow with it
	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		var name = results.name ? results.name : "name not available";
		var category = results.categories[0].name ? results.categories[0].name : "category not available";
		var address = results.location.address ? results.location.address : "address not available";
		var phone = results.contact.formattedPhone ? results.contact.formattedPhone : "phone not available";
		var twitter = results.contact.twitter ? results.contact.twitter : "twitter not available";
		var url = results.url;
		infoContent = '<div><h3>' + name +
					  '</h3><h4>' + category + 
					  '</h4><ul class="list_locations"><li>Address: ' + address + 
					  '</li><li>Phone: ' + phone + 
					  '</li><li>Twitter: ' + twitter + '</li>';
		if (url !== undefined) { // verify if the location has a webpage linked
			infoContent = infoContent + '<li>URL: <a href="' + results.url + '">' + url +'</a></li></ul></div>';
		} else {
			infoContent = infoContent + '<li>URL: webpage not available</li></ul></div>';
		}
		self.infoWindow.setContent(infoContent); // fill the infowindow with the data obtained
	}).fail(function() {
		alert("Foursquare data is unavailable."); // alert if the API is unavailable
	});

	// Relate the click on the location list with the marker 
	this.triggerMarker = function() {
		google.maps.event.trigger(self.marker, 'click');
	}

	this.marker.addListener('click', function() {
		self.infoWindow.open(map, this); // open the infowindow on map
		this.setIcon(makeMarkerIcon(MARKER_BOUNCE));
		this.setAnimation(google.maps.Animation.BOUNCE); // trigger marker animation
		setTimeout(function() {
			self.marker.setIcon(makeMarkerIcon(MARKER_ORIGINAL));
			self.marker.setAnimation(null); // stop marker animation after 2s
		}, 2000);
	});
}

var ViewModel = function() {
	var self = this; // refers to the ViewModel

	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 29.9492328, lng: -90.0816677},
	  styles: styles,
	  zoom: 14
	});

	bounds = new google.maps.LatLngBounds();

	this.locationList = ko.observableArray([]);
	this.filter = ko.observable("");

	locations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem) );
	});

	/* filter the item list based on the input offered
		references
		http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
		https://stackoverflow.com/questions/17557789/using-contains-instead-of-stringstartswith-knockout-js 
	*/
	this.filteredItems = ko.computed(function() {
	    var filter = this.filter().toLowerCase();
	    if (!filter) {
	    	ko.utils.arrayForEach(this.locationList(), function(locationItem) {
	        	locationItem.onMap(true);
    		});
	        return this.locationList();
	    } else {
	        return ko.utils.arrayFilter(this.locationList(), function(locationItem) {
	        	if (locationItem.title().toLowerCase().indexOf(filter) !== -1) {
	        		locationItem.onMap(true); // display the location marker on the map
	        		return locationItem.title().toLowerCase().indexOf(filter) !== -1;
	        	} else {
	        		locationItem.onMap(false); // remove the location marker on the map
	        	}
	        });
	    }
	}, self);

	// setting the bounds changes the zoom, so it must be reset
	google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
        if (this.getZoom()){
            this.setZoom(14);
        }
        zoomControl = false;
    });
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34). From Udacity course
function makeMarkerIcon(markerColor) {
	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21,34));
		return markerImage;
}

function initMap() {
	ko.applyBindings(new ViewModel());
}

function mapsError() {
	alert("This page was unable to display google maps element. Try again.");
}