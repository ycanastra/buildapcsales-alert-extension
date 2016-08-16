$(document).ready(function(){
	initPopup();
	checkSettings();

	$('#keyword-input').keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault()
			addKeywordRequest($(this));
		}
	});
	$('#keyword-list').on('click', '.close-button', function(event) {
		event.preventDefault();
		deleteKeywordRequest($(this));
	});
});

function addKeyword(keyword) {
	var div = $('<div class="keyword-list-item icon-addon addon-lg"></div>');
	var keywordLabel = $('<label class="keyword-label"></label>');
	var closeButton = $('<label class="close-button glyphicon glyphicon-remove" title="Remove"></label>');

	keywordLabel.html(keyword);
	div.append(keywordLabel);
	div.append(closeButton);

	$('#keyword-list').prepend(div);
}

function addKeywordRequest(keywordInput) {
	var keyword = keywordInput.val();
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;
		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/processnew.php',
				data: {userid: userid, keyword: keyword},
				dataType: 'json',
				success: function(data) {
					var alreadyExists = data;
					if (alreadyExists) {
						$('#input-error').slideDown(200);
						$("#input-div").addClass('has-error');
					}
					else {
						addKeyword(keyword);
						keywordInput.val('');
					}
				},
				error: function(data) {
					alert('error');
				}
			 });
		}
	});
}

function deleteKeywordRequest(closeButton) {
	var keywordListItem = closeButton.parent();
	var keyword = keywordListItem.text()
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;
		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/delete_keyword.php',
				data: {userid: userid, keyword: keyword},
				dataType: 'json',
				success: function(rsp, status) {
					keywordListItem.remove();
				}
			});
		}
	});
}

function checkSettings() {
	chrome.storage.sync.get('checkboxEmail', function(item) {
		var emailIsChecked = item.checkboxEmail;
		if (!emailIsChecked) {
			$('#notification-warning').show();
		}
		else {
			$('#notification-warning').hide();
		}
	});
}

function initPopup() {
	checkUserId();
	retrieveKeywordsRequest();
	$('#input-error').hide();
}

function checkUserId() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid
		if (!userid) {
			userid = getRandomToken()
			chrome.storage.sync.set({userid: userid})
		}
	})
}

function getRandomToken() {
	var randomPool = new Uint8Array(32);
	crypto.getRandomValues(randomPool);
	var hex = '';
	for (var i = 0; i < randomPool.length; ++i) {
		hex += randomPool[i].toString(16);
	}
	return hex;
}

function retrieveKeywordsRequest() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid
		if (userid) {
			$.ajax({
				type: 'POST',
				dataType: 'json',
				data: {userid: userid},
				url: 'http://159.203.229.225/buildapcsales-alert/php/retrieve_products.php',
				success: function (data, status) {
					for (var i = 0; i < data.length; i++) {
						addKeyword(data[i]['name']);
					}
				}
			})
		}
	})
}
