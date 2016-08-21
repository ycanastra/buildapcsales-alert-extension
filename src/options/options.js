$(document).ready(function(){
	checkUserId();
	initSettings();

	$('#save-button').on('click', function(e) {
		e.preventDefault();
		processSettings();
	});
});

function initSettings() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;

		if (userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/retrieve_settings.php',
				data: {userid: userid},
				dataType: 'json',
				success: function(rsp, status) {
					if (rsp) {
						var email = rsp[0]['email'];
						var emailOption = rsp[0]['email_option'];
						$('#email-input').val(email);
						if (emailOption == 1) {
							$('#checkbox-email').prop('checked', true);
						}
						else {
							$('#checkbox-email').prop('checked', false);
						}
					}
				}
			});
		}
	});
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
					toastr.success('Settings has been submitted successfully!');
				}
			});
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

function checkUserId() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;

		if (!userid) {
			userid = getRandomToken();
			chrome.storage.sync.set({userid: userid});
		}
	});
}
