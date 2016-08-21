function subscribeBox() {
   ele=('<a id="sub-super" href="#sub" class="popup-with-zoom-anim button">Subscribe for updates</a>'+
   '<div id="sub" class="teamlist-popup zoom-anim-dialog mfp-hide">'+
   '<h3>Subscribe to recieve updates every month!</h3>'+
   '<p>We never spam or share your credentials with a third party :)</p>'+
   '<p><a id="errorMessage"></a></p>'+
   '<form id="subForm">'+
   '<input type="email" name="subEmail" required="required" id="subEmail" pattern="^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$" placeholder="user@domain.com" />'+
   '<div class="g-recaptcha" style="margin-top:10px;" data-sitekey="6LeqBAoTAAAAAAr4g5iXIu9FO0K5nWhu0NtNDiv7"></div>'+
   '<div>'+
   '<input type="submit" id="sendMessage" name="sendMessage" class="button" value="Confirm" style="display:inline-block;margin-top:0;" />'+
   '<img id="progress" src="https://d1asmq9pjfbzxs.cloudfront.net/images/progress.gif" />'+
   '</div>'+
   '<input type="checkbox" id="hidePopupCheck" name="hidePopup" style="margin-top:10px;" onchange="popupBlock();">Don\'t pop up again'+
   '<style>'+
   '#progress {'+
   'width: auto;'+
   'height: 100%;'+
   'opacity: 0;'+
   'opacity: 0;'+
   'margin: 0;'+
   'position: relative;'+
   'top: 13px;'+
   'display: inline-block;'+
   '}'+
   '</style>'+
   '</form>'+
   '</div>');
   return ele;
}
