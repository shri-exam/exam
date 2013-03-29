/* Use namespace */
APP = {};
APP.modules = {};
APP.utilites = {};


/*
*   @name   - Yandex API 
*   @type   - STATIC MODULE
*   @return - Deferred object with data  
*/
APP.modules.YandexPhotoAPI = (function() {
    /* VARIABLES */
    var user,
        leftRightLimit = 10,
        format = '?format=json',
        photos = [],
        currentImage = 0;

    /*  PRIVATE METHODS */

    function clearCache () {
        photos = [];
        currentImage = 0;
    };

    function getNextImages (count) {
        var imageList = [];
        var max = count + currentImage;
        for (i = currentImage; i < max; i++){
            if (photos[i]) {
                imageList.push( photos[i] );
                currentImage++;
            };
        };
        return imageList;
    };
    // Create linear structure from all pages
    function createLinearStructure (url) {
        
        var def = $.Deferred();

        // Go read
        recursive(url)
        // Recursive read all pages
        function recursive(url) {
            $.ajax({type: 'GET',dataType: 'jsonp',url: url}).done(function(data){
                $.each(data.entries, function(i,item){
                   
                   if(item.img.orig){

                        photos.push({
                            'preview' : item.img.XXS.href,
                            'original': item.img.orig.href,
                            'id' : item.id
                        });

                    }    
                });
                if(data.links.next)
                    recursive(data.links.next);
                else{
                    def.resolve();
                };
            });
        };
        // return promise    
        return def.promise();

    };

    function loadImages (url) {
        photos = [];
        return $.when( createLinearStructure(url) ).then(function(){
            // all images loading  
        });
    };

    // Read service document
    function readServiseDoc () {
        var url = 'http://api-fotki.yandex.ru/api/users/' + user + '/' + format;
        return $.ajax({type: 'GET',dataType: 'jsonp',url: url});
    };

    // Read all albums
    function getAlbums (userName) {
        // set user name
        user = userName;

        // return promise with albums
        return $.when( readServiseDoc() ).then(function(doc){
            var href = doc['collections']['album-list']['href'] + format;
            return $.ajax({type: 'GET',dataType: 'jsonp',url: href});
        }).pipe(function(albumsList){
            
            //console.log(albumsList)
            return $.map(albumsList.entries, function(item){
                if(item.imageCount !== 0 && item.img !== undefined){
                    return {
                        title : item.title,
                        href  : item.links.photos,
                        image : item.img.XXS.href,
                        id    : item.id,
                        count : item.imageCount
                    };
                };

            });
        });  
    };


    /* PUBLIC METHODS | GETTERS & SETTERS*/
    return {
        loadAlbums: getAlbums,
        loadImages: loadImages,
        getNextImages : getNextImages,
        clearCache : clearCache
    };
})();


/*
*   @name   - JS Templating 
*   @type   - DYNAMYC MODULE
*   @return - Template with render  
*/
APP.modules.JStpl = function(currentClass) {

    /* VARIABLES */

    // get HTML content
    var content = $('.' + currentClass).html();
    /*  PRIVATE METHODS */  

    // render template
    function setParam (params) {
        content = $('.' + currentClass).html();
        $.each(params,function(key,value){
            var search = new RegExp('{{' + key + '}}','g');
            content = content.replace(search,value);
        });
        return content;
    };

    // return result HTML
    function getHTML () {
        return content;
    };
    
    /* PUBLIC METHODS | GETTERS & SETTERS*/
    
    return {
        setParam : setParam,
        getHTML  : getHTML
    };
};

/*
*   @name   - JS Templating 
*   @type   - DYNAMYC MODULE
*   @return - Template with render  
*/
APP.modules.animation = function(option) {

    /* VARIABLES */
    var options = {},
        isPlay = false,
        timerHandler,
        randomID,
        img,
        bPos = 0,
        style;
    
    options = {
        speed : 6,
        width : 50,
        height: 50,
        frames: 0,
        sWidth: 50,
        imagePath: "",
        autostart:true
    };
    
    $.extend(options,option);
    randomID = 'preloader' + Math.floor(Math.random() * ( options.speed * options.height * options.width ) * 100);

    style = 'width:'
        +options.width+'px;height:'
        +options.height+'px;background:url('
        +options.imagePath+')';

    img = $('<div><div class=' + randomID + ' style=' + style + '/></div>');


    // autostart
    if(options.autostart){
        start();
    } 

    /*  PRIVATE METHODS */  

    // begin animation
    function start () {
        var FPS = Math.round(1000 / options.speed);
        timerHandler = setInterval(animate,FPS);
    };

    // animation process
    function animate () {
        bPos+=options.width;
        if(bPos > (options.width * options.frames) )
            bPos = options.width;
        $('.'+randomID).css({'background-position': -bPos+'px 0'});
    };

    // stop animation
    function stop () {
        clearInterval(timerHandler);
    };

    // hide and remove element
    function destroy () {
        stop();
        $.when($('.'+randomID).fadeOut(300)).then(function(el){
            el.remove();
        });    
    };

    // get container
    function getHTML () {
        return img.html();
    };

    /* PUBLIC METHODS | GETTERS & SETTERS*/
    
    return {
        start   : start,
        stop    : stop,
        destroy : destroy,
        getHTML : getHTML
    };
};

/*
*   @name   - JS Horizontal scroll 
*   @type   - STATIC MODULE
*   @return - delta  
*/
APP.modules.horizontalScroll = (function() {

    /* VARIABLES */

    /*  PRIVATE METHODS */  


    // add listener
    function addListener (elem,event) {
        
        // get element
        var element = $(elem)[0];
        
        // add listener
        if (element.addEventListener) {
          if ('onwheel' in document) { element.addEventListener ("wheel", event, false);} 
          if ('onmousewheel' in document) {return element.addEventListener ("mousewheel", returnDelta, false);} 
          //else { element.addEventListener ("MozMousePixelScroll", event, false);}
        } else { element.attachEvent ("onmousewheel", function(){return "asd";});}
   
        // return delta
        function returnDelta (e) {
            e = e || window.event;
            event(e.deltaY || e.detail || e.wheelDelta);
        };
    };

   
    /* PUBLIC METHODS | GETTERS & SETTERS*/
    
    return {
        addListener : addListener
    };
})();