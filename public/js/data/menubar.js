var _menubar={
  data: [
      {
        link: '/',
        label: 'Home'
      },
      {
        link: '/about',
        label: 'About'
      },
      {
        link: '/cars',
        label: 'Cars'
      },
      {
        link: '/team',
        label: 'Team'
      },
      {
        link: '/achievements',
        label: 'Achievements',
        active: false
      },
      {
        link: '/gallery',
        label: 'Gallery',
        children: [
            {
              link: '/gallery',
              label: 'All Galleries'
            },
            {
              link: '/gallery/alumni-meet-2016',
              label: 'Alumni Meet 2016'
            },
            {
              link: '/gallery/fdc',
              label: 'FDC 2015'
            },
            {
              link: '/gallery/k2',
              label: 'K-2 gallery'
            },
            {
              link: '/gallery/k1',
              label: 'K-1 gallery'
            }
        ]
      },
      {
        link: '/blog',
        label: 'Blog',
        children: [
            {
              link: '/blog',
              label: 'All Blogposts'
            },
            {
              link: '/blog/turbocharging-10002',
              label: 'Turbocharging 10002'
            },
            {
              link: '/blog/turbochargers',
              label: 'Introduction to turbochargers'
            },
            {
              link: '/blog/intake-manifolds-and-organ-pipes',
              label: 'Intake manifolds and organ pipes'
            }
        ]
      },
      {
        link: '/sponsors',
        label: 'Sponsors'
      },
      {
        link: '/contact',
        label: 'Contact'
      }
  ],
  generator: function() {
    return '<a class="toggleMenu" href="#">Menu</a><nav><ul id="mainmenu">'+this.node(this.data)+'</ul></nav>';
  },
  node: function(e) {
    var str='';
    for(var i=0;e[i];i++) {
      if(!(e[i].active===false)) {
        str=str+'<li><a href="'+e[i].link+'"><span>'+e[i].label+'</span></a>';
        if(e[i].children!=undefined&&e[i].children.length)
          str=str+'<ul>'+this.node(e[i].children)+'</ul>';
        str=str+'</li>';
      }
    }
    return str;
  }
}

module.exports=_menubar;
