$(document).ready(function() {
	console.log("doc ready")

	setEvents()

	$("button").click(function() {
		var startPage = ("/wiki/" + $('.show-start').text());
		var finishPage = ("/wiki/" + $('.show-finish').text());
		var stopSpinner = null
		$.ajax({
				url: '/get-pages-for-spinner',
				type: 'POST',
				data: {
					startPage: startPage,
				},
			})
			.done(function(response) {
				// console.log(response)
				stopSpinner = kickOffSpinner(response)
			})

		$.ajax({
				url: '/get-links',
				type: 'POST',
				data: {
					startPage: startPage,
					finishPage: finishPage
				},
			})
			.fail(function(jqXHR, textStatus) {
				$('.results').append("sorry, nothing found")
					// $("button").click()
			})
			.done(function(response) {
				console.log(response)
				if (stopSpinner) stopSpinner()
				var viewArray = []
				if (response.solved) {
					viewArray = response.solution
				} else {
					viewArray = success(response.bl, response.fl)
					if (!viewArray) {
						$('.results').append("Nothing found")
						return
					}
				}
				$('.results').append("start at" + startPage + " , click '" + viewArray[5] + "'' (" + viewArray[4] + "), click '" + viewArray[3] + "' (" + viewArray[2] + ") and look for " + viewArray[1])
			})
			.always(function() {})
	})
})



var delay = (function() {
	var timer = 0;
	return function(callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	}
})()

function setButtonColorAndMessage() {
	if ($(".show-start").text() != "" && $(".show-finish").text() != "") {
		$("button").addClass('button-red')
		$("button").text("GO")
	} else {
		$("button").removeClass('button-red')
	}
}

function setEvents() {

	$('input').keyup(function() {
		delay(function() {

			if ($('.start-input').val() != "") {
				startInputAjax()

			}

			if ($('.finish-input').val() != "") {
				finishInputAjax()
			}

		}, 500)
	})

}

function startInputAjax() {
	console.log("firing start ajax")
	$.ajax({
			url: '/start',
			type: 'POST',
			data: {
				start_wiki: $('.start-input').val()
			},
		})
		.done(function(response) {
			$('.show-start').text(response)
			setButtonColorAndMessage()
			setStartLink(response)
		})
}


function finishInputAjax() {
	console.log("firing finish ajax")
	$.ajax({
			url: '/finish',
			type: 'POST',
			data: {
				finish_wiki: $('.finish-input').val()
			},
		})
		.done(function(response) {
			$('.show-finish').text(response)
			setButtonColorAndMessage()
			setFinishLink(response)
		})
}


function setStartLink(page) {
	$('.start-link').attr('href', "http://en.wikipedia.org/wiki/" + page);

}

function setFinishLink(page) {
	$('.finish-link').attr('href', "http://en.wikipedia.org/wiki/" + page);

}

function buildDisplay(start, links, finish) {
	var div = "<div>" + start + "->"
	div += finish + "<div>"
	return div

}

function kickOffSpinner(spinArray) {
	var counter = 0
	var interval = setInterval(doStuff, 75)
	var spinArrayLength = spinArray.length

	function doStuff() {
		$('.spin-zone').text(spinArray[counter % spinArray.length])
		counter++
	}

	return function() {
		clearInterval(interval)
	}

}


function success(bl, fl) {

	for (i = 0; i < bl.length; i++) {
		for (j = 0; j < fl.length; j++) {

			if (bl[i][0] == fl[j][0]) {
				return bl[i].concat(fl[j])
			}
		}
	}

	return null

}