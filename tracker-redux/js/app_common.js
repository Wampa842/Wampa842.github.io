//region SETTINGS
var background_enabled = true;
var background_blur = 0;
var night_mode = false;

function load_settings()
{
	var settings = JSON.parse(localStorage.getItem("wftracker-settings"));
	for(var prop in settings)
	{
		if(prop == "night")
		{
			night_mode = settings[prop];
			toggle_nightmode(night_mode);
		}
		else if(prop == "background")
		{
			background_enabled = settings[prop];
		}
		else if(prop == "background-blur")
		{
			background_blur = settings[prop];
			$("#blur-value").val(background_blur);
		}
	}
}

function save_settings()
{
	localStorage.setItem("wftracker-settings", JSON.stringify(
	{
		"night": night_mode,
		"background": background_enabled,
		"background-blur": background_blur
	}));
}

//endregion

//region NIGHT_MODE

function toggle_nightmode(set)
{
	if(set === undefined)
		night_mode = !night_mode;
	else
		night_mode = set;

	if(night_mode)
	{
		$("body").addClass("night-mode");
	}
	else
	{
		$("body").removeClass("night-mode");
	}

	console.log("night mode is", night_mode);
	save_settings();
}

//endregion

//region BACKGROUND
function toggle_background(set)
{
	if(set === undefined)
	{
		background_enabled = !background_enabled;
	}
	else
	{
		background_enabled = set;
	}
	load_backgrounds();
	save_settings();
}

function set_background_blur(blur)
{
	if(blur !== undefined)
	{
		background_blur = blur;
		var element = $("div.background");
		if(blur > 0)
		{
			element.css("filter", "blur(" + blur + "px)");
		}
		else
		{
			element.css("filter", "none");
		}
	}
	save_settings();
}

function set_background(bg, blur)
{
	var element = $("div.background");
	if(bg)
	{
		// If bg is defined, set it as the background and display info about it
		$("body").addClass("has-background");
		element.css("background-image", "url('" + bg.url + "')");
		element.show();
		$(".background-author").html('Background image by <a href="' + bg.author_url + '">' + bg.author_name + '</a>');
		$(".background-author-container").show();
	}
	else
	{
		// If it's undefined, remove background and info
		$("body").removeClass("has-background");
		element.hide();
		$("background-author-container").hide();
	}
	// Add blur to background
	set_background_blur(blur, element);
}

function load_backgrounds()
{
	// If backgrounds are disabled, bail
	if(!background_enabled)
	{
		set_background(undefined);
		return;
	}

	// Try loading the JSON file
	$.ajax(
	{
		url: "data/backgrounds.json",
		mimeType: "application/json",
		success: function(data)
		{
			// If successful, select a random element
			var i = Math.floor(Math.random() * data.length);
			console.log("selected background", i);
			set_background(data[i], background_blur);
		}
	});
}

//endregion

//region MAIN

$(document).ready(function(event)
{
	// Check if the app is functional
	if(!localStorage)
	{
		alert("Local storage is not supported on this browser, which means none of the features will work. Please install Firefox or Chrome.");
		return;
	}

	// Initialize app
	load_settings();
	load_backgrounds();

	// Initialize elements
	var clock_scroll = new PerfectScrollbar("#clock-sidebar", {maxScrollbarLength: 200});	
	var settings_scroll = new PerfectScrollbar("#settings-sidebar", {maxScrollbarLength: 200});

	// Add event handlers

	$("#sidebar-remover").click(function(event)
	{
		$(event.target).hide();
		$("#settings-sidebar").addClass("sidebar-hidden");
		$("#clock-sidebar").addClass("sidebar-hidden");
	});

	$("#toggle-clocks").click(function(event)
	{
		var sidebar = $("#clock-sidebar");
		// Show
		if(sidebar.hasClass("sidebar-hidden"))
		{
			sidebar.removeClass("sidebar-hidden");
			$("#sidebar-remover").show();
		}
		// Hide
		else
		{
			sidebar.addClass("sidebar-hidden");
			$("#sidebar-remover").hide();
		}
	});
	
	$("#toggle-settings-panel").click(function(event)
	{
		$("#blur-value").val(background_blur);
		var sidebar = $("#settings-sidebar");
		// Show
		if(sidebar.hasClass("sidebar-hidden"))
		{
			sidebar.removeClass("sidebar-hidden");
			$("#sidebar-remover").show();
		}
		// Hide
		else
		{
			sidebar.addClass("sidebar-hidden");
			$("#sidebar-remover").hide();
		}
	});

	$("#toggle-night-mode").click(function(event)
	{
		toggle_nightmode();
	});

	$("#toggle-background").click(function(event)
	{
		toggle_background();
	});

	$("#apply-blur").click(function(event)
	{
		var input = $("#blur-value");

		if(input.is(":invalid"))
			return;

		set_background_blur(Number(input.val()));
	});
});
//endregion