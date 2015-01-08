$( document ).ready(function() {

	$('.start-input').keyup(function() {
		delay(function(){

		if ($('.start-input').val() != ""){
				$.ajax({
					url: '/start',
					type: 'POST',
					data: {start_wiki: $('.start-input').val()},
				})
				.done(function(response) {
					console.log(response)
					$('.show-start').text(response)
				})
				}
			}, 300 )
		})


	$('.finish-input').keyup(function() {

		delay(function(){

		if ($('.finish-input').val() != ""){
				$.ajax({
					url: '/finish',
					type: 'POST',
					data: {finish_wiki: $('.finish-input').val()},
				})
				.done(function(response) {
					console.log(response)
					$('.show-finish').text(response)
				})
				}
			}, 300 )
		})

})

var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();