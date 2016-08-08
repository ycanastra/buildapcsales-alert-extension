
$(document).ready(function(){
	initPopup();

	checkSettings();

  $('#keywordInput').keypress(function(e) {
    if(e.which == 13) {
      e.preventDefault()

      var keyword = $(this).val()

			if (keyword != '') {
				addKeyword(keyword)
			}
    }
  });

	$('#keywordList').on('click','.closeButton', function(e) {
		e.preventDefault()
		keyword = $(this).closest('label').text()
		keyword = keyword.slice(0, -1);
		deleteKeywordRequest(keyword)
		deleteKeyword(keyword)
		$(this).closest('label').remove()
	});
});

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
	checkUserId()
	$('#errorMessage').hide()

	chrome.storage.sync.set({keywords: []})

	getProducts()
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

function deleteKeyword(keyword) {
	chrome.storage.sync.get('keywords', function(items) {
		keywords = items.keywords

		var index = keywords.indexOf(keyword)

		keywords.splice(index, 1)

		chrome.storage.sync.set({keywords: keywords})
	})

}

function addKeyword(keyword) {
	chrome.storage.sync.get('keywords', function(e) {
		keywords = e.keywords

		if (keywords === undefined) {
			return
		}
		else {
			if (keywords.indexOf(keyword) > -1) {
				errorElement = document.getElementById('errorMessage')
				errorElement.innerHTML = keyword + ' is already in your list!'
				$('#errorMessage').slideDown(200)
				$('#keywordInput').css('border', '1px solid rgba(255, 0, 0, 1)');
			}
			else {
				$('#errorMessage').slideUp(200)
				sendKeyword(keyword)
				var closeButton = '<a class="closeButton" href="#">&#10006;</a>'
				var tag = '<label class="keyword">' + keyword + closeButton + '</label>'

				$("#keywordList").prepend(tag)

				keywords.push(keyword)

				chrome.storage.sync.set({keywords: keywords})
				$('#keywordInput').val('')
				$('#keywordInput').css('border', '1px solid rgba(220, 220, 220, 1)');

			}
		}
	})

}

function getProducts() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid
		if (userid) {
			$.ajax({
				type: 'POST',
				dataType: 'json',
				data: {userid: userid},
				url: 'http://159.203.229.225/buildapcsales-alert/php/retrieve_products.php',
				success: function (data, status) {
					var keywords = []

					if (data === null) {
						console.log('didnt work')
						return
					}

					for (var i = 0; i < data.length; i++) {
						keywords.push(data[i]['name'])
					}

					chrome.storage.sync.set({keywords: keywords}, function() {
						showKeywords(data)
					})
				}
			})
		}
	})
}

function deleteKeywordRequest(keyword) {
	chrome.storage.sync.get('userid', function(items) {
    userid = items.userid
    if (userid) {
      useToken(userid)
    }
    else {
      userid = getRandomToken();
      chrome.storage.sync.set({userid: userid}, function() {
        useToken(userid)
      });
    }
    function useToken(userid) {
      $.ajax({
        type: 'post',
        url: 'http://159.203.229.225/buildapcsales-alert/php/delete_keyword.php',
        data: {userid: userid, keyword: keyword},
        dataType: 'json',
        success: function(rsp, status) {
          if (status === 'success') {
            return
          }
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

function sendKeyword(keyword) {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid;
		if (userid) {
			useToken(userid);
		}
		else {
			userid = getRandomToken();
			chrome.storage.sync.set({userid: userid}, function() {
				useToken(userid);
			});
		}
		function useToken(userid) {
			$.ajax({
				type: 'post',
				url: 'http://159.203.229.225/buildapcsales-alert/php/process.php',
				data: {userid: userid, keyword: keyword},
				dataType: 'json',
				success: function(rsp, status) {
          if (status === 'success') {
            return
          }
				}
			});
		}
	});
}

function getUserId() {
	chrome.storage.sync.get('userid', function(items) {
		userid = items.userid
		if (userid) {
			return userid
		}
		else {
			return ''
		}
	})
}

function showKeywords(keywords) {
  for (var i = 0; i < keywords.length; i++) {
    var closeButton = '<a class="closeButton" href="#">&#10006;</a>'
		var tag = '<label class="keyword">' + keywords[i]['name'] + closeButton + '</label>'
    $("#keywordList").prepend(tag)
  }
}
