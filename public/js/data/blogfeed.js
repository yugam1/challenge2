var _blogfeed={
   data: [
       {
          title: 'Hey freshers!',
          date: new Date(2015,7,5),
          desc: 'We\'re doing a week-long series of articles to introduce the freshers of 2015-16 to TeamKART',
          banner: '/posts/2015/8/intro/resources/banner.jpg',
          location: '/blog/intro'
       },
       {
          title: 'The Sacrifices we make',
          date: new Date(2015,5,24),
          desc: 'Akshat Baveja, ex-team leader, on his four year long experiences with TeamKART and FSAE.',
          banner: '/posts/2015/6/akshat/resources/banner.jpg',
          location: '/blog/the-sacrifices-we-make'
       },
       {
          title: 'The A-team',
          date: new Date(2015,6,5),
          desc: 'Vyom Srivastava, marketing head, writes on his experiences with FSAE and the TeamKART CPR team.',
          banner: '/posts/2015/7/vyom/resources/banner.jpg',
          location: '/blog/the-a-team'
       },
       {
          title: 'Intake manifolds and organ pipes',
          date: new Date(2015,6,5),
          desc: 'Rohan Chaturvedi, junior member of the Engine team, on air intake tuning.',
          banner: '/posts/2015/7/chatur/resources/banner.jpg',
          location: '/blog/intake-manifolds-and-organ-pipes'
       }
   ],
   blogFeedPageCount: function() {
      return Math.ceil(this.data.length/4);
   },
   blogFeedGenerator: function(pageNo) {
      if(this['pno'+pageNo]!==undefined)
         return this['pno'+pageNo]
      pageNo=Number(pageNo);
      var str='';
      this.blogFeedGenerator.sorted=this.blogFeedGenerator.sorted||this.sort();
      if(this.data.length>4) {
         str=str+'<div class="blogpager">';
         if(pageNo>1)
            str=str+'<div class="previous"><a href="blog.html?pno='+(pageNo-1)+'" class="button next-prev"><< Newer</a></div>';
         if(pageNo<this.blogFeedPageCount())
            str=str+'<div class="next"><a href="blog.html?pno='+(pageNo+1)+'" class="button next-prev">Older >></a></div>';
         str=str+'</div>';
      }
      str=str+'<hr />';
      for(i=4*(pageNo-1) ;i<4*pageNo&&this.blogFeedGenerator.sorted[i];i++) {
         str=str+'<article class="post"><figure><a href="'+this.blogFeedGenerator.sorted[i].location+'">'+
             '<img src="'+this.blogFeedGenerator.sorted[i].banner+'" /><figcaption><h2>'+this.blogFeedGenerator.sorted[i].title+'</h2>'+
             '<div class="post-date">'+this.blogFeedGenerator.sorted[i].date.toDateString().slice(4)+'</div></figcaption></a></figure><p>'+this.blogFeedGenerator.sorted[i].desc+
             ' <a href="'+this.blogFeedGenerator.sorted[i].location+'">Read more...</a></p></article><hr />';
      }
      if(this.data.length>4) {
         str=str+'<div class="blogpager">';
         if(pageNo>1)
            str=str+'<div class="previous"><a href="blog.html?pno='+(pageNo-1)+'" class="button next-prev"><< Newer</a></div>';
         if(pageNo<this.blogFeedPageCount())
            str=str+'<div class="next"><a href="blog.html?pno='+(pageNo+1)+'" class="button next-prev">Older >></a></div>';
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
      window.history.replaceState({ pno: urlVariable('pno')||'1' },null,null);
      $('a.next-prev').click(function(e) {
         e.preventDefault()
         v=this.href.split('/').pop();
         window.history.pushState({ pno: v[v.length-1] },null,v);
         $('.leftcontainer').html('<div><img src="https://s3.amazonaws.com/teamkart/images/progress.gif" /></div');
         $('.leftcontainer').html($(_blogfeed.blogFeedGenerator(urlVariable('pno')||v[v.length-1])));
         paginator();
      });
      window.onpopstate=function(e) {
         $('.leftcontainer').html('<div><img src="https://s3.amazonaws.com/teamkart/images/progress.gif" /></div');
         $('.leftcontainer').html($(_blogfeed.blogFeedGenerator(e.state.pno)));
         paginator();
      }
   }
}
