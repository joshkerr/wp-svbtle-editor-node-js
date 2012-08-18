$(function() {

	$('input.text').focus(function(){
		$('.insertion-point').css('visibility', 'hidden');
		$(this).prev('.insertion-point').css('visibility', 'visible');
	});

});