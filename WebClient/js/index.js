$('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

$( document ).ready(function() {

	window.addEventListener("load", function (ev) {
        
        	loadCamera(0);


    }, false);	
});




function loadCamera(cameraIndex){
	var img = new Image();
	var cam = document.getElementById("cam0");
	img.addEventListener("load", function loaded(ev) {
		cam.parentNode.replaceChild(img, cam);
		img.id = "cam0";
		cam = img;
	//load();
	}, false);
	img.src = "/streamvideo?cameraindex="+cameraIndex;
	$("#mon_status").text("ON");	
}