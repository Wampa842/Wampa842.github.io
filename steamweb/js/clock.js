function analogClockUpdate(min)
{
	var angle_h = (min % 720) / 720 * 360;
	var angle_m = (min % 60) / 60 * 360;

	var hand_h = $('img.cetus-clock-analog-hour');
	var hand_m = $('img.cetus-clock-analog-minute');

	hand_h.css("transform", "rotate(" + angle_h + "deg)");
	hand_m.css("transform", "rotate(" + angle_m + "deg)");
}

function cetusClockUpdate()
{
	function minToString(min)
	{
		var h = Math.floor((min / 60) % 24);
		var m = Math.floor(min % 60);
		var s = Math.floor((min * 60) % 60);
		return h + ":" + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
	};

	var date = new Date();
	var now = date.getTime() / 1000;	//current time since Unix epoch in seconds
    var startTime = (1510894634 - 150 * 60) + 7 * 60 + 18;	//time of a PoE sunrise since Unix epoch in seconds, shamelessly copied from the code of clockofeidolon.com by Lyneca (MIT license). I don't know how the fuck you came up with such a specific number, but I applaud the accuracy.
	var cetusTime = ((now - startTime) / 60) % 150;	//Cetus time of day in minutes
	$(".cetus-period").html(cetusTime > 100 ? "until sunrise" : "until sunset");
	var nextPeriod = cetusTime > 100 ? 150 : 100;
	$(".cetus-clock-countdown").html(minToString(nextPeriod - cetusTime));

	var cetusLocalTime = cetusTime * 9.6 + 300;
	$(".cetus-clock-local").html(minToString(cetusLocalTime));
	analogClockUpdate(cetusLocalTime);
};

$(document).ready(function(event)
{
	var interval = setInterval(cetusClockUpdate, 10);
});