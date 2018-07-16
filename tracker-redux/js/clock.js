var cetus_midnight = 1531700181;
var clock_interval;

//region CLOCK

function secToString(sec)
{
	var h = Math.floor((sec / 3600) % 24);
	var m = Math.floor((sec / 60) % 60);
	var s = Math.floor(sec % 60);
	return h + ":" + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
}

function update_cetus_clock(startTime, containers, hands)
{
	var date = new Date();
	var now = date.getTime() / 1000;								//	current time since Unix epoch in seconds
	var cetusTime = (now - (startTime - 9000)) % 9000;				//	Cetus time of day in seconds
	var nextPeriodTime = cetusTime > 6000 ? 9000 : 6000;			// Time when the current time period ends
	var nextPeriodText = cetusTime > 6000 ? "sunrise" : "sunset";	// Label for the next time period
	var cetusScaledTime = cetusTime * 9.6 + 18000;					// Cetus time in seconds mapped to 24 hours - sun rises at 5am
	if(containers.localTime) containers.localTime.innerText = secToString(cetusTime);
	if(containers.remainingTime) containers.remainingTime.innerText = secToString(cetusTime - nextPeriodTime);
	if(containers.periodText) containers.periodText.innerText = secToString(cetusScaledTime);

	var angle_sun = ((cetusScaledTime / 3600) % 24) * 15 + 180;
	var angle_h = ((cetusScaledTime / 3600) % 12) * 30;
	var angle_m = ((cetusScaledTime / 60) % 60) * 6;
	var angle_s = (cetusScaledTime % 60) * 6;
	if(hands.hour) $(hands.hour).css("transform", "rotate(" + angle_h + "deg)");	// Hour hand - 30 degrees per hour
	if(hands.minute) $(hands.minute).css("transform", "rotate(" + angle_m + "deg)");	// Minute hand - 6 degrees per minute
	if(hands.second) $(hands.second).css("transform", "rotate(" + angle_s + "deg)");			// Second hand - 6 degrees per second
	if(hands.sun) $(hands.sun).css("transform", "rotate(" + angle_sun + "deg)");		// Sun cycle - 15 degrees per hour
}

//endregion

//region AJAX

function get_cetus_time(callback)
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
			}
			catch(ex)
			{
				console.warn(ex.message);
			}
			var syndicate = parsed["SyndicateMissions"].find(e => e["Tag"] === "CetusSyndicate");
			if(syndicate == undefined)
			{
				console.warn("Could not find CetusSyndicate");
			}
			var timestamp = Math.floor(syndicate["Expiry"]["$date"]["$numberLong"] / 1000);
			console.log("Fetched Cetus time", timestamp);
			callback(timestamp);
		}
	});
}

//endregion

//region MAIN
$(document).ready(function(event)
{
	get_cetus_time(function(time)
	{
		cetus_midnight = time;
		clock_interval = setInterval(update_cetus_clock, 20, time, 
		{
			periodText: $("#test1")[0],
			localTime: $("#test2")[0]
		},
		{
			sun: $("#cetus-clock-container .sun-dial")[0],
			hour: $("#cetus-clock-container .hour-hand")[0],
			minute: $("#cetus-clock-container .minute-hand")[0],
			second: $("#cetus-clock-container .second-hand")[0]
		});
	});
});
//endregion