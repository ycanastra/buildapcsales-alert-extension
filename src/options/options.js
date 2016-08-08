$(document).ready(function(){
	checkUserId();
	initEmailInfo();
	$('#email-success').hide();

	$('a.close').on('click', function() {
		$(this).parent().slideUp(200);
	})

	$('#emailInput').keypress(function(e) {
		if(e.which == 13) {
			e.preventDefault();
			var emailButton = document.getElementById('emailButton');
			emailButton.click();
		}
	})

	$('#emailInput').keyup(function(e) {
		var value = $(this).val()
		initEmailButton(value)
	})

	$('#emailButton').click(function(e) {
		e.preventDefault();
		var email = document.getElementById('emailInput').value;
		processEmail(email);
	})
});

function getRandomToken() {
	var randomPool = new Uint8Array(32);
	crypto.getRandomValues(randomPool);
	var hex = '';
	for (var i = 0; i < randomPool.length; ++i) {
		hex += randomPool[i].toString(16);
	}
	return hex;
}

function processEmail(email) {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;

		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/process_email.php',
				data: {userid: userid, email: email},
				dataType: 'json',
				success: function(rsp, status) {
					$('#email-success').slideDown(200);
				}
			});
		}
	});
}

function checkUserId() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;

		if (!userid) {
			userid = getRandomToken();
			chrome.storage.sync.set({userid: userid});
		}
	});
}

function initEmailInfo() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;

		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/retrieve_email.php',
				data: {userid: userid},
				dataType: 'json',
				success: function(rsp, status) {

					if (rsp) {
						email = rsp[0]['email'];
						initEmailInput(email);
						initEmailButton(email);
					}
					else {
						emailButton = document.getElementById('emailButton');
						emailButton.disabled = true;
					}
				}
			});
		}
	});
}

function initEmailInput(email) {
	var emailInput = document.getElementById('emailInput');
	emailInput.value = email;
}

function initEmailButton(email) {
	var emailButton = document.getElementById('emailButton')
	var periodIndex = email.lastIndexOf('.');
	var atIndex = email.indexOf('@');

	if (atIndex == -1) {
		emailButton.disabled = true;
	}
	else if (periodIndex == -1) {
		emailButton.disabled = true;
	}
	else if (periodIndex - atIndex < 2) {
		emailButton.disabled = true;
	}
	else if (email.length - periodIndex < 1) {
		emailButton.disabled = true;
	}
	else {
		emailButton.disabled = false;
	}
}
