$(document).ready(function(){

    /* GLobal init */  

    // preloader sprite
    $('<img>').attr('src','./img/sprites.png');

    /* Event listeners */
    $('.album-bar__button').bind('click', toggleAlbumBar);
    $('.search__btn').bind('click', searchAlbums);
    $('.album-bar').delegate('img','click', loadImages);


    /* Realisation listeners */

    // Loadi images from album
    function loadImages () {
        var url = $(this).data('photos');
        
        APP.modules.YandexPhotoAPI.clearCache();
        $('.preview-bar__container').empty();
        $('.preview-bar__container').css({'left':'0'});

        $.when( APP.modules.YandexPhotoAPI.loadImages( url ) ).then(function(){
            
            // load photo on width screen
            loadNextPhoto( Math.round($(document).width() / 92) );

        });
    };

    // For load next photo
    function loadNextPhoto (count) {
        var photos =  APP.modules.YandexPhotoAPI.getNextImages(count);
        var viewPreview = new APP.modules.JStpl('templates.preview-bar__container-item-templ');

        var count = $('.preview-bar__container').children().size() + photos.length;

        $('.preview-bar__container').width( (count * 92)+10 );
        $('.preview-bar__container').css({'margin':'0 auto'});

        var preloader = new APP.modules.animation({'speed':50,'frames':12,'imagePath':'./img/sprites.png'});

        $.each(photos,function(index,item) {
            viewPreview.setParam({'src':'./img/clear.png','id':item.id,'preloader':preloader.getHTML()});
            $('.preview-bar__container').append( viewPreview.getHTML() );

            // async image loading
            $('<img>').attr('src',item.preview).load(function(){
                // hide image
                $('img[data-id="'+item.id+'"]').attr('src',item.preview).hide();
                // show image
                $('img[src="'+item.preview+'"]').fadeIn(1000);
                // remove preloader animation
                preloader.destroy();
            });

        });  
    };

    // Search albums of user
    function searchAlbums () {

        $('.search__btn').unbind('click', searchAlbums);

        var user = $(this).closest('div').find('input').val();

        $('.album-bar__items').empty();
        $('.album-bar__container h1.loading').remove();    
        $('.album-bar__container').append('<h1 class="loading">Loading...</h1>');    

        $.when( APP.modules.YandexPhotoAPI.loadAlbums( user ) ).then(function(albums){
            // setup albums container        
            $('.album-bar__container h1.loading').remove();
            $('.album-bar__items').width( (albums.length * 97)+20 );        
            $('.album-bar__items').css({"margin":"20px auto"});        
     
            // create view
            var viewBarElement = new APP.modules.JStpl('templates.album-bar__items__item-templ');
            
            $.each(albums,function(index,item) {
                // create preloader animation
                var preloader = new APP.modules.animation({'speed':50,'frames':12,'imagePath':'./img/sprites.png'});
                
                // templating
                viewBarElement.setParam({'photos':item.href, 'id' : item.id, 'imageCount' : item.count,'src':'./img/clear.png','preloader': preloader.getHTML()});
                // add template to DOM
                $('.album-bar__items').append( viewBarElement.getHTML() );
                
                // async image loading
                $('<img>').attr('src',item.image).load(function(){
                    // hide image
                    $('span[data-id="'+item.id+'"]').parent().find('img').attr('src',item.image).hide();
                    // show image
                    $('img[src="'+item.image+'"]').fadeIn(1000);
                    // remove preloader animation
                    preloader.destroy();
                });
            });
            $('.search__btn').bind('click', searchAlbums);
        });
    };

    // Toggle albums panel
    function toggleAlbumBar ( event ) {
        
        switch( $(this).text() ){
            case "Закрыть" :{
                $(this).text("Открыть");
                $('.wrap').animate({top:"-180"},400);
                break;
            }
            case "Открыть" :{
                $(this).text("Закрыть");
                $('.wrap').animate({top:"0"},300);
            }
        }
    };

    /* Global events */

    // SCROLL ALBUMS EVENT
    var pos = 0;
    var step = 50;
    APP.modules.horizontalScroll.addListener('.album-bar',function(delta){
        
        // if left limit
        if(pos < 0 ){
             pos = 0;
             return 0;
        }
         
        // calculate right limit
        var rightLimit = (pos - $('.album-bar__items').width()) * -1;
        
        // if right limit
        if( rightLimit < $(document).width()){
            pos = ($('.album-bar__items').width()-$(document).width());
            return 0;
        }   

        // scroll container
        $('.album-bar__items').css({'left':-pos},300);
        // calculate pos
        (delta > 0) ? pos += step : pos -= step;

    });

    // SCROLL PHOTOS EVENT
    var photoPos = 0;
    var photoStep = 30;
    var limitToLoad = 92 * 1; // elements-width * limit count 
    APP.modules.horizontalScroll.addListener('.preview-bar',function(delta){
        
        // if left limit
        if(photoPos < 0 ){
             photoPos = 0;
             return 0;
        }
 
        // calculate right limit
        var rightLimit = ($('.preview-bar__container').width() - photoPos);
        
        // if right limit
        if( rightLimit < $(document).width()){
            photoPos = ($('.preview-bar__container').width()-$(document).width());
            return 0;
        }   
        // if right limit
        if( rightLimit < $(document).width() + limitToLoad){
            loadNextPhoto(10);
        }   

        // scroll container
        $('.preview-bar__container').css({'left':-photoPos},300);
        // calculate photoPos
        (delta > 0) ? photoPos += photoStep : photoPos -= photoStep;

    });
});
