var _newsfeed={
   data: [
       {
          title: 'Hey freshers!',
          date: new Date(2015,7,5),
          desc: 'We\'re doing a week-long series of articles to introduce the freshers of 2015-16 to TeamKART',
          banner: '/posts/2015/8/intro/resources/banner.jpg',
          location: '/blog/intro'
       },
       {
          title: 'Blog Launch',
          date: new Date(2015,6,6),
          desc: 'TeamKART\'s new blog featuring articles on the FSAE experience, campus life, and technical subjects is now LIVE!!!',
          banner: 'https://s3.amazonaws.com/teamkart/images/blogbanner.jpg',
          location: '/blog'
       },
       {
          title: 'Formula Design Challenge 2015',
          date: new Date(2015,0,28),
          desc: 'TeamKART put in a fantastic effort over 20th to 25th Jan \'15 in Formula Design Challenge 2015, bagging 2nd position in Business Plan Presentation and Cost Report Analysis.',
          banner: '/posts/2015/5/fdc/resources/banner.jpg',
          location: '/posts/fdc'
       },
       {
          title: 'JCB Hand tools',
          date: new Date(2015,4,22),
          desc: 'We welcome JCB Hand Tools to the TeamKART family as we feel proud to announce them as our Major Sponsor for the year 2015-2016.',
          banner: '/posts/2015/5/jcb/resources/banner.jpg',
          location: '/posts/jcb'
       },
       {
          title: 'Alumni Meet 2016',
          date: new Date(2016,0,18),
          desc: 'We put our car on display during the Annual Alumni Meet 2016 where we interacted with the alumni of IIT Kharagpur. It was a very enjoyable experience',
          banner: '/posts/2016/1/alumni/resources/banner.jpg',
          location: '/posts/alumni-meet-2016'
       }
   ],
   newsFeedPageCount: function() {
      return Math.ceil(this.data.length/4);
   },
   newsFeedGenerator: function(pageNo) {
      if(this['pno'+pageNo]!==undefined)
         return this['pno'+pageNo]
      pageNo=Number(pageNo);
      var str='';
      this.newsFeedGenerator.sorted=this.newsFeedGenerator.sorted||this.sort();
      if(this.data.length>4) {
         str=str+'<div class="blogpager">';
         if(pageNo>1)
            str=str+'<div class="previous"><a href="/?pno='+(pageNo-1)+'" class="button next-prev"><< Newer</a></div>';
         if(pageNo<this.newsFeedPageCount())
            str=str+'<div class="next"><a href="/?pno='+(pageNo+1)+'" class="button next-prev">Older >></a></div>';
         str=str+'</div>';
      }
      str=str+'<hr />';
      for(i=4*(pageNo-1) ;i<4*pageNo&&this.newsFeedGenerator.sorted[i];i++) {
         str=str+'<article class="post"><figure><a href="'+this.newsFeedGenerator.sorted[i].location+'">'+
             '<img src="'+this.newsFeedGenerator.sorted[i].banner+'" /><figcaption><h2>'+this.newsFeedGenerator.sorted[i].title+'</h2>'+
             '<div class="post-date">'+this.newsFeedGenerator.sorted[i].date.toDateString().slice(4)+'</div></figcaption></a></figure><p>'+this.newsFeedGenerator.sorted[i].desc+
             ' <a href="'+this.newsFeedGenerator.sorted[i].location+'">Read more...</a></p></article><hr />';
      }
      if(this.data.length>4) {
         str=str+'<div class="blogpager">';
         if(pageNo>1)
            str=str+'<div class="previous"><a href="/?pno='+(pageNo-1)+'" class="button next-prev"><< Newer</a></div>';
         if(pageNo<this.newsFeedPageCount())
            str=str+'<div class="next"><a href="/?pno='+(pageNo+1)+'" class="button next-prev">Older >></a></div>';
         str=str+'</div>';
      }
      this['pno'+pageNo]=str;
      return str;
   },
   sort: function() {
      k=this.data;
      for(i=0;k[i];i++) {
         for(j=i+1;k[j];j++) {
            if(k[i].date<k[j].date) {
               r=k[i];
               k[i]=k[j];
               k[j]=r;
            }
         }
      }
      return k;
   }
}
function urlVariable(varname) {
   varname=varname.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
   var regex=new RegExp("[\\?&]"+varname+"=([^&#]*)"),
       results=regex.exec(location.search);
   return results===null?"":decodeURIComponent(results[1].replace(/\+/g," "));
}
function paginator() {
   if(window.history&&window.history.pushState) {
      $('a.next-prev').click(function(e) {
         e.preventDefault()
         v=this.href.split('/').pop();
         window.history.pushState({ pno: v[v.length-1] },null,v);
         $('#newscontainer').html('<div><img src="https://s3.amazonaws.com/teamkart/images/progress.gif" /></div');
         $('#newscontainer').html($(_newsfeed.newsFeedGenerator(urlVariable('pno')||v[v.length-1])));
         paginator();
      });
      window.onpopstate=function(e) {
         $('#newscontainer').html('<div><img src="https://s3.amazonaws.com/teamkart/images/progress.gif" /></div');
         $('#newscontainer').html($(_newsfeed.newsFeedGenerator(e.state.pno)));
         paginator();
      }
   }
}