var cetus_midnight = 1531700181;
var cetus_clock_interval;
var fortuna_midnight = 1531700181;
var fortuna_clock_interval;

//#region Clock Updates

// Convert a time in seconds to h:mm:ss or hh:mm:ss (lower bit), 24 or 12 hour (higher bit) format
function secToString(sec, format)
{
	var h = Math.floor((sec / 3600) % ((format & 1) ? 12 : 24));
	var m = Math.floor((sec / 60) % 60);
	var s = Math.floor(sec % 60);
	return ((format & 2) ? h.toString().padStart(2, "0") : h.toString()) + ":" + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
}

function updateCetusClock(startTime, containers, hands)
{
	var date = new Date();
	var now = date.getTime() / 1000;								//	current time since Unix epoch in seconds
	var cetusTime = (now - startTime) % 9000;						//	Cetus time of day in seconds
	// var cetusTime = 6000;
	var nextPeriodTime = cetusTime > 6000 ? 9000 : 6000;			// Time when the current time period ends
	var nextPeriodText = cetusTime > 6000 ? "sunrise" : "sunset";	// Label for the next time period
	var cetusScaledTime = cetusTime * 9.6 + 14400;					// Cetus time in seconds mapped to 24 hours - sun rises at 5am and sets at 9pm
	if(containers.localTime) containers.localTime.innerText = secToString(cetusScaledTime);
	if(containers.remainingTime) containers.remainingTime.innerText = secToString(nextPeriodTime - cetusTime);
	if(containers.periodText) containers.periodText.innerText = "until " + nextPeriodText;

	var angle_sun = (cetusTime / 9000) * 360 + 240;			// Sun cycle - full rotation over 9000 seconds, 240° at midnight
	var angle_h = ((cetusScaledTime / 3600) % 12) * 30;		// Hours - 30 degrees per hour over 12 hours
	var angle_m = ((cetusScaledTime / 60) % 60) * 6;		// Minutes - 6 degrees per minute over 60 minutes
	var angle_s = (cetusScaledTime % 60) * 6;				// Seconds - 6 degrees per second over 60 seconds
	if(hands.hour) $(hands.hour).css("transform", "rotate(" + angle_h + "deg)");
	if(hands.minute) $(hands.minute).css("transform", "rotate(" + angle_m + "deg)");
	if(hands.second) $(hands.second).css("transform", "rotate(" + angle_s + "deg)");
	if(hands.sun) $(hands.sun).css("transform", "rotate(" + angle_sun + "deg)");
}

function updateFortunaClock(startTime, containers, hands)
{
	return updateCetusClock(startTime, containers, hands);
}

//#endregion

//#region Ajax

// Get Cetus midnight timestamp
function getCetusTime(success, failure)
{
	$.ajax(
	{
		url: "https://whatever-origin.herokuapp.com/get?callback=?&url=" + encodeURIComponent("http://content.warframe.com/dynamic/worldState.php"),
		dataType: "json",
		mimeType: "application/json",
		cache: false,
		success: function(data)
		{
			var parsed;
			try
			{
				parsed = JSON.parse(data.contents);
				var syndicate = parsed["SyndicateMissions"].find(e => e["Tag"] === "CetusSyndicate");
				var timestamp = Math.floor(syndicate["Expiry"]["$date"]["$numberLong"] / 1000) - 9000;
				success(timestamp);
			}
			catch(ex)
			{
				if(failure !== undefined)
					failure(data.status.http_code);
			}
		},
		error: function(x, m, e)
		{
			if(failure !== undefined)
				failure(x.status);
		}
	});
}

// Get Fortuna weather - currently proof of concept
function getFortunaWeather(success, failure)
{
	getCetusTime(success, failure);
}

function getMidnights()
{
	let cetus = function()
	{
		getCetusTime(function(time)
		{
			let fields = 
			{
				remainingTime: $("#cetus-time-remaining")[0],
				periodText: $("#cetus-next-period")[0],
				localTime: $("#cetus-time-scaled")[0]
			};
			let hands = 
			{
				sun: $("#cetus-clock-container .sun-dial")[0]
			};

			console.log("Fetched Cetus midnight:", cetus_midnight = time);
			cetus_clock_interval = setInterval(updateCetusClock, 20, time, fields, hands);
		},
		function(message)
		{
			console.error("Could not fetch Cetus midnight:", message);
			setTimeout(cetus, 5000);
		});
	}
	cetus();
	/*
	let fortuna = function()
	{
		getFortunaWeather(function(time)
		{
			let fields = 
			{
				remainingTime: $("#fortuna-time-remaining")[0]
			};
			let hands = 
			{
				sun: $("#fortuna-clock-container .sun-dial")[0]
			};

			fortuna_clock_interval = setInterval(updateFortunaClock, 20, time, fields, hands);
		},
		function(message)
		{
			console.error("Could not fetch Fortuna weather:", message);
			setTimeout(fortuna, 5000);
		})
	}
	fortuna();
	*/
}

//#endregion

//#region Main
$(document).ready(function(event)
{
	getMidnights();
});
//#endregion