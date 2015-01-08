$( document ).ready(function() {

	$('input').keyup(function(){
		delay(function(){

			if ($('.start-input').val() != ""){
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

								if ($('.finish-input').val() != ""){
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
				}, 150 )
		})
})






	// $('.start-input').keyup(function() {
	// 	delay(function(){

	// 	if ($('.start-input').val() != ""){
	// 			$.ajax({
	// 				url: '/start',
	// 				type: 'POST',
	// 				data: {start_wiki: $('.start-input').val()},
	// 			})
	// 			.done(function(response) {
	// 				$('.show-start').text(response)
	// 				setButtonColor()
	// 			})
	// 			}
	// 		}, 300 )
	// 	})


	// $('.finish-input').keyup(function() {

	// 	delay(function(){

	// 	if ($('.finish-input').val() != ""){
	// 			$.ajax({
	// 				url: '/finish',
	// 				type: 'POST',
	// 				data: {finish_wiki: $('.finish-input').val()},
	// 			})
	// 			.done(function(response) {
	// 				$('.show-finish').text(response)
	// 				setButtonColor()
	// 			})
	// 			}
	// 		}, 300 )
// 	// 	})

// })

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