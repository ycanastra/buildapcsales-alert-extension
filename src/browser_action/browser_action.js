$(document).ready(function(){
	initPopup();
	// checkSettings();

	$('#keyword-input').keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault()
			var keyword = $(this).val()
			addKeywordRequest(keyword);
		}
	});
	$('#keyword-list').on('click', '.close-button', function(event) {
		event.preventDefault();
		var keyword = $(this).parent().text().slice(0, -1);
		deleteKeywordRequest(keyword);
		deleteKeyword($(this));
	});
});

function addKeyword(keyword) {
	var div = $('<div class="keyword-list-item"></div>');
	var closeButton = $('<a class="close-button" href="#">&#10006;</a>');
	var keywordLabel = $('<label class="keyword-label"></label>');

	keywordLabel.html(keyword);
	keywordLabel.append(closeButton);
	div.append(keywordLabel);

	$('#keyword-list').prepend(div);
}

function addKeywordRequest(keyword) {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;
		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/process.php',
				data: {userid: userid, keyword: keyword},
				dataType: 'json',
				success: function(rsp, status) {
					addKeyword(keyword);
				}
			});
		}
	});
}

function deleteKeywordRequest(keyword) {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;
		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/delete_keyword.php',
				data: {userid: userid, keyword: keyword},
				dataType: 'json',
				success: function(rsp, status) {

				}
			});
		}
	});
}

function deleteKeyword(closeButton) {
	var keywordItem = closeButton.parent().parent();
	keywordItem.remove();
}

function checkSettings() {
	chrome.storage.sync.get('checkboxEmail', function(item) {
		var emailIsChecked = item.checkboxEmail;
		if (!emailIsChecked) {
			$('#notification-note').show();
		}
		else {
			$('#notification-note').hide();
		}
	});
}

function initPopup() {
	checkUserId();
	retrieveKeywordsRequest();
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
