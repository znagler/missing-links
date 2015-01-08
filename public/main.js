$( document ).ready(function() {

	setEvents()

})



var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

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
			
		}, 150 )
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
				})
}