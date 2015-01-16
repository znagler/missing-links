$( document ).ready(function() {

	setEvents()

	$( "button" ).click(function() {

		var startPage = ("/wiki/"+$('.show-start').text());
		var finishPage = ("/wiki/"+$('.show-finish').text());

	$.ajax({
		url: '/get-links',
		type: 'POST',
		data: {startPage: startPage, finishPage: finishPage},
	})
	.done(function(response) {
		$('.results').append(buildDisplay(startPage,response,finishPage))

		// console.log(startPage)
		console.log(response)
		// console.log(finishPage)

	})

	})

})



var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	}
})()

function setButtonColorAndMessage(){
	if ($(".show-start").text()  != "" && $(".show-finish").text()  != ""){
		$("button").addClass('button-red')
		$("button").text("GO")
	} else{
		$("button").removeClass('button-red')
	}

}

function setEvents(){

	$('input').keyup(function(){
		delay(function(){

			if ($('.start-input').val() != ""){
				startInputAjax()

			}

			if ($('.finish-input').val() != ""){
				finishInputAjax()
			}

		}, 500 )
	})

}

function startInputAjax(){
	$.ajax({
		url: '/start',
		type: 'POST',
		data: {start_wiki: $('.start-input').val()},
	})
	.done(function(response) {
		$('.show-start').text(response)
		setButtonColorAndMessage()
		setStartLink(response)
	})
}


function finishInputAjax(){
	$.ajax({
		url: '/finish',
		type: 'POST',
		data: {finish_wiki: $('.finish-input').val()},
	})
	.done(function(response) {
		$('.show-finish').text(response)
		setButtonColorAndMessage()
		setFinishLink(response)
	})
}


function setStartLink(page){
	$('.start-link').attr('href',"http://en.wikipedia.org/wiki/"+page);

}

function setFinishLink(page){
	$('.finish-link').attr('href',"http://en.wikipedia.org/wiki/"+page);
	
}

function buildDisplay(start, links, finish){
	var div = "<div>"+start+"->"
	div += finish + "<div>"
	return div

}