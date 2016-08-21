var _gallery={
   data: [
       {
          name: 'fdc',
          url: 'fdc',
          displayAs: 'FDC 2015',
          count: 21,
          date: new Date(2015,0,29),
          desc: "TeamKART at Formula Design Challenge 2015, Coimbatore",
          banner: '13.jpg'
       },
       {
          name: 'k2',
          url: 'k2',
          displayAs: 'K2',
          count: 18,
          date: new Date(2013,5,20),
          desc: "TeamKART, IIT Kharagpur's 2013 car K2",
          banner: '5.jpg'
       },
       {
          name: 'k1',
          url: 'k1',
          displayAs: 'K1',
          count: 15,
          date: new Date(2012,4,15),
          desc: "TeamKART,IIT Kharagpur's car K1",
          banner: '4.jpg'
       },
       {
          name: 'kx1',
          url: 'kx1',
          displayAs: 'KX1',
          count: 24,
          date: new Date(2011,5,9),
          desc: "TeamKART, IIT Kharagpur's first car, KX1",
          banner: '5.jpg'
       },
       {
          name: 'alumni16',
          url: 'alumni-meet-2016',
          displayAs: 'Alumni meet 2016',
          count: 19,
          date: new Date(2016,0,18),
          desc: "Photos from the K2.2 display from the 2016 Alumni Meet",
          banner: '5.jpg'
       }
   ],
   getData: function(url) {
      for(i=0;this.data[i];i++) {
         if(this.data[i].url==url)
            return this.data[i];
      }
      return undefined;
   },
   isGallery: function(name) {
      for(i=0;this.data[i];i++) {
         if(this.data[i].url==name)
            return true;
      }
      return false;
   },
   randomGenerator: function(a) {
      str='';
      added={};
      this.randomGenerator.sorted=this.randomGenerator.sorted||this.sort();
      this.resolution=this.resolution||((window.matchMedia('(max-width: 800px)').matches)?'320':'');
      for(i=0;i<9;i++) {
         a=Math.random()*Math.exp(this.data.length-1);
         c=0;
         if(a>=1)
            c=Math.ceil(Math.log(a));
         c=this.data.length-(c+1);
         b=this.randomGenerator.sorted[c];
         added[b.name]=added[b.name]===undefined?[]:added[b.name];
         d=Math.floor(Math.random()*b.count);
         while(added[b.name].indexOf(d)!=-1)
            d=(d+1)%b.count;
         added[b.name].push(d);
         str=str+'<li><a class="clb-photo" href="https://s3.amazonaws.com/teamkart/images/gallery/'+b.name+'/'+d+'.jpg"><img src="https://s3.amazonaws.com/teamkart/images/gallery/'+b.name+'/thumbs'+this.resolution+'/'+d+'.jpg" /></a></li>';
      }
      if(a==undefined) {
         $(document).ready(function() {
            r=function(e) {
               e.preventDefault();
               $(this).off('click');
               $('ul.team-gallery').html($(_gallery.randomGenerator()));
               $('a.clb-photo').colorbox({ maxWidth: '95%',maxHeight: '95%' });
               $(this).on('click',r);
            }
            $('a.gallery-refresh-button').on('click',r);
         });
      }
      return str;
   },
   generateAll: function() {
      str1='<ul class="resp-tabs-list">',
      str2='<div class="resp-tabs-container">';
      this.generateAll.sorted=this.generateAll.sorted||this.sort();
      for(i=0;this.generateAll.sorted[i];i++) {
         str1=str1+'<li>'+this.generateAll.sorted[i].displayAs+'</li>';
         str2=str2+'<div><ul class="team-gallery">';
         for(j=0;j<this.generateAll.sorted[i].count;j++) {
            str2=str2+
                '<li>'+
                '<a class="clb-photo" href="https://s3.amazonaws.com/teamkart/images/gallery/'+this.generateAll.sorted[i].name+'/'+j+'.jpg">'+
                '<img src="https://s3.amazonaws.com/teamkart/images/gallery/'+this.generateAll.sorted[i].name+'/thumbs320/'+j+'.jpg" />'+
                '</a>'+
                '</li>';
         }
         str2=str2+'</ul></div>';
      }
      str1=str1+'</ul>';
      str2=str2+'</div>';
      return str1+str2;
   },
   generateGiven: function(id) {
      count=this.countOf(id);
      str='';
      for(i=0;i<count;i++)
         str=str+'<li><a href="https://s3.amazonaws.com/teamkart/images/gallery/'+id+'/'+i+'.jpg" class="clb-photo"><img src="https://s3.amazonaws.com/teamkart/images/gallery/'+id+'/thumbs320/'+i+'.jpg" /></a></li>';
      return str;
   },
   countOf: function(id) {
      var c=-1;
      for(i=0;this.data[i];i++)
         if(this.data[i].name==id) {
            c=0;
            break;
         }
      if(c==-1)
         return 0;
      else
         return this.data[i].count;
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

module.exports=exports=_gallery;
