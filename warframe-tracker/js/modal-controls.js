$(document).ready(function()
{
	const modalDismissClass = '.modal-button-dismiss';
	const modalDismissHtml = '<button class="modal-box-input modal-button-dismiss">Dismiss</button>';
	const modalYesClass = '.modal-button-yes';
	const modalYesHtml = '<button class="modal-box-input modal-button-yes">Yes</button>';
	const modalNoClass = '.modal-button-no';
	const modalNoHtml = '<button class="modal-box-input modal-button-no">No</button>';

	var container = $('.modal-background');
	var title = $('.modal-box-title');
	var message = $('.modal-box-message');
	var inputs = $('.modal-box-input-container');

	function showModal(rows, msg)
	{
		$('.modal-box-input-container').empty();
		for(var i = 0; i < rows; ++i)
		{
			console.log(msg, i);
			$('<div class="modal-box-input-row row-' + i + '"></div>').appendTo(inputs);
		}
		container.css('display', 'flex');
		$('body').css('overflow', 'hidden');
	}

	function hideModal()
	{
		$('.modal-box-input-container').empty();
		container.css('display', 'none');
		$('body').css('overflow', 'initial');
		$('.modal-box-input').off('click');
	}

	$('.modal-help-wikia').click(function(event)
	{
		showModal(1);
		title.text("Wikia shortcuts");
		message.html("Type the name of a Wikia article into the text field (case sensitive), then press Enter to jump to the article.<br>You can also add frequently visited articles to a permanent list.");
		$('.modal-box-input-row').html(modalDismissHtml);
		$(modalDismissClass).click(function(event)
		{
			hideModal();
			$(modalDismissClass).off('click');
		});
	});

	$('.modal-help-foundry').click(function(event)
	{
		showModal(1);
		title.text("Foundry");
		message.html("This section tracks the requirements and components for foundry items.<br>You can open the new item form by clicking the \"Add new project\" button, then enter the item's name, Wikia ID, drop locations, and owned and required quantities.<br>Clicking on the W/G/M letters enters the usual components for warframes, guns and melee weapons, respectively.<br>Components that you still need to acquire will be marked with bold letters.");
		$('.modal-box-input-row').html(modalDismissHtml);
		$(modalDismissClass).click(function(event)
		{
			hideModal();
			$(modalDismissClass).off('click');
		});
	});

	$('.save-local-data').click(function(event)
	{
		showModal(2, 'asd');
		title.text("Save/load local data");
		message.html("Generate a JSON file to open it in another browser.<br>For the moment, this is the only way I can think of to transfer data between browsers and devices.<br>Save the JSON file, then open it in another browser to transfer the data - and avoid editing it by hand.<br>");
		var inputFirstRow =
			'<button class="modal-box-input modal-button-download-json">Generate JSON file</button>' +
			'<button class="modal-box-input modal-button-load-json">Load JSON file</button>' +
			'<input class="modal-load-json-file" type="file" hidden />' +
			modalDismissHtml +
			'<a class="modal-save-json-file" hidden />';

		var inputSecondRow =
			'<button class="modal-box-input modal-button-json-remote-save">Save data to server...</button>' +
			'<button class="modal-box-input modal-button-json-remote-load">Load data from server...</button>';

		$('.modal-box-input-row.row-1').html(inputFirstRow);
		$('.modal-box-input-row.row-0').html(inputSecondRow);

		$(modalDismissClass).click(function(event)
		{
			hideModal();
			$(modalDismissClass).off('click');
		});

		$('.modal-button-download-json').click(function(event)
		{
			if($('.json-download-backup-link').length)
				$('.json-download-backup-link').remove();

			var blob = new Blob([JSONstringifyAll()], {type: "application/json"});
			var backupLink = document.createElement("a");
			var dummyLink = document.createElement("a");
			var url = URL.createObjectURL(blob);
			$(backupLink).attr('href', url);
			$(backupLink).attr('target', '_blank');
			$(backupLink).addClass('json-download-backup-link');
			$(backupLink).html("<strong>Click here if you can't download the file.</strong>");
			$(backupLink).css('width', '100%');
			$(backupLink).appendTo(message);
			$(backupLink).click(function(event){$(backupLink).remove();});

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

		$('.modal-load-json-file').change(function(event)
		{
			var reader = new FileReader();
			reader.onload = function(event)
			{
				JSONparseAll(event.target.result);
			}
			reader.readAsText(event.target.files[0]);
		});

		$('.modal-button-load-json').click(function(event)
		{
			event.preventDefault();
			$('.modal-load-json-file').trigger('click');
			hideModal();
		});

		$('.modal-button-json-remote-load').click(function(event)
		{
			showModal(2);
			title.text("Load data from server");
			message.html("Enter your key below to retrieve your data.");
			$('.modal-box-input-row.row-0').html('<input type="text" class="modal-box-input modal-remote-key">');
			$('.modal-box-input-row.row-1').html('<button class="modal-box-input modal-button-yes">Load</button><button class="modal-box-input modal-button-dismiss">Cancel</button>');
			$('.modal-button-dismiss').click(function(event)
			{
				hideModal();
			});
			$('.modal-button-yes').click(function(event)
			{
				loadDataRemote();
				$('.modal-button-dismiss').trigger('click');
			});
		});

		$('.modal-button-json-remote-save').click(function(event)
		{
			showModal(3);
			title.text("Save data to server");
			message.html("Enter an alphanumeric key below to store your data on the server. You can later retrieve it using the same key.<br>Note: this is only an identifier, not a password. It is not linked to you in any way and it is not encrypted. The stored data will be deleted when the expiration time (one week at most) is reached.<br><strong>DO NOT use your actual password!</strong>");
			$('.modal-box-input-row.row-0').html('<div class="modal-box-input-label">Key:</div><input type="text" class="modal-box-input json-remote-save-key">');
			$('.modal-box-input-row.row-1').html('<div class="modal-box-input-label">Expires in</div><input type="number" class="modal-box-input modal-remote-expiration" min="0.5" max="168" step="0.5" value="1"><div class="modal-box-input-label">hours</div>');
			$('.modal-box-input-row.row-2').html('<button class="modal-box-input modal-button-yes">Save</button><button class="modal-box-input modal-button-dismiss">Cancel</button>');
			$('.modal-button-dismiss').click(function(event)
			{
				hideModal();
			});
			$('.modal-button-yes').click(function(event)
			{
				saveDataRemote();
				$('.modal-button-dismiss').trigger('click');
			});
		})
	});

	$('.delete-local-data').click(function(event)
	{
		showModal(1);
		title.text("WARNING");
		message.html("Deleting the local data will remove all wikia items, foundry projects and shortcuts, as well as reset all preferences.<br>Proceed?");
		inputs.html(modalYesHtml + modalNoHtml);
		$(modalYesClass).click(function(event)
		{
			localStorage.clear();
			hideModal();
		});
		$(modalNoClass).click(function(event)
		{
			hideModal();
		});
	});
});