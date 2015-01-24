$(document).ready(function() {
	console.log("doc ready")

	setEvents()

	$("button").click(function() {
		console.log("button click")

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
					if (!viewArray){
						$('.results').append("Nothing found")
						return
					}
				}

				$('.results').append("start at" + startPage + " , click '" + viewArray[5] + "'' (" + viewArray[4] + "), click '" + viewArray[3] + "' (" + viewArray[2] + ") and look for " + viewArray[1])

				// var viewArray = []
				// response.backs.forEach(function(backArray) {

				// 	response.fronts.forEach(function(frontArray) {
				// 		if (frontArray[0] == backArray[0]) {
				// 			solutions.push(frontArray.concat(backArray))
				// 			console.log(frontArray.concat(backArray))
				// 		}
				// 	})
				// })
				console.log("done checking")
				// console.log(solutions)
				// if (solutions.length > 0) {
				// 	var startPage = ("/wiki/" + $('.show-start').text());

				// 	$('.results').append("start at" + startPage + " , click '" + solutions[0][3] + "'' (" + solutions[0][2] + "), click '" + solutions[0][1] + "' (" + solutions[0][0] + ") and look for " + solutions[0][5])

				// }
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
	var counter = 0
	var interval = setInterval(doStuff, 75)
	var spinArrayLength = spinArray.length

	function doStuff() {
		$('.spin-zone').text(spinArray[counter % spinArray.length])
		counter++
	}

	return function(){
		clearInterval(interval)
	}

}


function success(bl, fl){
	console.log("SUCCESS CALLED")
	console.log("SUCCESS CALLED")
	console.log("SUCCESS CALLED")
	console.log("SUCCESS CALLED")
	console.log("SUCCESS CALLED")
	console.log(bl.length)
	console.log(fl.length)
	console.log("checking for success with",bl.length * fl.length)

	for (i = 0; i < bl.length; i++) { 
		for (j = 0; j < fl.length; j++) { 	

			if (bl[i][0] == fl[j][0]) {
				console.log("*****************************")
				console.log("*****************************")
				console.log("*****************************")
				console.log("*****************************")
				console.log("*****************************")
				return bl[i].concat(fl[j])
			}
		}
	}
	console.log("nothing found at 25")

	return null

}
