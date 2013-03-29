$(document).ready(function(){

    /* GLobal init */    

    /* Event listeners */
    $('.album-bar__button').bind('click', toggleAlbumBar);



    /* Realisation listeners */

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

    }

    /* Global events */


    var user = "kuzckin-o";
    
    // Sprite preloade
    $('<img>').attr('src','./img/sprites.png');

    $.when( APP.modules.YandexPhotoAPI.loadAlbums( user ) ).then(function(albums){
        
        // setup albums container        
        $('.album-bar__items').width( albums.length * 100 );        
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
    });

});
