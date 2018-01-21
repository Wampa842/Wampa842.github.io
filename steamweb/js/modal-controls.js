$(document).ready(function()
{
	const modalDismissClass = '.modal-box-button-dismiss';
	const modalDismissHtml = '<button class="modal-box-input modal-box-button-dismiss">Dismiss</button>';
	const modalYesClass = '.modal-box-button-yes';
	const modalYesHtml = '<button class="modal-box-input modal-box-button-yes">Yes</button>';
	const modalNoClass = '.modal-box-button-no';
	const modalNoHtml = '<button class="modal-box-input modal-box-button-no">No</button>';

	var container = $('.modal-background');
	var title = $('.modal-box-title');
	var message = $('.modal-box-message');
	var inputs = $('.modal-box-input-container');

	function showModal()
	{
		container.css('display', 'flex');
		$('body').css('overflow', 'hidden');
	}

	function hideModal()
	{
		container.css('display', 'none');
		$('body').css('overflow', 'initial');
	}

	$('.modal-help-wikia').click(function(event)
	{
		showModal();
		title.text("Wikia shortcuts");
		message.html("Type the name of a Wikia article into the text field (case sensitive), then press Enter to jump to the article.<br>You can also add frequently visited articles to a permanent list.");
		inputs.html(modalDismissHtml);
		$(modalDismissClass).click(function(event)
		{
			hideModal();
			$(modalDismissClass).off('click');
		});
	});

	$('.modal-help-foundry').click(function(event)
	{
		showModal();
		title.text("Foundry");
		message.html("This section tracks the requirements and components for foundry items.<br>You can open the new item form by clicking the \"Add new project\" button, then enter the item's name, Wikia ID, drop locations, and owned and required quantities.<br>Clicking on the F/G/M letters enters the usual components for warframes, guns and melee weapons, respectively.<br>Components that you still need to acquire will be marked with bold letters.");
		inputs.html(modalDismissHtml);
		$(modalDismissClass).click(function(event)
		{
			hideModal();
			$(modalDismissClass).off('click');
		});
	});

	$('.save-local-data').click(function(event)
	{
		showModal();
		title.text("Save/load local data");
		message.html("Generate a JSON file to open it in another browser<br>");
		inputs.html('<button class="modal-box-input modal-box-button-download-json">Generate JSON file</button><button class="modal-box-input modal-box-button-load-json-dummy">Load JSON file</button><input class="modal-box-load-json-file" type="file" hidden />' + modalDismissHtml + '<a class="modal-box-save-json-file" hidden />');
		$(modalDismissClass).click(function(event)
		{
			hideModal();
			$(modalDismissClass).off('click');
		});
		$('.modal-box-button-download-json').click(function(event)
		{
			var data = 
			{
				wikia: wikiaList,
				foundry: foundryList,
				shortcuts: shortcutList
			};
			var blob = new Blob([JSON.stringify(data)], {type: "application/json"});
			var backupLink = document.createElement("a");
			var dummyLink = document.createElement("a");
			var url = URL.createObjectURL(blob);
			$(backupLink).attr('href', url);
			$(backupLink).attr('target', '_blank');
			$(backupLink).html("Click here if you can't download the file.");
			$(backupLink).css('width', '100%');
			$(backupLink).appendTo(message);

			$(dummyLink).attr('href', url);
			$(dummyLink).attr('download', "warframe-tracker-data.json");
			$('body').append(dummyLink);
			dummyLink.click();

			$(modalDismissClass).click(function(event)
			{
				$(dummyLink).remove();
				$(backupLink).remove();
				window.URL.revokeObjectURL(url);
			});
		});

		$('.modal-box-load-json-file').change(function(event)
		{
			var reader = new FileReader();
			reader.onload = function(event)
			{
				//alert(event.target.result);
				var data = JSON.parse(event.target.result);
				wikiaList = $.extend(true, [], data["wikia"]);
				foundryList = $.extend(true, [], data["foundry"]);
				shortcutList = $.extend(true, [], data["shortcuts"]);
				wikiaListWriteLocal(event);
				foundryListWriteLocal(event);
				shortcutListWriteLocal(event);
			}
			reader.readAsText(event.target.files[0]);
		});

		$('.modal-box-button-load-json-dummy').click(function(event)
		{
			event.preventDefault();
			$('.modal-box-load-json-file').trigger('click');
			hideModal();
			$(modalDismissClass).off('click');
		});
	});

	$('.delete-local-data').click(function(event)
	{
		showModal();
		title.text("WARNING");
		message.html("Deleting the local data will remove all wikia items, foundry projects and shortcuts, as well as reset all preferences.<br>Proceed?");
		inputs.html(modalYesHtml + modalNoHtml);
		$(modalYesClass).click(function(event)
		{
			localStorage.clear();
			hideModal();
			$(modalDismissClass).off('click');
			$(modalYesClass + ', ' + modalNoClass).off('click');
		});
		$(modalNoClass).click(function(event)
		{
			hideModal();
			$(modalDismissClass).off('click');
			$(modalYesClass + ', ' + modalNoClass).off('click');
		});
	});
});