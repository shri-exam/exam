$(document).ready(function(){

    /* GLobal init */  

    // preloader sprite
    $('<img>').attr('src','./img/sprites.png');

    /* Event listeners */
    $('.album-bar__button').bind('click', toggleAlbumBar);
    $('.search__btn').bind('click', searchAlbums);



    /* Realisation listeners */

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
            viewBarElement = new APP.modules.JStpl('templates.album-bar__items__item-templ');
            
            $.each(albums,function(index,item) {
                // create preloader animation
                var preloader = new APP.modules.animation({'speed':50,'frames':12,'imagePath':'./img/sprites.png'});
                
                // templating
                viewBarElement.setParam({'id' : item.id, 'imageCount' : item.count,'src':'./img/clear.png','preloader': preloader.getHTML()});
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
                $('body').animate({top:"-180"},400);
                break;
            }
            case "Открыть" :{
                $(this).text("Закрыть");
                $('body').animate({top:"0"},300);
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
        if( rightLimit < document.width){
            pos = ($('.album-bar__items').width()-document.width);
            return 0;
        }   

        // scroll container
        $('.album-bar__items').css({'left':-pos},300);
        // calculate pos
        (delta > 0) ? pos += step : pos -= step;

    });
});
