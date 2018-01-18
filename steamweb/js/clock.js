function cetusClockUpdate()
{
	function minToString(min)
	{
		var h = Math.floor(min / 60);
		var m = Math.floor(min % 60);
		var s = Math.floor((min * 60) % 60);
		return h + ":" + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
	};

	var now = (new Date()).getTime() / 1000;	//current time since Unix epoch in seconds
    var startTime = (1510894634 - 150 * 60) + 7 * 60 + 18;	//time of a PoE sunrise since Unix epoch in seconds, shamelessly copied from the code of clockofeidolon.com by Lyneca (MIT license). I don't know how the fuck you came up with such a specific number, but I applaud the accuracy.
	var cetusTime = ((now - startTime) / 60) % 150;	//Cetus time of day in seconds

	$(".poe-period").html(cetusTime > 100 ? "until sunrise" : "until sunset");
	var nextPeriod = cetusTime > 100 ? 150 : 100;
	$(".poe-clock").html(minToString(nextPeriod - cetusTime));
};

$(document).ready(function(event)
{
	var interval = setInterval(cetusClockUpdate, 100);
});