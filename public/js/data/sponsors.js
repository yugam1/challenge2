var _sponsorsDatabase={
   data: [
      {
         name:'Carbon Light',
         url:'http://www.carbon-light.com/',
         img:'carbonlight.png'
      },
      {
         name:'Novoflex',
         url:'http://www.novoflex.in/',
         img:'novo.png'
      },
      {
         name:'Steel India',
         url:'http://www.steelindia.com/',
         img:'steelindia.png'
      },
       {
         name:'Motul',
         url:'https://www.motul.com/',
         img:'motul.png'
       },
       {
          name: 'Tata Motors',
          url: 'http://www.tatamotors.com/',
          img: 'tata.png'
       },
       {
          name: 'Henkel',
          url: 'http://www.henkel.in/',
          img: 'henkel.png'
       },
       {
          name: 'Forgify',
          url: 'http://forgify.in/',
          img: 'forgify.png'
       },
       {
          name: 'Alu-Fin',
          url: 'http://www.alufingroup.com/',
          img: 'alufin.png'
       },
       {
          name: 'JCB',
          url: 'http://jcb-tools.in/',
          img: 'jcbht.png'
       },
       {
          name: 'Ricardo',
          url: 'http://www.ricardo.com/',
          img: 'ricardo.png'
       },
       {
          name: 'Lafarge',
          url: 'http://www.lafarge.in/',
          img: 'lafarge.png'
       },
       {
          name: 'Hurix',
          url: 'http://hurix.com/',
          img: 'hurix.png'
       },
       {
          name: 'Engineers Udyog',
          url: '#',
          img: 'eu.png'
       }/*,
       {
          name: 'ONGC',
          url: 'http://www.ongcindia.com/',
          img: 'ongc.png'
       },
       {
          name: 'National Instruments',
          url: 'http://india.ni.com/',
          img: 'ni.png'
       },
       {
          name: 'Magod Lasers',
          url: 'http://www.magodlaser.in/',
          img: 'magod.png'
       },
       {
          name: 'Planet Power',
          url: 'http://www.planetpowertools.com/',
          img: 'pp.png'
       }*/
   ],
   shuffle: function() {
      var n=this.data.length;
      while(n) {
         i=Math.floor(Math.random()*n--);
         t=this.data[i];
         this.data[i]=this.data[n];
         this.data[n]=t;
      }
      return this.data;
   },
   generator: function() {
      this.shuffle();
      var str='';
      for(i=0;this.data[i];i++)
         if(!(this.data[i].active===false))
            str=str+'<div class="slide"><a href="'+this.data[i].url+'" target="_blank"><img src="https://d1asmq9pjfbzxs.cloudfront.net/images/sponsors/'+this.data[i].img+'" alt="'+this.data[i].name+'" /></a></div>';
      return str;
   }
}

module.exports=_sponsorsDatabase;
