$(function() {
 	$(".double a.button").click(function(){  
    	$(".double a.button").removeClass("checked");  
		$("input.RadioClass").attr("checked",null);

		$(this).prev("input.RadioClass").attr("checked","checked");
	    $(this).addClass("checked");
	});
	
	$(".remove").click(function(){
		var answer = confirm('Are you sure?');
		return answer;
	});

     // preview in iframe on the edit page
	$("a.button.preview").click(function(e){
		// does the iframe exist already?
		if ($("iframe.preview").length) {                
               // stop the event propogation
		     e.preventDefault();
               // display the preview pane
               $("div.preview").fadeIn(500);
		} 
	});

     // close preview
	$("a.close").click(function(e){
       e.preventDefault();
       $("div.preview").fadeOut(500);
  	});

	$notice = $('p.wps-notice');
	if($notice.length) {
		$notice.fadeOut(2000);
	} 
	
	$('.open-external').click(function(){
		$('.overlay').show();
	});
	
	$('.close-fancy').click(function(){
		$('.overlay').hide();
	});

	$('.expand').autosize();

	$('form.post-saved').sisyphus({timeout: 1, autoRelease: true});



	// $('body').dropArea();

	// $('body').bind('drop', function(e){
	//   e.preventDefault();
	//   e = e.originalEvent;

	//   var files = e.dataTransfer.files;

	//   for (var i=0; i < files.length; i++) {
	//     // Only upload images
	//     if (/image/.test(files[i].type)) {
	//       createAttachment(files[i]);
	//     }
	//   };
	// });

});