$(document).ready(function() {
	console.log("doc ready")

	setEvents()

	$("button").click(function() {
		console.log("button click")

		var startPage = ("/wiki/" + $('.show-start').text());
		var finishPage = ("/wiki/" + $('.show-finish').text());

		$.ajax({
				url: '/get-pages-for-spinner',
				type: 'POST',
				data: {
					startPage: startPage,
				},
			})
			.done(function(response) {
				console.log(response)
				var dummyArr = ["/wiki/1", "/wiki/2", "/wiki/3", "/wiki/4", "/wiki/5", "/wiki/6"]
				kickOffSpinner(dummyArr)

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
				var solutions = []
				response.backs.forEach(function(backArray) {

					response.fronts.forEach(function(frontArray) {
						if (frontArray[0] == backArray[0]) {
							solutions.push(frontArray.concat(backArray))
							console.log(frontArray.concat(backArray))
						}
					})
				})
				console.log("done checking")
				console.log(solutions)
				if (solutions.length > 0) {
					var startPage = ("/wiki/" + $('.show-start').text());

					$('.results').append("start at" + startPage + " , click '" + solutions[0][3] + "'' (" + solutions[0][2] + "), click '" + solutions[0][1] + "' (" + solutions[0][0] + ") and look for " + solutions[0][5])

				}
				// console.log(finishPage)

			})
			.always(function() {
				// console.log("always")
			})

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
	console.log(spinArray)
	var interval = setInterval(doStuff(spinArray), 75)
	var counter = 0
	var spinArrayLength = spinArray.length

	function doStuff(spinArray) {
		console.log(spinArray)
		$('.spin-zone').text(spinArray[counter % spinArray.length])
		console.log("spin")
		counter++
	}

}