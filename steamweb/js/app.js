const WIKIA_JSON_URL = 'data/wikia.json';
const FOUNDRY_JSON_URL = 'data/foundry.json';
const SHORTCUTS_JSON_URL = 'data/shortcuts.json';
const WIKIA_LS_NAME = 'steamweb-wikia';
const FOUNDRY_LS_NAME = 'steamweb-foundry';
const SHORTCUTS_LS_NAME = 'steamweb-shortcuts';
const NIGHTMODE_LS_NAME = 'steamweb-nightmode';

var wikiaList = [];
var foundryList = [];
var nightmode = false;

var defaultComponents = 
{
	"warframe": {"comp1": "Chassis", "comp2": "Neuroptics", "comp3":"Systems"},
	"gun": {"comp1": "Barrel", "comp2": "Receiver", "comp3":"Stock"},
	"melee": {"comp1": "Blade", "comp2": "Hilt", "comp3": "Guard"}
};

$(document).ready(function(event)
{
	
	/*{
		//var contentUrl = 'http://content.warframe.com/dynamic/worldState.php';
		/*function getJSON(url, callback)
		{
			$.getJSON('https://whateverorigin.herokuapp.com/get?url=' + encodeURIComponent(url) + '&callback=?', function(data)
			{
				callback(JSON.parse(data.contents));
			});
		}

		var contentUrl = "js/data.json";
		var data;
		$.getJSON(contentUrl, function(result)
		{
			//document.getElementById("test").innerHTML = result[0]["mods"];
			data = result;
			render();
		});

		function render()
		{

			var c = [];
			for(var i = 0; i < data.length; ++i)
			{
				var acolyte = data[i];
				c.push('<div class="container acolyte">');
				c.push('<h3>' + acolyte['name'] + '</h3>');
				var mods = acolyte['mods'];
				if(mods.length > 0)
				{
					c.push('<h4>Mods:</h4><ul>');
					for(var j = 0; j < mods.length; ++j)
					{
						c.push('<li>' + mods[j] + '</li>');
					}
					c.push('</ul>');
				}
				else
				{
					c.push('This acolyte is a fucking tit.');
				}
			}
			$('#test').html(c.join(""));
		}
	}*/

//// METHODS ////
	function toggleNightMode(event, mode)
	{
		console.log('Night mode is ' + mode);
		nightmode = mode;
		localStorage.setItem(NIGHTMODE_LS_NAME, nightmode);
		if(mode)
		{
			$('body').addClass('night');
			$('div.nav-right img').attr('src', 'res/moon.svg');
		}
		else
		{
			$('body').removeClass('night');
			$('div.nav-right img').attr('src', 'res/sun.svg');
		}
	}

	function wikiaGo(event)
	{
		if(event.type == 'click' || (event.type == 'keydown' && event.which == 13))
		{
			var id = $('input.wikiaid').val().replace(' ', '_');
			console.log(id + ' on event "' + event.type + '" with code ' + event.which);
			window.location.assign('http://warframe.wikia.com/wiki/' + id);
		}
	}

	function wikiaFormToggle(event)
	{
		var form = $('div.wikiaform');
		var btn = $(event.target);
		var text = $('input.wikiaid').val();
		form.toggle();

		if(form.is(':visible'))
		{
			btn.text('Cancel');
			form.find('input.add-wikiaid').val(text.replace(' ', '_'));
			form.find('input.add-wikianame').val(text);
		}
		else
		{
			btn.text('Add to list...');
		}
	}

	function wikiaListReadLocal(event)
	{
		var c = [];
		var div = $('div.wikialist');
		data = JSON.parse(localStorage.getItem(WIKIA_LS_NAME));
		if(data == null || data.length <= 0)
		{
			if(data == null)
				localStorage.setItem(WIKIA_LS_NAME, '[]');
			div.html('The list is empty.');
			return;
		}

		wikiaList = data;

		div.html('');
		c.push('<div style="width: 400px;"><ul>');
		for(var i = 0; i < data.length; ++i)
		{
			c.push('<li><a href="http://warframe.wikia.com/wiki/' + data[i]['id'] + '">' + data[i]['name'] + '</a>');
			c.push('<button class="wikiaid remove" value="' + i + '">x</button></li>');
		}
		c.push('</ul></div>');
		div.html(c.join(''));
		
		$('div.wikialist button.remove').click(function(event)
		{
			console.log('Remove index: ' + event.target.value);
			wikiaListRemoveItem(event);
		});
	}

	function wikiaListWriteLocal(event)
	{
		localStorage.setItem(WIKIA_LS_NAME, JSON.stringify(wikiaList));
		wikiaListReadLocal(event);
	}

	function wikiaListAddItem(event)
	{
		var id = $('input.add-wikiaid').val();
		var name = $('input.add-wikianame').val();
		var item = {"id": id, "name": name };
		wikiaList.push(item);
		wikiaListWriteLocal(event);
	}

	function wikiaListRemoveItem(event)
	{
		wikiaList.splice(event.target.value, 1);
		wikiaListWriteLocal(event);
	}

	function foundryFormToggle(event)
	{
		var form = $('div.foundryform');
		var btn = $(event.target);
		form.toggle();

		if(form.is(':visible'))
		{
			btn.text('Cancel');
		}
		else
		{
			btn.text('Add to list...');
		}
	}

	function foundryListReadLocal(event)
	{
		var c = [];
		var div = $('div.foundrylist');
		data = JSON.parse(localStorage.getItem(FOUNDRY_LS_NAME));
		if(data == null || data.length <= 0)
		{
			if(data == null)
				localStorage.setItem(FOUNDRY_LS_NAME, '[]');
			div.html('The foundry is empty');
			return;
		}

		foundryList = data;

		div.html('');
		c.push('<table>');
		for(var i = 0; i < data.length; ++i)
		{
			var item = data[i];
			var blueprint_owned = item['blueprint'] > 0;
			var comp1_owned = item['components'][0]['owned'] > item['components'][0]['required'];
			var comp2_owned = item['components'][1]['owned'] > item['components'][1]['required'];
			var comp3_owned = item['components'][2]['owned'] > item['components'][2]['required'];
			var comp4_owned = item['components'][3]['owned'] > item['components'][3]['required'];

			/*

						<tr class="project-title">
							<td class="project-name">Vectis Prime</td>
							<td class="project-blueprint" colspan="3">Blueprint</td>
						</tr>
						<tr class="project-components">
							<td class="project-comp owned">Comp1 (1/1): nowhere</td>
							<td class="project-comp ">Comp1 (1/1): nowhere</td>
							<td class="project-comp ">Comp1 (1/1): nowhere</td>
							<td class="project-comp ">Comp1 (1/1): nowhere</td>
						</tr>
						*/
			c.push('<tr class="project-title">');
			c.push('<td class="project-name"><a href="http://warframe.wikia.com/wiki/' + item['id'] + '">' + item["name"] + '</a></td>');
			c.push('<td class="project-blueprint ' + (blueprint_owned ? 'owned' : '') + '" colspan="3">Blueprint (' + (blueprint_owned ? 'owned' : 'not owned') + '): ' + item['blueprint_drop'] + '</td>');
			c.push('</tr>');
			c.push('<tr class="project-components">');
			var comp = item['components'][0];
			c.push('<td class="project-comp ' + (comp1_owned ? 'owned' : '') + '">' + comp['name'] + ' (' + comp['owned'] + '/' + comp['required'] + '): ' + comp['drop'] + '</td>');
			var comp = item['components'][1];
			c.push('<td class="project-comp ' + (comp1_owned ? 'owned' : '') + '">' + comp['name'] + ' (' + comp['owned'] + '/' + comp['required'] + '): ' + comp['drop'] + '</td>');
			var comp = item['components'][2];
			c.push('<td class="project-comp ' + (comp1_owned ? 'owned' : '') + '">' + comp['name'] + ' (' + comp['owned'] + '/' + comp['required'] + '): ' + comp['drop'] + '</td>');
			var comp = item['components'][3];
			c.push('<td class="project-comp ' + (comp1_owned ? 'owned' : '') + '">' + comp['name'] + ' (' + comp['owned'] + '/' + comp['required'] + '): ' + comp['drop'] + '</td>');
			c.push('</tr>');
		}
		c.push('</table>');

		div.html(c.join(''));
	}

	function foundryListWriteLocal(event)
	{
		localStorage.setItem(FOUNDRY_LS_NAME, JSON.stringify(foundryList));
		foundryListReadLocal(event);
	}

	function foundryListAddItem(event)
	{
		var id = $('input.project.id').val();
		if(id == '')
		{
			alert('ID cannot be empty');
			return;
		}
		var name = $('input.project.name').val();
		var blueprint_drop = $('input.project.blueprint').val();
		var blueprint = $('input.project.blueprint-got').val();
		var component1_name = $('input.project.comp1-name').val();
		var component1_drop = $('input.project.comp1-drop').val();
		var component1_need = $('input.project.comp1-need').val();
		var component1_have = $('input.project.comp1-have').val();
		var component2_name = $('input.project.comp2-name').val();
		var component2_drop = $('input.project.comp2-drop').val();
		var component2_need = $('input.project.comp2-need').val();
		var component2_have = $('input.project.comp2-have').val();
		var component3_name = $('input.project.comp3-name').val();
		var component3_drop = $('input.project.comp3-drop').val();
		var component3_need = $('input.project.comp3-need').val();
		var component3_have = $('input.project.comp3-have').val();
		var component4_name = $('input.project.comp4-name').val();
		var component4_drop = $('input.project.comp4-drop').val();
		var component4_need = $('input.project.comp4-need').val();
		var component4_have = $('input.project.comp4-have').val();

		var components = 
		[
			{
				"name": component1_name,
				"drop": component1_drop,
				"required": component1_need,
				"owned": component1_have
			},
			{
				"name": component2_name,
				"drop": component2_drop,
				"required": component2_need,
				"owned": component2_have
			},
			{
				"name": component3_name,
				"drop": component3_drop,
				"required": component3_need,
				"owned": component3_have
			},
			{
				"name": component4_name,
				"drop": component4_drop,
				"required": component4_need,
				"owned": component4_have
			}
		]

		var item = 
		{
			"id": id,
			"name": name,
			"blueprint_drop": blueprint_drop,
			"blueprint": blueprint,
			"components": components
		}

		foundryList.push(item);
		foundryListWriteLocal(event);
	}

	function foundryListRemoveItem(event)
	{

	}


//// DOCUMENT INITIALIZATION ////
	$('input.wikiaid').val('');
	$('input.project').val('');
	if(typeof(localStorage) !== 'undefined')
	{
		console.log('Local storage is supported.');
		if(localStorage.getItem(NIGHTMODE_LS_NAME) == null)
		{
			localStorage.setItem(NIGHTMODE_LS_NAME, 'false');
			nightmode = false;
		}
		else
		{
			nightmode = localStorage.getItem(NIGHTMODE_LS_NAME) == 'true';
		}

		toggleNightMode(null, nightmode);

	}
	else
		console.log('Local storage is NOT supported.');

	wikiaListReadLocal(event);
	foundryListReadLocal(event);


//// EVENTS ////
	$('button.daynight').click(function(event)
	{
		$('body').addClass('slow-transform');
		toggleNightMode(event, !nightmode);
	});

	$('button.wikiaid.go').click(function(event)
	{
		wikiaGo(event);
	});

	$('input.wikiaid').keydown(function(event)
	{
		wikiaGo(event);
	});

	$('button.wikiaid.add').click(function(event)
	{
		wikiaFormToggle(event);
	});

	$('button.wikiaform.submit').click(function(event)
	{
		wikiaListAddItem(event);
		$('div.wikiaform').hide();
		$('button.wikiaid.add').text('Add to list...');
	});

	$('div.wikialist button.remove').click(function(event)
	{
		console.log('Remove index: ' + event.target.value);
		wikiaListRemoveItem(event);
	});

	$('a.foundry-guess').click(function(event)
	{
		var s = $(event.target);
		var comp;
		var type;

		if(s.hasClass('comp1'))
			comp = 'comp1';
		else if(s.hasClass('comp2'))
			comp = 'comp2';
		else if(s.hasClass('comp3'))
			comp = 'comp3';

		if(s.hasClass('warframe'))
			type = 'warframe';
		else if(s.hasClass('gun'))
			type = 'gun';
		else if(s.hasClass('melee'))
			type = 'melee';

		var field = $('input.project.' + comp + '-name').val(defaultComponents[type][comp]);
	});

	$('button.foundryform.submit').click(function(event)
	{
		foundryListAddItem(event);
	});

	$('button.foundry-add').click(function(event)
	{
		foundryFormToggle(event);
	});



	$('button.moralpointstoggle').click(function(event)
	{
		var btn = $(event.target);
		if(btn.hasClass('m2033'))
		{
			var div = $('div.moralpoints.m2033');
			div.toggle();
			if(div.is(':visible'))
				btn.text('Hide Metro 2033 moral points');
			else
				btn.text('Show Metro 2033 moral points');
		}
		else if(btn.hasClass('mll'))
		{
			var div = $('div.moralpoints.mll');
			div.toggle();
			if(div.is(':visible'))
				btn.text('Hide Metro Last Light moral points');
			else
				btn.text('Show Metro Last Light moral points');
		}
	});
}
);