$(document).ready(function()
{
   $('#contactForm').on('submit',function(e)
   {
      e.preventDefault();
      showMessage();
      var msg={
         'name': $('#senderName').val(),
         'email': $('#senderEmail').val(),
         'phone': $('#senderPhone').val(),
         'message': $('#message').val(),
         'captcha': $("#g-recaptcha-response").val()
      };
      msg.name=msg.name.replace(/\w\S*/g,function(txt) { return txt.charAt(0).toUpperCase()+txt.substr(1).toLowerCase(); });
      $.ajax({
         type: 'POST',
         url: '/message/',
         data: msg,
         success: function(data)
         {
            if(data=='Ok')
               closeMessage();
            else
               messageFail(data);
         },
         error: function()
         {
            messageFail(false)
         }
      });
   });
});
function showMessage()
{
   $('.message').slideToggle();
}
function closeMessage()
{
   $('.message>h5').html('Message Sent');
   $('.message>p').html("We'll get in touch with you soon");
   setTimeout(showMessage,5000);
   setTimeout(function()
   {
      $('.message>h5').html('Sending Message');
      $('.message>p').html("Please wait");
   },5500);
}
function messageFail(param)
{
   if(param===false)
   {
      $('.message>h5').html('Message sending failed');
      $('.message>p').html("Please check your connection");
   }
   else
   {
      $('.message>h5').html('Error');
      $('.message>p').html(param);
   }
   $('.message').removeClass('black').addClass('red');
   setTimeout(showMessage,5000);
   setTimeout(function()
   {
      $('.message>h5').html('Sending Message');
      $('.message>p').html("Please wait");
      $('.message').removeClass('red').addClass('black');
   },5500);
}
