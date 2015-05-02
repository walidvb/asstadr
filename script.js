// Add your javascript here



console.clear();
$(function(){
    function Library(obj, i){
    this.id = i;
    this.name = obj.name;
    this.latest = obj.latest;
    this.displayed = false;
  }
  Library.prototype.fetchMore = function(){
    var that = this;
    $.get('http://api.cdnjs.com/libraries?search='+this.name+'&fields=version,description', function(data){
      that.more = $('<div class="w-more">'+data.results[0].description+'</div>');
      that.$.append(that.more);
      that
      .fetchedMore = true;
    });
  };
  Library.prototype.openMore = function(){
    if(!this.fetchedMore){
      this.fetchMore();
    }
    else{
      this.more.slideDown();
    }
  }
  Library.prototype.addToPage = function(){
    loadjscssfile(this.latest, 'js');
  }
  Library.prototype.display = function(display){
    if(!display)
    {
      this.displayed = false;
      return;
    }
    if(!this.$)
    {
      this.$ = $('<li data-id="'+this.id+'" class="w-lib"></li>').append("<div class='w-name'>"+this.name+"</div>");
      var addButton = $('<a class="w-add-library">add</a>');
      this.$.append(addButton);
      var moreButton = $('<a class="w-more-info">more</a>');
      this.$.append(moreButton);
    }
    this.displayed = true;
  };
  

  var libsContainer = $("#libraries");
  var apiUrl = "http://api.cdnjs.com/libraries";
  
  var searchUI = $('input[name="search"]');
  searchUI.on('keyup', function(e){
    var query = $(this).val();
    if(query.length >= 2)
    {
      _.map(libs, function(lib){
        lib.display(lib.name.search(query) > -1);
      });
      updateView();
    }
  });
  var libs;
  
  $(document).on('click', '.w-add-library', function(e){
    var id = $(e.target).parents('[data-id]').data('id');
    libs[id].addToPage();
  })
  $(document).on('click', '.w-more-info', function(e){
    console.log('asd');
    var id = $(e.target).parents('[data-id]').data('id');
    libs[id].openMore();
  })
  $.get(apiUrl, function(data){
    libs = [];
    console.log(libs[0]);
    for(var i = 0; i < data.results.length; i++){
      libs.push(new Library(data.results[i], i));
    }  
    libs[50].display(true);
    console.log(libs);
    updateView();
  });
  
  
  function updateView(){
    var rows = [];
    for(var i = 0; i < libs.length; i++)
    {
      if(libs[i].displayed){
        rows.push(libs[i].$);
      }
    }
    libsContainer.html(rows);
  };
  
  function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
    {
        document.getElementsByTagName("head")[0].appendChild(fileref)
    }
  }
});

