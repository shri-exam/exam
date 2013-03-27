/* Use namespace */
APP = {};
APP.modules = {};


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
        albums = {};

    /*  PRIVATE METHODS */

    function getImages (albumURL,index) {
    
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
        loadAlbums: getAlbums
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
    console.log(currentClass);
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