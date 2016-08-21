var popup,
    last;
function datetoNumber(d)
{
   p=d.getDate();
   q=d.getMonth()+1;
   r=d.getFullYear();
   return String(r)+(q<10?'0':'')+String(q)+(p<10?'0':'')+String(p);
}
function checkCookie(cname)
{
   var data=getCookie(cname);
   if(data!="")
      return data;
   else
      return -1;
}
function setCookie(cname,cvalue,ex)
{
   var d=new Date();
   d.setTime(d.getTime()+(ex*365*24*60*60*1000));
   document.cookie=cname+"="+cvalue+"; expires="+d.toGMTString()+"; path=/";
}
function getCookie(cname)
{
   var name=cname+"=";
   var ca=document.cookie.split(';');
   for(var i=0;i<ca.length;i++)
   {
      var c=ca[i].trim();
      if(c.indexOf(name)==0) return c.substring(name.length,c.length);
   }
   return "";
}
function progress()
{
   $('#progress').css('opacity','1');
}
function done()
{
   $('#progress').css('opacity','0');
   $('#errorMessage').html('You are now subscribed');
   setTimeout(function()
   {
      $('button[title="Close (Esc)"]').click();
      $('#errorMessage').html('');
   },2000);
}
function fail(param)
{
   $('#progress').css('opacity','0');
   if(param===false)
      $('#errorMessage').html('Please check your connection');
   else
      $('#errorMessage').html(param);
}
function loadData()
{
   popup=checkCookie('popup');
   if(popup===-1)
   {
      popup='false';
      setCookie('popup',popup,10);
   }
   last=checkCookie('last');
   if(last===-1)
   {
      d=new Date();
      d.getTime();
      last=String(datetoNumber(d)-4);
      setCookie('last',last,10);
   }
}
function onLaunch()
{
   loadData();
   if(popup!='true')
   {
      $('#hidePopupCheck').prop('checked',false);
      d=new Date();
      d.getTime();
      d=datetoNumber(d);
      if(d-last<3)
         return;
      setTimeout(function()
      {
         popupSubscribe();
      },5000);
   }
   else
      $('#hidePopupCheck').prop('checked',true);
}
function popupBlock()
{
   popup=String(document.getElementById('hidePopupCheck').checked);
   setCookie('popup',popup,10);
}
function popupSubscribe()
{
   $('#sub-super').click();
   d=new Date();
   d.getTime();
   last=datetoNumber(d);
   setCookie('last',last,10);
}
$(document).ready(function()
{
   onLaunch();
   $('#subForm').on('submit',function(e)
   {
      e.preventDefault();
      progress();
      var msg={
         'email': $('#subEmail').val(),
         'captcha': $("#g-recaptcha-response").val()
      };
      $.ajax({
         type: 'POST',
         url: '/subscribe/',
         data: msg,
         success: function(data)
         {
            if(data=='Ok')
               done();
            else
               fail(data);
         },
         error: function()
         {
            fail(false)
         }
      });
   });
});