$(function(){
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
        sidebar.append($('<div class="homepage"><strong>homepage:</strong><a href="'+ that.proj.homepage+'" target="_blank">'+ that.proj.homepage +'</a></div>'));
      }
      var filesWrapper = $('<div class="files">');
      filesWrapper.append($('<div class="files-header">Files:</div>'));
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
      this.$ = $('<li data-id="'+this.id+'" class="lib"></li>').append($("<div class='header'><div class='name'>"+this.name+"</div><a class='more-info'>more</a><a class='add add-library'>add latest</a></div>"));
    }
    this.displayed = true;
  };
  
  var apiUrl = "http://api.cdnjs.com/libraries";
  var wrapper, libsContainer, searchUI, libs;
  
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
    wrapper.appendTo($('body'));
    wrapper.append(searchUI);
    wrapper.append($('<div class="close">X</div>'));
    libsContainer = $('<ul id="libraries">').text('loading');
    wrapper.append(libsContainer);
    searchUI.focus();
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
      $(e.target).animate({'opacity': 0});
      libs[id].addFile($(e.target).data('index'));
    });
    $(document).on('click', '.w-wrapper .done', function(){
      wrapper.animate({'opacity': 0}, function(){
        wrapper.remove();
      });
    });
    $(document).on('click', function(e){
      var parent = $(e.target).parents('.w-wrapper');
      if(parent.length < 1 || $(e.target).hasClass('close'))
      {
        wrapper.remove();
      }
    });
  };
  init();
  function updateView(){
    var rows = $('<ul id="#library">');
    for(var i = 0; i < libs.length; i++)
    {
      if(libs[i].displayed){
        rows.append(libs[i].$);
      }
    }
    libsContainer.html(rows);
  };
  
  function loadjscssfile(filename){
    console.log("loaded ", filename);
    if (/(js)$/.test(filename)){ 
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
    }
    else if (/(css)$/.test(filename)){ 
        var fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref!="undefined")
    {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
    else{
      console.log("an error has occured when trying to load"+filename);
    }
  }
  var styles = ".w-wrapper{font-family:Helvetica Neue;font-size:16px;max-width:600px;margin:auto;position:fixed;left:0;right:0;top:0;z-index:1000;background-color:white;-webkit-animation:wSlideTopIn 0.3s ease-out;animation:wSlideTopIn 0.3s ease-out}.w-wrapper *{box-sizing:border-box}.w-wrapper a{color:black}.w-wrapper ul{margin:0;-webkit-padding-start:0}.w-wrapper .close{width:30px;display:inline-block;text-align:center;cursor:pointer}.w-wrapper input{width:calc(100% - 30px);font-size:18px;padding:8px 5px}.w-wrapper #libraries{max-height:500px;overflow:auto}.w-wrapper .lib{list-style:none;width:100%;border-bottom:1px #0074D9 solid}.w-wrapper .lib:before,.w-wrapper .lib:after{content:none}.w-wrapper .lib.added .header{background-color:#3D9970}.w-wrapper .header{padding:5px;background-color:#001f3f;color:white;cursor:pointer}.w-wrapper .header:hover{background-color:#00060c}.w-wrapper .name{display:inline-block}.w-wrapper .add-library,.w-wrapper .add{background-color:#2ECC40}.w-wrapper .add{padding:3px 6px;margin-right:5px}.w-wrapper .more-info{background-color:#7FDBFF}.w-wrapper .button,.w-wrapper .add-library,.w-wrapper .more-info{text-transform:uppercase;display:inline-block;font-size:0.8em;font-weight:bold;cursor:pointer}.w-wrapper .add-library,.w-wrapper .more-info{padding:0px 10px;float:right;margin-right:5px}.w-wrapper .more{display:none;padding:5px;background:#0074D9}.w-wrapper .desc{display:inline-block;vertical-align:top;width:57%}.w-wrapper .sidebar{display:inline-block;width:40%}.w-wrapper .homepage{margin-bottom:10px}.w-wrapper .homepage a{color:#7FDBFF}.w-wrapper .homepage strong{display:block;color:black}.w-wrapper .files{background:#AAAAAA;max-height:350px;overflow:auto}.w-wrapper .files .files-header{background:#909090;padding:5px}.w-wrapper .files .file{display:block;padding:5px 5px}@-webkit-keyframes wSlideTopIn{from{-webkit-transform:translateY(-100%);transform:translateY(-100%)}to{-webkit-transform:translateY(0%);transform:translateY(0%)}}@keyframes wSlideTopIn{from{-webkit-transform:translateY(-100%);transform:translateY(-100%)}to{-webkit-transform:translateY(0%);transform:translateY(0%)}}";
  var stylesElem = document.createElement('style');
  stylesElem.innerHTML = styles;
  document.querySelector('head').appendChild(stylesElem);

});

