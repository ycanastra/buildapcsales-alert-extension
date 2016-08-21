$(document).ready(function(){
	checkUserId();
	initEmailInfo();
	restoreSettings();

	$('#save-button').on('click', function(e) {
		e.preventDefault();
		processSettings();
	});
});

function saveSettings() {
	var emailIsChecked = $('#checkbox-email').is(':checked');
	chrome.storage.sync.set({checkboxEmail: emailIsChecked});
}

function restoreSettings() {
	chrome.storage.sync.get('checkboxEmail', function(item) {
		var emailIsChecked = item.checkboxEmail;
		if (emailIsChecked) {
			$('#checkbox-email').prop('checked', true);
		}
	});
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

function processSettings() {
	chrome.storage.sync.get('userid', function(items) {
		var userid = items.userid;
		var email = $('#email-input').val();
		var emailOption = ($('#checkbox-email').is(':checked')) ? 1 : 0;
		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/process_settings.php',
				data: {userid: userid, email: email, emailOption: emailOption},
				dataType: 'json',
				success: function(rsp, status) {
					toastr.options = {
						"positionClass": "toast-top-right",
						"showMethod": "fadeIn",
						"hideMethod": "fadeOut",
						"showDuration": "500",
						"hideDuration": "500",
						"timeOut": "5000"
					}
					toastr.success('Email has been submitted successfully!');
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
	var emailInput = document.getElementById('email-input');
	emailInput.value = email;
}
