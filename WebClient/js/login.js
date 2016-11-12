$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});
function sendLoginRequest(){
   $('#loginbutton').attr("disabled", true);
   var username = $("#username").val();
   var password = $("#password").val();

   $.ajax({
      url: '/login',
      type: "post",
      data : {username:username,password:password},
      success: function(data){
         window.location.href = "index.html";
      },
      error:function(error){
         $('#loginbutton').attr("disabled", false);
         alert(error.message);
      }
   });
}