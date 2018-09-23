const WIKIA_LS_NAME = 'steamweb-wikia';
const FOUNDRY_LS_NAME = 'steamweb-foundry';
const SHORTCUTS_LS_NAME = 'steamweb-shortcuts';
const SETTINGS_LS = 'steamweb-settings';

const SUN_ICON = 'res/sun_outline.svg';
const MOON_ICON = 'res/moon_outline.svg';
const SUN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" height="100mm" width="100mm"><path d="M50 18.69l-4.17 7.13a24.54 24.54 0 0 0-4.3 1.16l-7.19-4.1-.04 8.29a24.54 24.54 0 0 0-3.15 3.13l-8.27.04L27 41.55a24.54 24.54 0 0 0-1.15 4.27L18.7 50l7.13 4.17a24.54 24.54 0 0 0 1.16 4.3l-4.1 7.19 8.29.04a24.54 24.54 0 0 0 3.13 3.15l.04 8.27L41.55 73a24.54 24.54 0 0 0 4.27 1.15L50 81.3l4.17-7.13a24.54 24.54 0 0 0 4.3-1.16l7.19 4.1.04-8.29a24.54 24.54 0 0 0 3.15-3.13l8.27-.04L73 58.45a24.54 24.54 0 0 0 1.15-4.27L81.3 50l-7.13-4.17a24.54 24.54 0 0 0-1.16-4.3l4.1-7.19-8.29-.04a24.54 24.54 0 0 0-3.13-3.15l-.04-8.27L58.45 27a24.54 24.54 0 0 0-4.27-1.15z" style="isolation:auto;mix-blend-mode:normal" color="#000" overflow="visible" fill="none" stroke="#050505" stroke-linecap="square"/></svg>';
const MOON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" height="100mm" width="100mm"><path d="M45.8 16.64a33.36 33.36 0 0 0-1.16.04A30.14 30.14 0 0 1 62.8 44.33a30.14 30.14 0 0 1-30.14 30.14 30.14 30.14 0 0 1-11.82-2.42 33.36 33.36 0 0 0 24.97 11.3A33.36 33.36 0 0 0 79.16 50a33.36 33.36 0 0 0-33.35-33.36z" style="isolation:auto;mix-blend-mode:normal" color="#000" overflow="visible" fill="none" stroke="#fff" stroke-width=".53" stroke-linecap="square"/></svg>';

var nightmode = false;
var bgImageEnabled = false;
var bgImageBlur = false;
var backgroundImages;

var wikiaList = [];
var foundryList = [];
var shortcutList = [];

var defaultComponents = 
{
	"warframe": {"comp1": "Chassis", "comp2": "Neuroptics", "comp3":"Systems"},
	"gun": {"comp1": "Barrel", "comp2": "Receiver", "comp3":"Stock"},
	"melee": {"comp1": "Blade", "comp2": "Hilt", "comp3": "Guard"}
};

//// METHODS ////
	function JSONstringifyAll(event)
	{
		var data =
		{
			wikia: wikiaList,
			foundry: foundryList,
			shortcuts: shortcutList
		};
		return JSON.stringify(data);
	}

	function JSONparseAll(s, event)
	{
		var data = JSON.parse(s);
		wikiaList = $.extend(true, [], data["wikia"]);
		foundryList = $.extend(true, [], data["foundry"]);
		shortcutList = $.extend(true, [], data["shortcuts"]);
		wikiaListWriteLocal(event);
		foundryListWriteLocal(event);
		shortcutListWriteLocal(event);
	}

	function saveDataRemote()
	{
		alert('Saving to remote server is TBI');
	}

	function loadDataRemote()
	{
		alert('Loading from remote server is TBI');
	}

	function writeSettings(key, value)
	{
		if(!key || typeof key !== 'string')
			return;	//If the key is invalid (undefined, null, empty or not a string), don't do anything
		if(value === undefined)
			value = '';
		var settings = readSettings();
		if(settings == null)
			settings = {};

		settings[key] = value;
		localStorage.setItem(SETTINGS_LS, JSON.stringify(settings));
	}

	function readSettings(key)
	{
		var settings = JSON.parse(localStorage.getItem(SETTINGS_LS));

		//if the settings object doesn't exist, create an empty object
		if(settings == null)
		{
			settings = {};
			localStorage.setItem(SETTINGS_LS, JSON.stringify(settings));
		}

		//use an undefined key to return the entire object
		if(key === undefined)
			return settings;
		return settings[key];
	}

	function toggleNightMode(event, mode)
	{
		console.log('Night mode is', mode);
		nightmode = mode;
		//localStorage.setItem(SETTINGS_LS, nightmode);
		writeSettings('nightmode', nightmode);
		if(mode)
		{
			$('body').addClass('night');
			$('button.daynight-style').html(MOON_SVG);
		}
		else
		{
			$('body').removeClass('night');
			$('button.daynight-style').html(SUN_SVG);
		}
	}

	function toggleBackground(event, mode, blur)
	{
		return; //Note to self: uncomment the ajax request in the document.onready event
		if(backgroundImages <= 0)
			bgImageEnabled = false;
		bgImageEnabled = mode || mode == 'true';
		bgImageBlur = blur || blur == 'true';

		console.log('Background image is', bgImageEnabled);
		writeSettings('background-image', bgImageEnabled);
		writeSettings('background-blur', bgImageBlur);

		if(bgImageEnabled)
		{
			$('body').addClass('bg-image');
			var l = backgroundImages.length;
			var bgIndex = Math.floor(Math.random() * l) % l;
			console.log('Background image selected:', bgIndex);
			var bg = backgroundImages[bgIndex];
			$('div.background').css("background-image", "url('" + bg['url'] + "')");
			$('div.background').show();
			$('span.background-author').html('Background image by <a href="' + bg["author_link"] + '">' + bg["author"] + '</a>');
			$('span.background-author').show();
		}
		else
		{
			$('body').removeClass('bg-image');
			$('div.background').hide();
			$('span.background-author').hide();
		}

		if(bgImageBlur)
		{
			$('div.background').addClass('blur');
		}
		else
		{
			$('div.background').removeClass('blur');
		}
	}

	function wikiaGo(event)
	{
		if(event.type == 'click' || (event.type == 'keydown' && event.which == 13))
		{
			var id = $('input.wikiaid').val().replace(' ', '_');
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

		wikiaList = $.extend(true, [], data);

		$('div.wikialist button.wikiaid.remove').off('click');

		div.html('');
		c.push('<div style="width: 400px;"><ul>');
		for(var i = 0; i < data.length; ++i)
		{
			c.push('<li><span><a href="http://warframe.wikia.com/wiki/' + data[i]['id'] + '">' + data[i]['name'] + '</a></span>');
			c.push('<button class="wikiaid-button wikiaid-move-up" value="' + i + '">&#x25b2;</button>');
			c.push('<button class="wikiaid-button wikiaid-move-down" value="' + i + '">&#x25bc;</button>');
			c.push('<button class="wikiaid-button wikiaid-remove" value="' + i + '">&#x274c;</button>');
			c.push('</li>');
		}
		c.push('</ul></div>');
		div.html(c.join(''));
		
		$('button.wikiaid-remove').click(function(event)
		{
			wikiaListRemoveItem(event);
		});
		
		$('button.wikiaid-move-up').click(function(event)
		{
			genericListMove(event, wikiaList, 1);
			wikiaListWriteLocal(event);
		});
		
		$('button.wikiaid-move-down').click(function(event)
		{
			genericListMove(event, wikiaList, -1);
			wikiaListWriteLocal(event);
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
		console.log('Remove index: ' + event.target.value);
		wikiaList.splice(event.target.value, 1);
		wikiaListWriteLocal(event);
	}

	function foundryFormToggle(event, val)
	{
		var form = $('div.foundryform');
		var btn = $('button.foundry-add');
		if(val != undefined && val < 0)
			form.hide();
		else if(val != undefined && val > 0)
			form.show();
		else
			form.toggle();
		
		$('button.foundryform.delete').hide();
		$('button.foundryform.update').hide();
		$('button.foundryform.submit').show();

		if(form.is(':visible'))
		{
			btn.text('Cancel');
		}
		else
		{
			btn.text('Add new project');
		}
	}

	function foundryListReadLocal(event)
	{
		var c = [];
		var div = $('tbody.foundrycontent');
		data = JSON.parse(localStorage.getItem(FOUNDRY_LS_NAME));
		if(data == null || data.length <= 0)
		{
			if(data == null)
				localStorage.setItem(FOUNDRY_LS_NAME, '[]');
			div.html('The foundry is empty');
			return;
		}

		foundryList = $.extend(true, [], data);

		$('button.foundryproject.edit').off('click');

		div.html('');
		for(var i = 0; i < data.length; ++i)
		{
			var item = data[i];
			if(item === null)
			{
				continue;
			}
			var blueprint_owned = item['blueprint'] > 0;
			var comp1_owned = item['components'][0]['owned'] >= item['components'][0]['required'];
			var comp2_owned = item['components'][1]['owned'] >= item['components'][1]['required'];
			var comp3_owned = item['components'][2]['owned'] >= item['components'][2]['required'];
			var comp4_owned = item['components'][3]['owned'] >= item['components'][3]['required'];

			c.push('<tr class="foundryproject">');
			c.push('<td class="foundryproject name">');
			c.push('<div class="foundryproject-name-container">');
			c.push('<div class="foundryproject-button-container">');
			c.push('<button class="foundryproject-button foundryproject-edit" value="' + i + '">edit</button>');
			c.push('<div class="foundryproject-button-move-container">');
			c.push('<button class="foundryproject-button foundryproject-move-up" value="' + i + '">&#x25b2;</button>');
			c.push('<button class="foundryproject-button foundryproject-move-down" value="' + i + '">&#x25bc;</button>');
			c.push('</div>');
			c.push('</div>');
			c.push('<a href="https://warframe.wikia.com/wiki/' + item['id'] + '">' + item['name'] + '</a></td>');
			c.push('</div>');
			//c.push('<td class="foundryproject component ' + (blueprint_owned ? 'owned' : '') + ' blueprint"><button class="foundryproject-plusminus" value="i-' + i + '-0">+</button><span>' + item['blueprint_drop'] + ' (' + item['blueprint'] + ' owned)</span><button class="foundryproject-plusminus" value="i-' + i + '-0">+</button></td>');
			c.push('<td class="foundryproject component ' + (blueprint_owned ? 'owned' : '') + ' blueprint"><div class="component-name">' + item['blueprint_drop'] + '</div><div class="component-numbers"><button class="foundryproject-button foundryproject-plusminus" value="i-' + i + '-0">+</button><span>' + item['blueprint'] + '</span><button class="foundryproject-button foundryproject-plusminus" value="d-' + i + '-0">-</button></div></td>');
			var component = item['components'][0];
			c.push('<td class="foundryproject component ' + (comp1_owned ? 'owned' : '') + '"><div class="component-name">' + component['name'] + (component['drop'] != '' ? ' (' + component['drop'] + ')' : '') + '</div>' + (component['name'] != '' ? '<div class="component-numbers"><button class="foundryproject-button foundryproject-plusminus" value="i-' + i + '-1">+</button><span>' + component['owned'] + '</span>/<span>' + component['required'] + '</span><button class="foundryproject-button foundryproject-plusminus" value="d-' + i + '-1">-</button></div>' : '') + '</td>');

			component = item['components'][1];
			c.push('<td class="foundryproject component ' + (comp2_owned ? 'owned' : '') + '"><div class="component-name">' + component['name'] + (component['drop'] != '' ? ' (' + component['drop'] + ')' : '') + '</div>' + (component['name'] != '' ? '<div class="component-numbers"><button class="foundryproject-button foundryproject-plusminus" value="i-' + i + '-2">+</button><span>' + component['owned'] + '</span>/<span>' + component['required'] + '</span><button class="foundryproject-button foundryproject-plusminus" value="d-' + i + '-2">-</button></div>' : '') + '</td>');

			component = item['components'][2];
			c.push('<td class="foundryproject component ' + (comp3_owned ? 'owned' : '') + '"><div class="component-name">' + component['name'] + (component['drop'] != '' ? ' (' + component['drop'] + ')' : '') + '</div>' + (component['name'] != '' ? '<div class="component-numbers"><button class="foundryproject-button foundryproject-plusminus" value="i-' + i + '-3">+</button><span>' + component['owned'] + '</span>/<span>' + component['required'] + '</span><button class="foundryproject-button foundryproject-plusminus" value="d-' + i + '-3">-</button></div>' : '') + '</td>');

			component = item['components'][3];
			c.push('<td class="foundryproject component ' + (comp4_owned ? 'owned' : '') + '"><div class="component-name">' + component['name'] + (component['drop'] != '' ? ' (' + component['drop'] + ')' : '') + '</div>' + (component['name'] != '' ? '<div class="component-numbers"><button class="foundryproject-button foundryproject-plusminus" value="i-' + i + '-4">+</button><span>' + component['owned'] + '</span>/<span>' + component['required'] + '</span><button class="foundryproject-button foundryproject-plusminus" value="d-' + i + '-4">-</button></div>' : '') + '</td>');
			c.push('</tr>');

		}
		div.html(c.join(''));

		$('button.foundryproject-edit').click(function(event)
		{
			foundryListEdit(event);
		});

		$('button.foundryproject-move-up').click(function(event)
		{
			genericListMove(event, foundryList, 1);
			foundryListWriteLocal(event);
		});

		$('button.foundryproject-move-down').click(function(event)
		{
			genericListMove(event, foundryList, -1);
			foundryListWriteLocal(event);
		});

		$('button.foundryproject-plusminus').click(function(event)
		{
			foundryListPlusMinus(event);
		});
	}

	function foundryListWriteLocal(event)
	{
		localStorage.setItem(FOUNDRY_LS_NAME, JSON.stringify(foundryList));
		foundryListReadLocal(event);
	}

	function foundryListItemFromForm()
	{
		var id = $('input.newproject.id').val();
		if(!id)
		{
			alert('ID cannot be empty');
			return;
		}
		var name = $('input.newproject.name').val();
		var blueprint_drop = $('input.newproject.blueprint').val();
		var blueprint = Number($('input.newproject.blueprint-got').val());
		var component1_name = $('input.newproject.comp1-name').val();
		var component1_drop = $('input.newproject.comp1-drop').val();
		var component1_need = Number($('input.newproject.comp1-need').val());
		var component1_have = Number($('input.newproject.comp1-have').val());
		var component2_name = $('input.newproject.comp2-name').val();
		var component2_drop = $('input.newproject.comp2-drop').val();
		var component2_need = Number($('input.newproject.comp2-need').val());
		var component2_have = Number($('input.newproject.comp2-have').val());
		var component3_name = $('input.newproject.comp3-name').val();
		var component3_drop = $('input.newproject.comp3-drop').val();
		var component3_need = Number($('input.newproject.comp3-need').val());
		var component3_have = Number($('input.newproject.comp3-have').val());
		var component4_name = $('input.newproject.comp4-name').val();
		var component4_drop = $('input.newproject.comp4-drop').val();
		var component4_need = Number($('input.newproject.comp4-need').val());
		var component4_have = Number($('input.newproject.comp4-have').val());

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

		return item;
	}

	function foundryListAddItem(event)
	{
		var item = foundryListItemFromForm();
		if(!item)
			return;
		foundryList.push(item);
		foundryListWriteLocal(event);
		foundryFormToggle(event, -1);
	}

	function foundryListRemoveItem(event, index)
	{
		foundryList.splice(index, 1);
		foundryListWriteLocal(event);
		foundryFormToggle(event, -1);
	}

	function foundryListUpdate(event, index)
	{
		var item = foundryListItemFromForm();
		if(!item)
			return;
		foundryList[index] = item;
		foundryListWriteLocal(event);
		foundryFormToggle(event, -1);
	}

	function foundryListEdit(event)
	{
		var index = $(event.target).val();
		foundryFormToggle(event, 1);

		$('button.foundryform.submit').hide();
		$('button.foundryform.update').show();
		$('button.foundryform.delete').show();

		$('button.foundryform.delete, button.foundryform.update').off('click');

		$('button.foundryform.delete').click(function(event)
		{
			foundryListRemoveItem(event, index);
		});

		$('button.foundryform.update').click(function(event)
		{
			foundryListUpdate(event, index);
		});

		$('input.newproject.id').val(foundryList[index]['id']);
		$('input.newproject.name').val(foundryList[index]['name']);
		$('input.newproject.blueprint').val(foundryList[index]['blueprint_drop']);
		$('input.newproject.blueprint-got').val(foundryList[index]['blueprint']);
		$('input.newproject.comp1-name').val(foundryList[index]['components'][0]['name']);
		$('input.newproject.comp1-drop').val(foundryList[index]['components'][0]['drop']);
		$('input.newproject.comp1-need').val(foundryList[index]['components'][0]['required']);
		$('input.newproject.comp1-have').val(foundryList[index]['components'][0]['owned']);
		$('input.newproject.comp2-name').val(foundryList[index]['components'][1]['name']);
		$('input.newproject.comp2-drop').val(foundryList[index]['components'][1]['drop']);
		$('input.newproject.comp2-need').val(foundryList[index]['components'][1]['required']);
		$('input.newproject.comp2-have').val(foundryList[index]['components'][1]['owned']);
		$('input.newproject.comp3-name').val(foundryList[index]['components'][2]['name']);
		$('input.newproject.comp3-drop').val(foundryList[index]['components'][2]['drop']);
		$('input.newproject.comp3-need').val(foundryList[index]['components'][2]['required']);
		$('input.newproject.comp3-have').val(foundryList[index]['components'][2]['owned']);
		$('input.newproject.comp4-name').val(foundryList[index]['components'][3]['name']);
		$('input.newproject.comp4-drop').val(foundryList[index]['components'][3]['drop']);
		$('input.newproject.comp4-need').val(foundryList[index]['components'][3]['required']);
		$('input.newproject.comp4-have').val(foundryList[index]['components'][3]['owned']);
	}

	function foundryListPlusMinus(event)
	{
		var data = event.target.value.split("-");
		var delta = (data[0] == "i" ? 1 : (data[0] == "d" ? -1 : 0));
		var index = Number(data[1]);
		var component = Number(data[2]);
		if(component == 0)
		{
			if(foundryList[index]["blueprint"] + delta < 0)
				return;
			foundryList[index]["blueprint"] += delta;
		}
		else
		{
			if(foundryList[index]["components"][component-1]["owned"] + delta < 0)
				return;
			foundryList[index]["components"][component-1]["owned"] += delta;
		}


		foundryListWriteLocal(event);
	}

	function shortcutListReadLocal(event)
	{
		var c = [];
		var div = $('div.shortcut-list');
		data = JSON.parse(localStorage.getItem(SHORTCUTS_LS_NAME));
		if(data == null || data.length <= 0)
		{
			if(data == null)
				localStorage.setItem(SHORTCUTS_LS_NAME, '[]');	//this fucking line
			div.html('The list is empty.');
			return;
		}

		shortcutList = data;

		$('button.shortcuts-remove').off('click');
		$('button.shortcuts-move-up').off('click');
		$('button.shortcuts-move-down').off('click');

		div.html('');
		c.push('<ul>');
		for(var i = 0; i < data.length; ++i)
		{
			c.push('<li>');
			c.push('<span><a href="' + data[i]['link'] + '">' + data[i]['name'] + '</a></span>');
			c.push('<button class="shortcut-button shortcut-move-up" value="' + i + '">&#x25b2;</button>')
			c.push('<button class="shortcut-button shortcut-move-down" value="' + i + '">&#x25bc;</button>')
			c.push('<button class="shortcut-button shortcut-remove" value="' + i + '">&#x274c;</button>');
			c.push('</li>');
		}
		c.push('</ul>');
		div.html(c.join(''));
		
		$('button.shortcut-remove').click(function(event)
		{
			shortcutListRemove(event);
		});
		
		$('button.shortcut-move-up').click(function(event)
		{
			genericListMove(event, shortcutList, 1);
			shortcutListWriteLocal(event);
		});
		
		$('button.shortcut-move-down').click(function(event)
		{
			genericListMove(event, shortcutList, -1);
			shortcutListWriteLocal(event);
		});
	}

	function shortcutListWriteLocal(event)
	{
		localStorage.setItem(SHORTCUTS_LS_NAME, JSON.stringify(shortcutList));
		shortcutListReadLocal(event);
	}

	function shortcutListAdd(event)
	{
		var item = 
		{
			'name': $('input.shortcut-name').val(),
			'link': $('input.shortcut-url').val()
		};
		shortcutList.push(item);
		shortcutListWriteLocal(event);
	}

	function shortcutListRemove(event)
	{
		shortcutList.splice(event.target.value, 1);
		shortcutListWriteLocal(event);
	}

	function genericListMove(event, subject, direction)
	{
		var index = Number(event.target.value);	//I spent two hours sucking dick to figure out I had to cast the value into a number. Apparently 1 + 1 = 11 in JS.
		console.log('Move item ' + index + ' by ' + event.target.outerHTML + (direction > 0 ? ' up' : ' down'));

		if(direction > 0)
		{
			if(index <= 0)		//move up - move to lower index
				return;
			subject[index-1] = [subject[index], subject[index] = subject[index-1]][0];
		}
		else if(direction < 0)	//move down - move to higher index
		{
			if(index >= shortcutList.length - 1)
				return;
			subject[index+1] = [subject[index], subject[index] = subject[index+1]][0];
		}
	}

	function metroReadMoralPoints()
	{
		function processJSON(data)
		{
			var c = [];
			for(var i = 0; i < data.length; ++i)
			{
				var level = data[i];
				c.push('<div class="metro-level subsection">');
				c.push('<h3>' + level['level'] + '</h3>');
				if('gain' in level)
				{
					c.push('<p>Gain:</p><ul>');
					var gain = level['gain'];
					for(var j = 0; j < gain.length; ++j)
					{
						c.push('<li>' + gain[j] + '</li>');
					}
					c.push('</ul>');
				}
				if('lose' in level)
				{
					c.push('<p>Lose:</p><ul>');
					var lose = level['lose'];
					for(var j = 0; j < lose.length; ++j)
					{
						c.push('<li>' + lose[j] + '</li>');
					}
					c.push('</ul>');
				}
				c.push('</div>');
			}
			$('div.moralpoints.mll').html(c.join(''));
		}//);

		$.ajax(
		{
			dataType: "json",
			url: "data/moralpoints-lastlight.json",
			mimeType: "application/json",
			success: processJSON
		});
	}

$(document).ready(function(event)
{

//// DOCUMENT INITIALIZATION ////
	$('input.wikiaid').val('');
	$('input.project').val('');
	$('input.shortcut').val('');

	if(typeof(localStorage) !== 'undefined')
	{
		console.log('Local storage is supported.');

		nightmode = readSettings('nightmode');
		toggleNightMode(null, nightmode);

		bgImageEnabled = readSettings('background-image');
		bgImageBlur = readSettings('background-blur');

		/*$.ajax(
		{
			dataType: "json",
			url: "data/backgrounds.json",
			mimeType: "application/json",
			success: function(data)
			{
				backgroundImages = [];
				for (var i = 0; i < data.length; ++i)
				{
					backgroundImages = data;
				}
				toggleBackground(null, bgImageEnabled, bgImageBlur);
			}
		});*/
	}
	else
	{
		console.log('Local storage is NOT supported.');
		alert('Attention!\nThis website relies on local storage, which your browser doesn\'t seem to support.');
	}

	wikiaListReadLocal(event);
	foundryListReadLocal(event);
	shortcutListReadLocal(event);

	metroReadMoralPoints();

//// EVENTS ////
	$('button.daynight-switch').click(function(event)
	{
		$('body').addClass('slow-transform');
		toggleNightMode(event, !nightmode);
	});

	$('button.toggle-background-image').click(function(event)
	{
		toggleBackground(event, !bgImageEnabled, bgImageBlur);
	});

	$('button.toggle-background-blur').click(function(event)
	{
		toggleBackground(event, bgImageEnabled, !bgImageBlur);
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

		var field = $('input.newproject.' + comp + '-name').val(defaultComponents[type][comp]);
	});

	$('button.foundryform.cancel').click(function(event)
	{
		foundryFormToggle(event, -1);
	});

	$('button.foundryform.submit').click(function(event)
	{
		foundryListAddItem(event);
	});

	$('button.foundryform.update').click(function(event)
	{
		//foundryListAddItem(event);
	});

	$('button.foundry-add').click(function(event)
	{
		$('input.newproject').val('');
		$('input.newproject.blueprint-got').val('0');
		$('input.newproject.comp-need').val('1');
		$('input.newproject.comp-have').val('0');
		foundryFormToggle(event);
	});

	$('.sidebar').mouseleave(function(event)
	{
		$('.sidebar input, .sidebar a, .sidebar button').blur();
	});

	$('button.shortcut-form-show').click(function(event)
	{
		$('div.shortcut-add-form').show();
		$(event.target).hide();
	});

	$('button.shortcut-cancel').click(function(event)
	{
		$('div.shortcut-add-form').hide();
		$('button.shortcut-form-show').show();
		$('input.shortcut').val('');
	});

	$('button.shortcut-submit').click(function(event)
	{
		shortcutListAdd(event);
		$('input.shortcut').val('');
		$('div.shortcut-add-form').hide();
		$('button.shortcut-form-show').show();
	});

	/*$('button.moralpointstoggle').click(function(event)
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
	});*/
});