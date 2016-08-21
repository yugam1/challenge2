var _social={
   data: [
       {
          link: 'https://www.facebook.com/TeamKART',
          img: 'facebook.png'
       },
       {
          link: 'https://www.instagram.com/team.kart/',
          img: 'insta.png'
       },
       {
          link: 'https://www.linkedin.com/company/2695940',
          img: 'linkedin.png'
       },
       {
          link: 'https://www.youtube.com/channel/UCvHSedfK-dS5wtvZphz8uow',
          img: 'youtube.png'
       }
   ],
   generator: function() {
      var s='';
      for(i=0;this.data[i];i++)
         s=s+'<li><a href="'+this.data[i].link+'" target="_blank"><img class="social-icon" src="https://d1asmq9pjfbzxs.cloudfront.net/images/social-icons/'+this.data[i].img+'" /></a></li>';
      return s;
   }
}

module.exports=_social;