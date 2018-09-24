"use strict";
//#region Globals
var relic_data = [];
var item_data = [];
var resource_data = [];

var background_enabled = false;
var background_blur = 0;
var night_mode = false;
var cookies_accepted;
var shortcuts = [];
var wikia = [];
var foundry = [];

function array_move(coll, index, dir)
{
	let other;
	if(dir > 0)
	{
		if(index <= 0)
			return;
		other = index - 1;
	}
	else
	{
		if(index >= coll.length - 1)
			return;
		other = index + 1;
	}

	let temp = coll[other];
	coll[other] = coll[index];
	coll[index] = temp;
}

//#endregion

//#region Settings

function settings_load()
{
	var settings = JSON.parse(localStorage.getItem("wftracker-settings"));
	for(var prop in settings)
	{
		if(prop == "cookies-accepted")
		{
			cookies_accepted = settings[prop];
			if(cookies_accepted)
				$("#cookie-notice").remove();
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
		else if(prop == "night")
		{
			night_mode = settings[prop];
		}
	}
	toggle_nightmode(night_mode);
}

function save_settings()
{
	localStorage.setItem("wftracker-settings", JSON.stringify(
	{
		"night": night_mode,
		"background": background_enabled,
		"background-blur": background_blur,
		"cookies-accepted": cookies_accepted
	}));
}
//#endregion

//#region Night mode

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

//#endregion

//#region Background
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
	let author_container = $(".background-author-container");
	if(background_enabled)
		author_container.show();
	else
		author_container.hide()
	backgrounds_load();
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
		$(".background-author").html('<a href="' + bg.url + '">Background image</a> by <a href="' + bg.author_url + '">' + bg.author_name + '</a>');
		$(".background-author-container").show();
		// Add blur to background
		set_background_blur(blur, element);
	}
	else
	{
		// If it's undefined, remove background and info
		$("body").removeClass("has-background");
		element.hide();
		$("background-author-container").hide();
	}
}

function backgrounds_load()
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

//#endregion

//#region Shortcuts

function shortcuts_load()
{
	shortcuts = JSON.parse(localStorage.getItem("wftracker-shortcuts"));
	if(!(shortcuts && shortcuts.length))
	{
		shortcuts = [];
		$("#shortcut-list").html("<li>The list is empty.</li>");
		return;
	}
	var c = [];
	for(let i = 0; i < shortcuts.length; ++i)
	{
		let s = shortcuts[i];
		if(!s) continue;
		c.push('<li class="shortcut-list-item">');
		c.push('<span><a href="' + s.url + '">' + s.name + '</a></span>');
		c.push('<button class="list-button shortcut-up" value="' + i + '">&#x25b2;</button>');
		c.push('<button class="list-button shortcut-down" value="' + i + '">&#x25bc;</button>');
		c.push('<button class="list-button shortcut-remove" value="' + i + '">&#x274c;</button>');
		c.push('</li>');
	}
	$("#shortcut-list").html(c.join(""));

	// Add event handlers
	$(".shortcut-remove").click(function(event)
	{
		shortcuts_delete(Number(event.target.value));
	});

	$(".shortcut-up").click(function(event)
	{
		array_move(shortcuts, Number(event.target.value), 1);
		shortcuts_save();
	});

	$(".shortcut-down").click(function(event)
	{
		array_move(shortcuts, Number(event.target.value), -1);
		shortcuts_save();
	});
}

function shortcuts_save()
{
	for(let i = 0; i < shortcuts.length; ++i)
		if(!shortcuts[i])
		{
			shortcuts.splice(i, 1);
			--i;
		}
	localStorage.setItem("wftracker-shortcuts", JSON.stringify(shortcuts));
	shortcuts_load();
}

function shortcuts_add(name, url)
{
	shortcuts.push(
		{
			name: name,
			url: url
		}
	);

	shortcuts_save();
}

function shortcuts_delete(index)
{
	shortcuts.splice(index, 1);
	shortcuts_save();
}

//#endregion

//#region Wikia

function wikia_load()
{
	wikia = JSON.parse(localStorage.getItem("wftracker-wikia"));
	if(!(wikia && wikia.length))
	{
		wikia = [];
		//$("#wikia-list").html("<li>The list is empty.</li>");
		$("#wikia-list-container").hide();
		return;
	}
	$("#wikia-list-container").show();
	var c = [];
	for(let i = 0; i < wikia.length; ++i)
	{
		let s = wikia[i];
		if(!s) continue;
		c.push('<li class="wikia-list-item">');
		c.push('<span><a href=https://warframe.wikia.com/wiki/' + s.id + '>' + s.name + '</a></span>');
		c.push('<button class="list-button wikia-up" value="' + i + '">&#x25b2;</button>');
		c.push('<button class="list-button wikia-down" value="' + i + '">&#x25bc;</button>');
		c.push('<button class="list-button wikia-remove" value="' + i + '">&#x274c;</button>');
		c.push('</li>');
	}
	$("#wikia-list").html(c.join(""));

	// Add event handlers
	$(".wikia-remove").click(function(event)
	{
		wikia_delete(Number(event.target.value));
	});

	$(".wikia-up").click(function(event)
	{
		array_move(wikia, Number(event.target.value), 1);
		wikia_save();
	});

	$(".wikia-down").click(function(event)
	{
		array_move(wikia, Number(event.target.value), -1);
		wikia_save();
	});
}

function wikia_save()
{
	for(let i = 0; i < wikia.length; ++i)
		if(!wikia[i])
		{
			wikia.splice(i, 1);
			--i;
		}
	localStorage.setItem("wftracker-wikia", JSON.stringify(wikia));
	wikia_load();
}

function wikia_add(name, id)
{
	if(wikia.some(e => e.id == id))
	{
		alert("This ID already exists.");
		return;
	}

	wikia.push(
		{
			id: id,
			name: name
		}
	);

	wikia_save();
}

function wikia_delete(index)
{
	wikia.splice(index, 1);
	wikia_save();
}

function wikia_go(event)
{
	if(event.type == "click" || (event.type == "keydown" && event.which == 13))
	{
		let id = $("#wikia-id").val().replace(" ", "_");
		window.location.assign("https://warframe.wikia.com/wiki/" + id);
	}
}

//#endregion

//#region Foundry

function foundry_load()
{
	//foundry = foundry_test;
	foundry = JSON.parse(localStorage.getItem("wftracker-foundry"));
	if(!(foundry && foundry.length))
	{
		foundry = [];
		$("#foundry-table tbody").html('<tr class="foundry-item"><td></td><td colspan="6">The list is empty.</td></tr>');
		return;
	}

	var c = [];
	for(let i = 0; i < foundry.length; ++i)
	{
		let e = foundry[i];
		if(!e) continue;

		// Begin row
		c.push('<tr class="foundry-item" id="foundry-item-' + i + '">');

		// Buttons
		c.push('<td class="foundry-item-buttons">');
		c.push('<div class="foundry-item-buttons-container">');
		c.push('<div class="foundry-item-buttons-column">');
		c.push('<button class="foundry-item-edit" value="' + i + '">edit</button>');
		c.push('<button class="foundry-item-details-show" value="' + i + '">details</button>');
		c.push('<button class="foundry-item-details-hide" value="' + i + '" hidden>hide</button>');
		c.push('</div><div class="foundry-item-buttons-column foundry-item-buttons-updown">');
		c.push('<button class="foundry-item-up" value="' + i + '">&utrif;</button>');
		c.push('<button class="foundry-item-down" value="' + i + '">&dtrif;</button>');
		c.push('</div></div>');

		// Name
		c.push('<td class="foundry-item-name">' + e.name + '</td>');

		// Blueprint
		c.push('<td class="foundry-item-blueprint foundry-item-component">');
		c.push('<div class="foundry-item-component-container">');
		c.push('<button class="foundry-item-component-button foundry-item-blueprint-plus" value="' + i + '">+</button>');
		c.push('<div class="foundry-item-component-name-container">');
		c.push('<div class="foundry-item-component-name">Blueprint</div>');
		c.push('<div class="foundry-item-component-count">' + e.blueprint + ' / 1</div>');
		c.push('</div>');
		c.push('<button class="foundry-item-component-button foundry-item-blueprint-minus" value="' + i + '">-</button>');
		c.push('</div>');
		c.push('</td>');

		// Components
		for(let j = 0; j < 4; ++j)
		{
			let comp = e.components[j];
			if(comp)
			{
				c.push('<td class="foundry-item-component-' + j + ' foundry-item-component">');
				c.push('<div class="foundry-item-component-container">');
				c.push('<button class="foundry-item-component-button foundry-item-component-plus" value="' + i + '_' + j + '">+</button>');
				c.push('<div class="foundry-item-component-name-container">');
				c.push('<div class="foundry-item-component-name">' + comp.name + '</div>');
				c.push('<div class="foundry-item-component-count">' + comp.owned + ' / ' + comp.needed + '</div>');
				c.push('</div>');
				c.push('<button class="foundry-item-component-button foundry-item-component-minus" value="' + i + '_' + j + '">-</button>');
				c.push('</div>');
				c.push('</td>');
			}
			else
			{
				c.push('<td class="foundry-item-component"> </td>');
			}
		}

		// End row
		c.push('</tr>');
	}
	$("#foundry-table tbody").html(c.join(""));

	// Attach event handlers
	$(".foundry-item-component-plus").click(function(event)
	{
		let v = event.target.value.split("_");
		let c = foundry[Number(v[0])].components[Number(v[1])];
		++c.owned;
		foundry_save();
	});

	$(".foundry-item-component-minus").click(function(event)
	{
		let v = event.target.value.split("_");
		let c = foundry[Number(v[0])].components[Number(v[1])];
		
		if(--c.owned < 0)
			c.owned = 0;
		foundry_save();
	});

	$(".foundry-item-blueprint-plus").click(function(event)
	{
		let v = Number(event.target.value);
		let f = foundry[v];
		++f.blueprint;
		foundry_save();
	});

	$(".foundry-item-blueprint-minus").click(function(event)
	{
		let v = Number(event.target.value);
		let f = foundry[v];
		if(--f.blueprint < 0)
			f.blueprint = 0;
		foundry_save();
	});

	$(".foundry-item-up").click(function(event)
	{
		array_move(foundry, Number(event.target.value), 1);
		foundry_save();
	});
	
	$(".foundry-item-down").click(function(event)
	{
		array_move(foundry, Number(event.target.value), -1);
		foundry_save();
	});

	$(".foundry-item-edit").click(function(event)
	{
		$("#foundry-edit-apply").val(event.target.value);
		$("#foundry-edit-delete").val(event.target.value);
		foundry_form_put(foundry[Number(event.target.value)]);
		$("#foundry-edit-new-buttons").hide();
		$("#foundry-edit-modify-buttons").show();
		$("#foundry-edit").show();
	});

	$(".foundry-item-details-show").click(function(event)
	{
		$(".foundry-details").remove();
		let num = Number(event.target.value);
		foundry_details(foundry[num], num);
		$(".foundry-item-details-hide").hide();
		$(".foundry-item-details-show").show();
		$(event.target).hide();
		$(event.target).siblings(".foundry-item-details-hide").show();
	});
	
	$(".foundry-item-details-hide").click(function(event)
	{
		$(".foundry-details").remove();
		$(".foundry-item-details-hide").hide();
		$(".foundry-item-details-show").show();
	});
}

function foundry_save()
{
	for(let i = 0; i < foundry.length; ++i)
		if(!foundry[i])
		{
			foundry.splice(i, 1);
			--i;
		}
	localStorage.setItem("wftracker-foundry", JSON.stringify(foundry));
	foundry_load();
}

function foundry_form_clear()
{
	$("#foundry-edit input[type=text]").val("");
	$("#foundry-edit input[type=number]").val(function(i, v)
	{
		return this.getAttribute("min");
	});
}

function foundry_form_get()
{
	$("#foundry-edit input").each((i, e) => {
		if(!e.checkValidity())
			return;
	});

	let is_part = function()
	{
		return true;
	};

	let item = {
		name: $("#foundry-edit-name").val(),
		blueprint: Number($("#foundry-edit-blueprint-owned").val()),
		components: []
	}

	for(let i = 1; i <= 4; ++i)
	{
		let n = $("#foundry-edit-component-" + i + "-name").val();
		if(n)
		{
			item.components.push(
			{
				name: n,
				isPart: is_part(n),
				needed: $("#foundry-edit-component-" + i + "-needed").val(),
				owned: $("#foundry-edit-component-" + i + "-owned").val()
			});
		}
	}

	return item;
}

function foundry_form_put(item)
{
	foundry_form_clear();

	$("#foundry-edit-name").val(item.name);
	$("#foundry-edit-blueprint-owned").val(item.blueprint);

	let cn = 0;
	for(let comp of item.components)
	{
		++cn;
		$("#foundry-edit-component-" + cn + "-name").val(comp.name);
		$("#foundry-edit-component-" + cn + "-owned").val(comp.owned);
		$("#foundry-edit-component-" + cn + "-needed").val(comp.needed);
	}
}

//#endregion

//#region Foundry details

function rarity_str(num)
{
	return ["common", "uncommon", "rare", "very rare", "legendary"][num];
}

function relic_str(relic, withRarity)
{
	return relic.era.replace(/^[a-z]/, ch => ch.toUpperCase()) + " " + relic.code.toUpperCase() + " relic (" + rarity_str(relic.rarity) + ")";
	//return era.replace(/^[a-z]/, ch => ch.toUpperCase()) + " " + code.toUpperCase() + " relic";
}

function is_relic_drop(comp)
{
	return relic_data.parts.some(e => e.name.includes(comp));
}

function is_resource(comp)
{
	return resource_data.by_resource.some(e => e.name.includes(comp));
}

function foundry_details(item, num)
{
	let c = [];
	c.push('<tr class="foundry-details" id="foundry-details-' + num + '">');
	c.push('<td /><td></td><td class="foundry-details-component">');

	// Blueprint
	let bpname = item.name + " Blueprint";
	if(is_relic_drop(bpname))
	{
		c.push('<ul>');
		for(let r of relic_data.parts.filter(e => e.name.includes(bpname))[0].relics)
		{
			c.push('<li>' + relic_str(r) + '</li>');
		}
		c.push('</ul>');
	}
	c.push('</td>');
	// Components
	for(let i = 0; i < 4; ++i)
	{
		let comp = item.components[i];

		if(comp)
		{
			let cname = item.name + " " + comp.name;
			let locations = [];
			if(is_relic_drop(cname))
			{
				try
				{
					for(let r of relic_data.parts.filter(e => e.name.includes(cname))[0].relics)
					{
						locations.push(relic_str(r));
					}
				}
				catch(ex)
				{
					console.error(ex.error, cname);
				}
			}
			else if(is_resource(comp.name))
			{
				try
				{
					for(let l of resource_data.by_resource.filter(e => e.name.toLowerCase().includes(comp.name.toLowerCase()))[0].locations)
					{
						locations.push(l.name + " (" + rarity_str(l.rarity) + ")");
					}
				}
				catch(ex)
				{

				}
			}

			c.push('<td class="foundry-details-component"><ul>');
			for(let l of locations)
			{
				c.push('<li>' + l + '</li>');
			}
			c.push('</td>');
		}
		else
		{
			c.push('<td class="foundry-details-component"></td>');
		}
	}

	c.push('</tr>');
	$("tr#foundry-item-" + num).after(c.join(""));
}

//#endregion

//#region Main

$(document).ready(function(event)
{
	// Check if the app is functional
	if(!localStorage)
	{
		alert("FATAL ERROR:\nLocal storage is not supported on this browser, which means none of the features will work. Please install Firefox or Chrome.");
		return;
	}

	// Initialize app
	settings_load();
	backgrounds_load();
	shortcuts_load();
	wikia_load();
	foundry_load();

	// Load relic data
	$.ajax(
		{
			url: "data/relics.json",
			mimeType: "application/json",
			success: function(data)
			{
				relic_data = data;
				console.log("relic data loaded");
			},
			error: function()
			{
				relic_data = [];
			}
		}
	);

	// Load item data
	$.ajax(
		{
			url: "data/items.json",
			mimeType: "application/json",
			success: function(data)
			{
				item_data = data;
				item_data.items.sort((a, b) => a.name < b.name ? -1 : 1);
				let datalist = $("#item-names");
				for(let item of item_data.items)
				{
					datalist.append('<option>' + item.name + '</option>');
					for(let v of item.variants)
					{
						if(item_data.variant_is_prefix[v])
						{
							datalist.append('<option>' + v.replace(/^[a-z]/, ch => ch.toUpperCase()) + ' ' + item.name + '</option>');
						}
						else
						{
							datalist.append('<option>' + item.name + ' ' + v.replace(/^[a-z]/, ch => ch.toUpperCase()) + '</option>');
						}
					}
				}
				datalist.append('</datalist>');
				console.log("item datalist loaded");
			},
			error: function(a, b, c)
			{
				console.error(a, b, c);
				item_data = [];
			}
		}
	);

	// Load resource data
	$.ajax(
		{
			url: "data/resources.json",
			mimeType: "application/json",
			success: function(data)
			{
				resource_data = data;
				let combined_data = ["Neuroptics","Systems","Chassis","Barrel","Receiver","Stock","Pouch","Link","Limb","String","Grip","Blade","Guard","Boot","Handle"];
				for(let res of resource_data.by_resource)
				{
					combined_data.push(res.name);
				}

				let datalist = $("#part-names");
				for(let res of combined_data)
				{
					datalist.append('<option>' + res + '</option>');
				}

				console.log("resources loaded");
			},
			error: function(a, b, c)
			{
				console.error(a, b, c);
				item_data = [];
			}
		}
	);


	// Initialize elements
	var clock_scroll = new PerfectScrollbar("#clock-sidebar", {maxScrollbarLength: 200});	
	var settings_scroll = new PerfectScrollbar("#settings-sidebar", {maxScrollbarLength: 200});

	// Add event handlers

	$("#cookie-consent").click(function(event)
	{
		cookies_accepted = true;
		save_settings();
		settings_load();
	});

	$("#sidebar-remover").click(function(event)
	{
		$("#sidebar-remover").hide();
		$("#settings-sidebar").addClass("sidebar-hidden");
		$("#clock-sidebar").addClass("sidebar-hidden");
		$("#shortcuts-sidebar").addClass("sidebar-hidden");
		$("#data-management-sidebar").addClass("sidebar-hidden");
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
			if($(".sidebar").toArray().every(e => e.classList.contains("sidebar-hidden")))
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
			if($(".sidebar").toArray().every(e => e.classList.contains("sidebar-hidden")))
				$("#sidebar-remover").hide();
		}
	});

	$("#toggle-shortcuts").click(function(event)
	{
		$("#blur-value").val(background_blur);
		var sidebar = $("#shortcuts-sidebar");
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
			if($(".sidebar").toArray().every(e => e.classList.contains("sidebar-hidden")))
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

	$("#toggle-simple-clocks").click(function(event)
	{
		if($(event.target).is(":checked"))
			console.log("simple clocks");
		else
			console.log("full clocks");
	});

	$("#shortcut-add-show").click(function(event)
	{
		let btn = $(event.target);
		let cont = $("#shortcut-add-container");
		cont.children("input").val("");
		cont.show();
		btn.hide();
	});

	$("#shortcut-add-submit").click(function(event)
	{
		let name = $("#shortcut-add-name");
		let url = $("#shortcut-add-url");
		
		if(name.is(":invalid") || url.is(":invalid"))
		{
			console.log("invalid");
			return;
		}

		shortcuts_add(name.val(), url.val());

		$("#shortcut-add-container").hide();
		$("#shortcut-add-show").show();
		$("#shortcut-add-container input").val("");
	});

	$("#shortcut-add-cancel").click(function(event)
	{
		$("#shortcut-add-show").show();
		let cont = $("#shortcut-add-container");
		cont.hide();
		cont.children("input").val("");
	});

	$("#toggle-data-management-panel").click(function(event)
	{
		var sidebar = $("#data-management-sidebar");
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
			if($(".sidebar").toArray().every(e => e.classList.contains("sidebar-hidden")))
				$("#sidebar-remover").hide();
		}
	});

	$("#data-management-export").click(function(event)
	{
		let blob = new Blob([JSON.stringify(
			{
				"wftracker-settings": localStorage.getItem("wftracker-settings"),
				"wftracker-shortcuts": localStorage.getItem("wftracker-shortcuts"),
				"wftracker-wikia": localStorage.getItem("wftracker-wikia"),
				"wftracker-foundry": localStorage.getItem("wftracker-foundry")
			}
		)], {type: "application/json"});
		let url = URL.createObjectURL(blob);
		let link = $("#data-management-file-save");

		link.attr("href", url);
		link.attr("download", "warframe-tracker-data.json");

		link.click(function(event)
		{
			setTimeout(function(){URL.revokeObjectURL(url);}, 10000);
			link.off("click");
			link.hide();
		});
		link.show();
	});

	$("#data-management-file-load").change(function(event)
	{
		console.log("change");
		let reader = new FileReader();
		reader.onload = function(event)
		{
			console.log("load");
			let json = JSON.parse(event.target.result);
			for(let prop in json)
			{
				console.log(prop);
				localStorage.setItem(prop, json[prop]);
			}
			window.location.reload();
		};
		if(confirm("Importing the selected file will overwrite all currently stored data. Are you sure?"))
		{
			reader.readAsText(event.target.files[0]);
		}
	});

	$("#data-management-import").click(function(event)
	{
		event.preventDefault();
		$("#data-management-file-load").trigger("click");
	});

	$("#data-management-delete").click(function(event)
	{
		if(confirm("Are you sure you want to delete all of your stored data?"))
		{
			localStorage.removeItem("wftracker-settings");
			localStorage.removeItem("wftracker-shortcuts");
			localStorage.removeItem("wftracker-wikia");
			localStorage.removeItem("wftracker-foundry");
			window.location.reload();
		}
	});

	$("#wikia-add-show").click(function(event)
	{
		$(event.target).hide();
		$("#wikia-add-container").show();
		$("#wikia-add-name").val($("#wikia-id").val().replace("_", " "));
		$("#wikia-add-id").val($("#wikia-id").val().replace(" ", "_"));

	});

	$("#wikia-add-submit").click(function(event)
	{
		let name = $("#wikia-add-name");
		let id = $("#wikia-add-id");
		
		if(name.is(":invalid") || id.is(":invalid")) return;

		wikia_add(name.val(), id.val());

		$("#wikia-add-container").hide();
		$("#wikia-add-show").show();
		$("#wikia-add-container input").val("");
	});

	$("#wikia-add-cancel").click(function(event)
	{
		$("#wikia-add-show").show();
		let cont = $("#wikia-add-container");
		cont.hide();
		cont.children("input").val("");
	});

	$("#wikia-go").click(function(event)
	{
		let url = "https://warframe.wikia.com/wiki/" + $("#wikia-id").val().replace(" ", "_");
		if(event.shiftKey)
		{
			open(url, "_blank");
		}
		else
		{
			location.assign(url);
		}
	});

	$("#wikia-id").keydown(function(event)
	{
		if(event.key == "enter")
		{
			let url = "https://warframe.wikia.com/wiki/" + $("#wikia-id").val().replace(" ", "_");
			if(event.shiftKey)
			{
				open(url, "_blank");
			}
			else
			{
				location.assign(url);
			}
		}
	});

	$("#foundry-edit-show").click(function(event)
	{
		foundry_form_clear();
		$("#foundry-edit-new-buttons").show();
		$("#foundry-edit-modify-buttons").hide();
		$("#foundry-edit").show();
	});

	$(".foundry-edit-cancel").click(function(event)
	{
		$("#foundry-edit-delete").val(-1);
		$("#foundry-edit-apply").val(-1);
		foundry_form_clear();
		$("#foundry-edit").hide();
	});

	$("#foundry-edit-submit").click(function(event)
	{
		for(let input of $("#foundry-edit input"))
		{
			if($(input).is(":invalid"))
				return;
		}

		foundry.unshift(foundry_form_get());
		foundry_save();
		foundry_form_clear();
		$("#foundry-edit").hide();
	});

	$("#foundry-edit-apply").click(function(event)
	{
		for(let input of $("#foundry-edit input"))
		{
			if($(input).is(":invalid"))
				return;
		}
		foundry[Number(event.target.value)] = foundry_form_get();
		foundry_save();
		foundry_form_clear();
		$("#foundry-edit").hide();
	});

	$("#foundry-edit-delete").click(function(event)
	{
		foundry.splice(Number(event.target.value), 1);
		foundry_save();
		foundry_form_clear();
		$("#foundry-edit").hide();
	});

	$("#foundry-details-close").click(function(event)
	{
		$("#foundry-details").hide();
	});
});
//#endregion
