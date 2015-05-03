$(function(){
  // Library declaration
  function Library(obj, i){
    this.id = i;
    this.name = obj.name;
    this.latest = obj.latest;
    this.displayed = false;
  }
  Library.prototype.fetchMore = function(){
    var that = this;
    $.get('http://api.cdnjs.com/libraries?search='+this.name+'&fields=version,description,assets,homepage', function(data){
      that.more = $('<div class="more">');
      that.proj = data.results[0];
      that.more.append($('<div class="desc">').text(that.proj.description));
      var sidebar = $('<div class="sidebar">');
      if(that.proj.homepage){
        sidebar.append('<div class="homepage"><strong>website:</strong><a href="'+ that.proj.homepage+'" target="_blank">'+ that.proj.homepage +'</a></div>');
      }
      var filesWrapper = $('<div class="files">')
      filesWrapper.append('<div class="files-header">Files:</div>');
      var files = that.proj.assets[0].files;
      for(var i = 0; i < files.length; i++){
        file = files[i];
        filesWrapper.append($('<a class="file"><div data-index="'+i+'" class="add add-file button">+</div>'+file.name+'</a>'));
      }
      sidebar.append(filesWrapper);
      that.more.append(sidebar);


      that.$.append(that.more);
      that.toggleMore();
    });
  };

  Library.prototype.addFile = function(index){
    var file = this.proj.assets[0].files[index];
    var url = "http://cdnjs.cloudflare.com/ajax/libs/"+this.name+"/"+this.proj.assets[0].version+"/"+file.name;
    this.addToPage(url);
  };

  Library.prototype.toggleMore = function(){
    if(this.moreDisplayed)
    {
      this.moreDisplayed = false;
      this.more.slideUp('fast');
    }
    else if(!this.more){
      this.fetchMore();
    }
    else{
      this.moreDisplayed = true;
      this.more.slideDown('fast');
    }
  };
  Library.prototype.addToPage = function(asset){
    loadjscssfile(asset, 'js');
    $('#notifier').html('Added ' + this.name + ' to the page!');
    this.$.addClass('added');
  };
  Library.prototype.addLatestToPage = function(){
    this.addToPage(this.latest);
    this.$.find('.add-library').remove();
  };
  Library.prototype.display = function(display){
    if(!display)
    {
      this.displayed = false;
      return;
    }
    if(!this.$)
    {
      this.$ = $('<li data-id="'+this.id+'" class="lib"></li>').append("<div class='header'><div class='name'>"+this.name+"</div><a class='more-info'>more</a><a class='add add-library'>add latest</a></div>");
    }
    this.displayed = true;
  };
  

  var apiUrl = "http://api.cdnjs.com/libraries";
  var wrapper;
  var libsContainer;
  var searchUI;
  var libs;
  
  // events binding
  

  // logic
  $.get(apiUrl, function(data){
    libs = [];
    for(var i = 0; i < data.results.length; i++){
      libs.push(new Library(data.results[i], i));
      libs[i].display(true);
    }  
    updateView();
  });
  
  function init(){
    wrapper = $('<div class="w-wrapper">');
    searchUI = $('<input type="text" name="search" placeholder="type in a library">');
    wrapper.append(searchUI);
    libsContainer = $('<ul id="libraries">')
    wrapper.append(libsContainer);
    wrapper.appendTo($('body'));

    searchUI.on('keyup', function(e){
      var query = $(this).val();
      if(query.length >= 1)
      {
        for(var i = 0; i < libs.length; i++){
          libs[i].display(libs[i].name.toLowerCase().search(query.toLowerCase()) > -1); 
        }
        updateView();
      }
      else{
        for(var i = 0; i < libs.length; i++){
          libs[i].display(true); 
        }
        updateView();
      }
    });
  
    $(document).on('click', '.w-wrapper .add-library', function(e){
      var id = $(e.target).parents('[data-id]').data('id');
      libs[id].addLatestToPage();
      e.stopPropagation();
    });
    $(document).on('click', '.w-wrapper .header', function(e){
      var id = $(e.target).parents('[data-id]').data('id');
      libs[id].toggleMore();
    });
    $(document).on('click', '.w-wrapper .add-file', function(e){
      var id = $(e.target).parents('[data-id]').data('id');
      console.log("e.target:", e.target);
      $(e.target).animate({'opacity': 0});
      libs[id].addFile($(e.target).data('index'));
    });
    $(document).on('click', '.w-wrapper .done', function(){
      wrapper.animate({'opacity': 0}, function(){
        wrapper.remove();
      });
    });
  };
  init();
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
  
  function loadjscssfile(filename){
    if (/(js)$/.test(filename)){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (/(css)$/.test(filename)){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
    {
        document.getElementsByTagName("head")[0].appendChild(fileref)
    }
    else{
      console.log("an error has occured when trying to load"+filename);
    }
  }
});

