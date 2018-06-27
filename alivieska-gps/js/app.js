// Constants
const pi2 = Math.PI * 2;
const MULTX = 4200;
const MULTY = 3350;
const CENTERX = 0.447;
const CENTERY = 0.541;

// Global variables
var gpsPos;
var mapZoom = 1;
var gpsUpdateInterval;

// Math
function dist_sq(x1, y1, x2, y2)
{
	var distx = x2 - x1;
	var disty = y2 - y1;
	return (distx * distx + disty * disty);
}

function inRange(x1, y1, x2, y2, range)
{
	return dist_sq(x1, y1, x2, y2) < (range * range);
}

function rotate2(x, y, deg)
{
	var rad = deg * Math.PI / 180;
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad)
	};
}

// Data
// Circle properties - radius, fill color, stroke color, vertical order
var pointStyles = {
	"town": 
	{
		radius: 30,
		fillcolor: "#5050a060",
		strokecolor: "#3030a0",
		z: 0
	},
	"shop": 
	{
		radius: 7,
		fillcolor: "#d0d030",
		strokecolor: "#808030",
		z: 2
	},
	"work": 
	{
		radius: 7,
		fillcolor: "#30f030",
		strokecolor: "#30a030",
		z: 3
	}};

// Points of interest
var pointsOfInterest = [
	{
		id: "home",
		name: "Kesselinperä (home)",
		x: 0.4414,
		y: 0.4581,
		type: "town"
	},
	{
		id: "perajarvi",
		name: "Peräjärvi",
		x: 0.0909,
		y: 0.8175,
		type: "town"
	},
	{
		id: "teimoshop",
		name: "Teimo's shop",
		x: 0.0742,
		y: 0.8129,
		type: "shop"
	},
	{
		id: "sewageplant",
		name: "Sewage treatment plant",
		x: 0.0818,
		y: 0.8646,
		type: "work"
	},
	{
		id: "fleetari",
		name: "Fleetari's repair shop",
		x: 0.8175,
		y: 0.6741,
		type: "shop"
	},
	{
		id: "loppe",
		name: "Loppe",
		x: 0.8170,
		y: 0.6659,
		type: "town"
	}].sort(function(a, b){return pointStyles[a.type].z - pointStyles[b.type].z;});

// Info about points of interest
var poiInfo = [
	{
		id: "home",
		title: "Kesselinperä peninsula",
		desc: "The player's home.",
		services: 
		[
			"Save point",
			"Bed",
			"Garage"
		],
		open: "Always (to the player)"
	},
	{
		id: "perajarvi",
		title: "Peräjärvi",
		desc: "The largest settlement in Alivieska.",
		services: 
		[
			"Save point (behind Teimo's)",
			"Teimo's shop and pub",
			"Gas station",
			"Car inspection",
			"Sewage treatment",
			"Septic tank (2)"
		],
		open: undefined
	},
	{
		id: "teimoshop",
		title: "Teimo's shop",
		desc: "General store",
		services: 
		[
			"Items for the car (fan belt, fluids)",
			"Gas and diesel (outside)",
			"Food, drinks, cigarettes",
			"Kilju ingredients",
			"Alcohol, coffee, food (pub)"
		],
		open: "Mon-Sat 10:00 - 20:00 (shop & gas)\nMon-Sat 20:00 - 2:00"
	},
	{
		id: "sewageplant",
		title: "Sewage treatment plant",
		desc: "Facility to legally dump sewage.",
		services: 
		[
			"Sewage dump (1550 mk for a full tank)"
		],
		open: "Mon-Fri 8:00 - 16:00"
	}];

// Hazardous roads
var hazards = [
	{
		name: "Steep verge (both sides)",
		x: 0.9155,
		y: 0.4333,
	},
	{
		name: "Steep hill",
		x: 0.9155,
		y: 0.4333,
	},
	{
		name: "Rail crossing",
		x: 0.9155,
		y: 0.4333,
	},
	{
		name: "Rail crossing",
		x: 0.687,
		y: 0.235,
	},
	{
		name: "Rail crossing",
		x: 0.5066,
		y: 0.0786,
	}];

// The rest of the stuff
var img_warning = document.createElement("img");
img_warning.src = "res/warning.svg";

// Request data from the server
function updateGpsData(url)
{
	$.ajax({
		dataType: "json",
		url: url,
		cache: false,
		success: function(data, status, xhr)
		{
			$("#gps-data-update").css("color", "lime");
			setTimeout(function(){ $("#gps-data-update").css("color", "green"); }, 300);
			$("#gps-connect-status").text("Connected");
			$("#gps-data-x").text(Number(data["x"]));
			$("#gps-data-y").text(Number(data["y"]));
			$("#gps-data-z").text(Number(data["z"]));
			$("#gps-data-time").text(data["time"]);
			$("#gps-data-heading").text(data["heading"]);
			$("#gps-data-speed").text(data["speed"]);
			gpsPos = data;
			drawPoi(mapZoom);
		},
		error: function(xhr, status, error)
		{
			$("#gps-connect-status").text("Can't connect: " + status);
			$("#gps-data-update").css("color", "red");
		}
	});
}

// Initiate a connection to the data server
function connectGps()
{
	$("#gps-data-update").css("color", "orange");
	var url = $("#gps-connect-url").val();
	gpsUpdateInterval = setInterval(updateGpsData, 1000, url);
	$("#gps-connect").text("Disconnect");
	$("#gps-connect").off("click");
	$("#gps-connect").click(function(e)
	{
		clearInterval(gpsUpdateInterval);
		$("#gps-data-update").css("color", "gray");
		$("#gps-connect-status").text("Disconnected");
		$("#gps-connect").text("Connect");
		$("#gps-connect").off("click");
		$("#gps-connect").click(connectGps);
	});
}

// Draw an arrow at the player's location
function drawLocation(canvas, ctx, zoom, mapPos)
{
	if(!gpsPos)
		return;
	var cx = (gpsPos.x / MULTX + CENTERX) * canvas.clientWidth * zoom + mapPos.left;
	var cy = (-gpsPos.z / MULTY + CENTERY) * canvas.clientHeight * zoom + mapPos.top;

	console.log(cx, cy);

	ctx.fillStyle = "#ff5050";
	ctx.strokeStyle = "#cc0000";
	ctx.beginPath();

	var p = rotate2(0, -10, gpsPos.heading);
	ctx.moveTo(cx + p.x, cy + p.y);
	p = rotate2(7, 10, gpsPos.heading);
	ctx.lineTo(cx + p.x, cy + p.y);
	p = rotate2(0, 5, gpsPos.heading);
	ctx.lineTo(cx + p.x, cy + p.y);
	p = rotate2(-7, 10, gpsPos.heading);
	ctx.lineTo(cx + p.x, cy + p.y);
	ctx.closePath();
	// ctx.arc(cx, cy, 5, 0, pi2);
	ctx.fill();
	ctx.stroke();
}

// Resize canvas to a given size
function resizeCanvas(size)
{
	$("#map-canvas").attr("width", size);
	$("#map-canvas").attr("height", size);
	$("#map-canvas").css("width", size + "px");
	$("#map-canvas").css("height", size + "px");
	
	$("#map-container").css("width", size + "px");
	$("#map-container").css("height", size + "px");
	$("#map-container").css("flex-basis", size + "px");
	
	$("#map-content").css("width", size + "px");
	$("#map-content").css("height", size + "px");
	
	$("#map-canvas").css("width", size + "px");
	$("#map-canvas").css("height", size + "px");
	
	$("#map-image").css("width", size + "px");

	$("#map-canvas").css("width", size + "px");
	$("#map-canvas").css("height", size + "px");
}

// Draw points of interest on the map
function drawPoi(zoom)
{
	var canvas = $("#map-canvas")[0];
	var c = canvas.getContext("2d");
	var pos = $("#map-content").position();

	c.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	c.lineWidth = 1.5;

	for(var poi of pointsOfInterest)
	{
		if(!$("#display-" + poi.type).prop("checked"))
			continue;

		var x = poi.x * canvas.clientWidth * zoom + pos.left;
		var y = (1 - poi.y) * canvas.clientHeight * zoom + pos.top;

		var style = pointStyles[poi.type];

		c.beginPath();
		c.arc(x, y, style.radius, 0, pi2);
		if(style.fillcolor)
		{
			c.fillStyle = style.fillcolor;
			c.fill();
		}
		if(style.strokecolor)
		{
			c.strokeStyle = style.strokecolor;
			c.stroke();
		}
	}
	drawLocation(canvas, c, zoom, pos);
}

// Slider
function Slider(slider, handle, onChange, min = 0, max = 100, value = 0)
{
	var my = this;
	this.slider = slider;
	this.handle = handle;
	this.min = min;
	this.max = max;
	this.value = value ? value : min;

	handle.addEventListener("mousedown", function(e)
	{
		e.preventDefault();
		offset = e.clientY - handle.offsetTop;
		var onMouseMove = function(e)
		{
			var height = slider.clientHeight;
			var y = Math.max(0, Math.min(height - handle.offsetHeight, e.clientY - offset));
			handle.style.top = y + "px";
			my.value = my.max - (y / (height - handle.clientHeight)) * (my.max - my.min);
			if(onChange)
				onChange(my.value);
		};
		document.addEventListener("mousemove", onMouseMove);

		var onMouseUp = function(e)
		{
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
		document.addEventListener("mouseup", onMouseUp);
	});
	handle.style.top = Math.floor(Math.min(slider.clientHeight - handle.offsetHeight, (this.max - this.value) / (this.max - this.min) * slider.clientHeight)) + "px";
	onChange(this.value);
}

Slider.prototype.getValue = function()
{
	return this.value;
};

Slider.prototype.setValue = function(val)
{
	this.handle.style.top = Math.floor(Math.min(slider.clientHeight - handle.offsetHeight, (this.max - this.value) / (this.max - this.min) * slider.clientHeight)) + "px";
	this.onChange(this.value);
};

Slider.prototype.updateHeight = function()
{
	this.handle.style.top = Math.floor(Math.min(this.slider.clientHeight - this.handle.offsetHeight, (this.max - this.value) / (this.max - this.min) * this.slider.clientHeight)) + "px";
}

function sliderChange(val)
{
	$("#map-content").panzoom("zoom", val);
	$("#slider-control-handle").text(val.toFixed(1) + "x");
	drawPoi(val);
}


//--- READY ---//

$(document).ready(function(e)
{
	var slider = new Slider($("#slider-control")[0], $("#slider-control-handle")[0], sliderChange, 1, 4, 1);

	$("#map-content").panzoom({
		minScale: 1,
		contain: "invert",
		cursor: "grab" });

	//$("#map-content").on("panzoomchange", function(e){drawPoi(slider.getValue());});
	$("#map-content").on("panzoomchange", function(e){drawPoi(mapZoom = slider.getValue());});

	$("#map-image").mousemove(function(e)
	{
		var poi;
		var match = undefined;
		for(var i = pointsOfInterest.length - 1; i >= 0; --i)
		{
			poi = pointsOfInterest[i];
			var r2 = Math.pow(pointStyles[poi.type].radius / slider.getValue(), 2);
			if((Math.pow(poi.x * e.target.clientWidth - e.offsetX, 2) + Math.pow((1 - poi.y) * e.target.clientHeight - e.offsetY, 2)) <= r2)
			{
				match = poi;
				break;
			}
		}
		if(!match)
			$("#map-content").panzoom("option", {cursor: "grab"});
		else
			$("#map-content").panzoom("option", {cursor: "pointer"});
		$("#hit-target").text(match ? match.name : "nothing");
	});

	$("#map-content").click(function(e)
	{
		$("#pointer-x").text((e.offsetX / e.target.clientWidth - CENTERX).toFixed(4));
		$("#pointer-y").text((e.offsetY / e.target.clientHeight - CENTERY).toFixed(4));
	});

	$(".display-poi-check").prop("checked", true);
	$(".display-poi-check").click(function(e){drawPoi(slider.getValue());});
	$(img_warning).ready(function(){drawPoi(slider.getValue());});
	$("img").mousedown(function(e){e.preventDefault();});

	$("#gps-connect").click(connectGps);
	$("#gps-data-update").css("color", "gray");
	$(window).resize(function(e)
	{
		resizeCanvas(Math.min(innerHeight - 100, innerWidth - 300));
		slider.updateHeight();
		drawPoi(slider.getValue());
	});
	resizeCanvas(Math.min(innerHeight - 100, innerWidth - 300));
	slider.updateHeight();
});