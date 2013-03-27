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
    
    $.when( APP.modules.YandexPhotoAPI.loadAlbums( user ) ).then(function(albums){
        
        $('.album-bar__items').width( albums.length * 100 );        
        $('.album-bar__items').css({"margin":"20px auto"});        
        $('.album-bar__items').hide();  

        viewBarElement = new APP.modules.JStpl('templates.album-bar__items__item-templ');
        
        $.each(albums,function(index,item) {

            viewBarElement.setParam({'imageCount' : item.count, 'src' : item.image});
            $('.album-bar__items').append( viewBarElement.getHTML() );

        });

        $('.album-bar__items').fadeIn(800);
    });

});
