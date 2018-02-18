
/* Fetches the Unix timestamp of the last time the Cetus bounties reset, from the official world state file(s).
 * The first parameter defines the platform: 1 is PC, 2 is PS4 and 3 is XBox 1.
 * 0, null or undefined doesn't fetch the data and returns a static timestamp.
 * The Cetus time is then passed to the callback function. I know it's a mess - I'll try to clean it up when I have more time and coffee.
 */
function getCetusTime(platform, callback)
{
	var timestamp = 1510884902;	//Static timestamp to be returned in case of an error. Correct as of 2018-02-13, for PC version 22.12.2. Might not be accurate in the future.
	if(!platform || (platform > 3))
	{
		callback(timestamp);
		return;
	}

	var worldStateUrls =
	[
		"http://content.warframe.com/dynamic/worldState.php",
		"http://content.ps4.warframe.com/dynamic/worldState.php",
		"http://content.xb1.warframe.com/dynamic/worldState.php"
	];

	var worldStateUrl = "http://www.whateverorigin.org/get?url=" + encodeURIComponent(worldStateUrls[platform-1]) + "&callback=?";

	$.ajax(
	{
		url: worldStateUrl,
		dataType: "json",
		mimeType: "application/json",
		success: function(data)
		{
			var worldStateData
			try
			{
				worldStateData = JSON.parse(data.contents); //whateverorigin is a little weird in that it returns the requested data as a string in a JSON response
			}
			catch(e)
			{
				console.warn("Could not fetch Cetus time (", e.message, "). Using static timestamp. Accuracy not guaranteed.");
				callback(timestamp);
				return;
			}
			var syndicate = worldStateData["SyndicateMissions"].find(element => (element["Tag"] == "CetusSyndicate"));
			timestamp = Math.floor(syndicate["Activation"]["$date"]["$numberLong"] / 1000) - 120;	//The activation time, converted to whole seconds, minus two minutes while the bounties are unavailable
			console.log("Fetched Cetus time: ", timestamp);
			callback(timestamp);
		},
		failure: function(xhr, status, error)
		{
			console.warn("Cound not fetch Cetus time:", status, error, ". Using static timestamp. Accuracy not guaranteed.");
			callback(timestamp);
		}
	});
}

function analogClockUpdate(min)
{
	var angle_h = (min % 720) / 720 * 360;
	var angle_m = (min % 60) / 60 * 360;

	var hand_h = $('img.cetus-clock-analog-hour');
	var hand_m = $('img.cetus-clock-analog-minute');

	hand_h.css("transform", "rotate(" + angle_h + "deg)");
	hand_m.css("transform", "rotate(" + angle_m + "deg)");
}

function minToString(min)
{
	var h = Math.floor((min / 60) % 24);
	var m = Math.floor(min % 60);
	var s = Math.floor((min * 60) % 60);
	return h + ":" + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
};

function cetusClockUpdate(startTime)
{

	var date = new Date();
	var now = date.getTime() / 1000;	//current time since Unix epoch in seconds
    //var startTime = cetusTime;	//time of a PoE sunrise since Unix epoch in seconds, shamelessly copied from the code of clockofeidolon.com by Lyneca (MIT license). I don't know how the fuck you came up with such a specific number, but I applaud the accuracy.
	var cetusTime = ((now - startTime) / 60) % 150;	//Cetus time of day in minutes
	$(".cetus-period").html(cetusTime > 100 ? "until sunrise" : "until sunset");
	var nextPeriod = cetusTime > 100 ? 150 : 100;
	$(".cetus-clock-eidolon").html(minToString(nextPeriod - cetusTime));
	$(".cetus-clock-bounties").html(minToString(150 - cetusTime));

	var cetusLocalTime = cetusTime * 9.6 + 300;
	$(".cetus-clock-local").html(minToString(cetusLocalTime));
	analogClockUpdate(cetusLocalTime);
}

$(document).ready(function(event)
{
	var interval;
	getCetusTime(0, function(time)
	{
		interval = setInterval(cetusClockUpdate, 10, time);
	});
	getCetusTime(1, function(time)
	{
		clearInterval(interval);
		interval = setInterval(cetusClockUpdate, 10, time);
	});
});