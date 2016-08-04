$(document).ready(function(){
  checkUserId()
  initEmailInfo()

  $('#emailInput').keypress(function(e) {
    if(e.which == 13) {
      e.preventDefault()

      var email = $(this).val()
      var emailButton = document.getElementById('emailButton')

      if (emailButton.disabled == false) {
        processEmail(email)
      }
    }
  })

  $('#emailInput').keyup(function(e) {
    var value = $(this).val()
    initEmailButton(value)
  })

	$('#emailButton').click(function(e) {
		e.preventDefault()
    var email = document.getElementById('emailInput').value
    processEmail(email)
	})
});

function getRandomToken() {
	// E.g. 8 * 32 = 256 bits token
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
    userid = items.userid

    if (userid) {
      $.ajax({
        type: 'post',
        url: 'http://159.203.229.225/buildapcsales-alert/php/process_email.php',
        data: {userid: userid, email: email},
        dataType: 'json',
        success: function(rsp, status) {
          setEmailLabel(email)
        }
      });
    }
  })
}

function setEmailLabel(email) {
  if (email) {
    emailLabel = document.getElementById('emailLabel')
    $.when($('#emailLabel').fadeOut(400)).done(function() {
      emailLabel.innerHTML = email
      $('#emailLabel').fadeIn()
    });
  }
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

function initEmailInfo() {
  chrome.storage.sync.get('userid', function(items) {
    userid = items.userid

    if (userid) {
      $.ajax({
        type: 'post',
        url: 'http://159.203.229.225/buildapcsales-alert/php/retrieve_email.php',
        data: {userid: userid},
        dataType: 'json',
        success: function(rsp, status) {

          if (rsp) {
            email = rsp[0]['email']
            initEmailLabel(email)
            initEmailInput(email)
            initEmailButton(email)
          }
					else {
						emailButton = document.getElementById('emailButton')
						emailButton.disabled = true
					}
        }
      });
    }
  })
}

function initEmailLabel(email) {
  emailLabel = document.getElementById('emailLabel')
  emailLabel.innerHTML = email
}

function initEmailInput(email) {
  emailInput = document.getElementById('emailInput')
  emailInput.value = email
}

function initEmailButton(email) {
  emailButton = document.getElementById('emailButton')

	console.log(email)

  if (email.indexOf('@') > -1) {
    emailButton.disabled = false
  }
  else {
    emailButton.disabled = true
  }

}
