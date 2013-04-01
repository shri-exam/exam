$(document).ready(function(){

    /* GLobal init */  

    // BUG: CLOSE ALBUM-BAR WHEN image loading!!!!

    // preloader sprite
    $('<img>').attr('src','./img/sprites.png');
    $('.wrap').height( $('body').height()*2 );

    /* Event listeners */
    $('.album-bar__button').bind('click', toggleAlbumBar);
    $('.search__btn').bind('click', searchAlbums);
    $('.album-bar').delegate('img','click', loadImages);
    $('.preview-bar').delegate('img','click', loadLargeImages);

    $('.wrap').bind('mousemove', mouseMove);
    $('.preview-bar').bind('mouseleave',mouseLeave);
    $(document).bind('mouseleave',docMouseLeave);


    $('.left').bind('click', left);
    $('.right').bind('click', right);

    // arrow
    $('.cnts').css({ 'top': ($('body').height()/2)+50 });


    /* Realisation listeners */
    var isArrowsShow = false;
    $('.cnts').hide();

    function docMouseLeave () {
        // hide arrows
        isArrowsShow = false;
        $('.cnts').fadeOut(100);
    }


    function left () {
        
        if(indexPrev-1 >= 0){    
            $('.preview-bar img[data-index="'+(indexPrev-1)+'"]').click();
        }
        if( $('.preview-bar img').size() * 92 < $(document).width()  ){
           // return;
        }

        photoPos -= 92;    

        if(photoPos < 0 ){
                photoPos = 0;
                return 0;
        }
       
        $('.preview-bar__container').css({'left':-photoPos});
        console.log("left - " + indexPrev);

    };

    function right () {
        
        $('.preview-bar img[data-index="'+(indexPrev+1)+'"]').click();
        
        if( $('.preview-bar img').size() * 92 < $(document).width()  ){
            //return;
        }

        var rightLimit = ($('.preview-bar__container').width() - photoPos)  -92;
        
        if( indexPrev * 92 >  $(document).width()/2){
            photoPos += 92;
        }

        if( rightLimit < $(document).width()){
            photoPos = ($('.preview-bar__container').width()-$(document).width());
        } 

        $('.preview-bar__container').css({'left':-photoPos});
        console.log("right - " + indexPrev);

    };  


    var isOpenPreview = true; 

    $(window).resize(function(e){


        if(!isOpenPreview){
            $('.preview-bar').animate({'top': $(document).height()+200},200);  
            isOpenPreview = true;  
        }
        $('.preview-bar').css({'top':$(document).height()+200});
        //
        // temporary        
        var ps = $('.wrap').offset().top;
        if(ps === 0){
            ps = 240 
        }else{
            ps = 60;
        }
        sd = $('.container__image-current img').height( $('body').height() -ps);
        $('.container__image-current div.wr').height( sd.height()).width( sd.width() );

        $('.cnts').css({ 'top': ($('body').height()/2)+50 });

        /////// LIMIT FOR MAXIMIZATION IMAGE!!!
    });

     
    function mouseLeave (e) {
        isOpenPreview = true;
        $('.preview-bar').animate({'top': $('body').height()+200},200);
    };


    function mouseMove (e) {
        
        if(!isArrowsShow && $('.preview-bar img').size() !== 0){
            $('.cnts').fadeIn(100);
            isArrowsShow = true;
        }

        if(e.clientY > $('body').height() - 100 && isOpenPreview){
            isOpenPreview = false;
            $('.preview-bar').css({'top': $('body').height()+100 });
            $('.preview-bar').animate({'top': $('body').height()-100},200);
        }
        if(e.clientY < $('body').height() - 100 && !isOpenPreview){
            isOpenPreview = true;
            $('.preview-bar').animate({'top': $('body').height()+200},200);
        }

    };




    // Load images from album
    var idAlbum;

    function loadImages () {
        var url = $(this).data('photos');
        idAlbum = $(this).parent().find('span').data('id');

        $('.album-bar').undelegate('img','click', loadImages);

        $('.container__image-current div.wr').remove();
        
        $('.album-bar img').closest('div').removeClass('act');
        $(this).closest('div').addClass('act');

        APP.modules.YandexPhotoAPI.clearCache();
        $('.preview-bar__container').empty();
        $('.preview-bar__container').css({'left':'0'});

        $('.container__image-current').append( '<h1 style="text-align:center;margin-top:100px;">Loading photos...</h1>' );

        $.when( APP.modules.YandexPhotoAPI.loadImages( url ) ).then(function(){
            var user = $('.search__input').val();
            // load photo on width screen
             if( localStorage.getItem(user) != null){
                var data =  ( JSON.parse( localStorage.getItem(user) ) );
                if(data.album === idAlbum){
                    APP.modules.YandexPhotoAPI.setCurrent( data.image );
                    loadNextPhoto(10);
                    loadPrevPhoto(10);
                    //

                    //
                    $('.preview-bar img[data-id="'+data.image+'"]').click();
                    indexPrev = $('.preview-bar img[data-id="'+data.image+'"]').data('index');
                }else{
                    APP.modules.YandexPhotoAPI.setCurrent( 0 );
                    loadNextPhoto( Math.round($(document).width() / 92) +20 );
                    indexPrev = -1;
                    $('.preview-bar img:first').click();
                }
            }else    
                indexPrev = 0;   

            $('.container__image-current h1').remove();
            $('.album-bar').delegate('img','click', loadImages);
            
        });
    };

    // Load large images
    var indexPrev = 0;
    var prevImage = null;
    var prevWidth = 200;
    var maxPreloadeLeftRight = 5;

    function loadLargeImages () {


        var url = $(this).data('src');
        var id = $(this).data('id');
        var index = $(this).data('index');
        
        var idImage = $(this).data('id');
        var user = $('.search__input').val();


        // write to local storage
        localStorage.setItem(user,JSON.stringify({'album':idAlbum,'image':idImage}));



        if(index * 92 > $('body').width()/2)
            loadNextPhoto( 10 );
        
        console.log(photoPos)
        if(photoPos / 92 < 10)
        {

            var added = loadPrevPhoto(5);
             photoPos += 92 * added;

             if( added === 0){
            //    photoPos = 0;

             }
            $('.preview-bar__container').css({'left':-photoPos});
        }


        $('.preview-bar img').closest('div').removeClass('preview-bar__border-active');
        $(this).closest('div').addClass('preview-bar__border-active');

        if( index === indexPrev ){
            return 0;
        }
        
        // temporary        
        var ps = $('.wrap').offset().top;
        if(ps === 0){
            ps = 240 
        }else{
            ps = 60;
        }


        var preloader = new APP.modules.animation({'width':128,'height':128,'speed':50,'frames':12,'imagePath':'./img/sprites-lar.png'});

        var img = $('<img>').attr('src',url).load(function(){
            
            img.css({'width':'auto'});
            img.fadeIn(2000);
            $('.wr').animate({'width':img.width(),'height':img.height()},700);
            prevWidth = img.width();
            preloader.destroy();

        });//.addClass('box_shadow');
        img.css({'height': $('body').height()-ps });
            

        //img.height(  );
        img.hide();

        prel = $('<div class="preloader-lrg">'+preloader.getHTML()+'</div>');
        dv = $('<div style="position:relative;" class="wr">').append(img).append(prel);
                
        dv.height($('body').height()-ps).addClass('box_shadow');
        //dv.width($('body').height()-ps);
        dv.width(prevWidth);

        prel.css({'left':(dv.width()/2) - 64, 'top':dv.height()/2 -64 });


        var position = ($(document).width() / 2) - (dv.width() / 2);

        console.log("index - " + index + " | indexPrev - " + indexPrev)

        if(index > indexPrev){
            // slide next
            $('.container__image-next').css({'left': $(document).width()  });
            if($('.container__image-current img').size()>0){   
                $('.container__image-prev').empty().css({'left':position});
                $('.container__image-current div.wr').appendTo('.container__image-prev');
                $.when($('.container__image-prev').animate({'left': - $('.container__image-current img').width() }),200).then(function(){
                    $('.container__image-prev').empty();
                });
            }

            $.when($('.container__image-next').empty().append(dv).animate({'left':position}),200).then(function(itm){
                $('.container__image-next div.wr').appendTo('.container__image-current');
                
            });   

        }else{
            // slide prev
            $('.container__image-prev').css({'left': - $('.container__image-current img').width()  });
            if($('.container__image-current img').size()>0){   
                $('.container__image-next').empty().css({'left':position});
                $('.container__image-current div.wr').appendTo('.container__image-next');
                $.when($('.container__image-next').animate({'left': $(document).width() }),200).then(function(){
                    $('.container__image-next').empty();
                });
            }

            $.when($('.container__image-prev').empty().append(dv).animate({'left':position}),200).then(function(itm){
                $('.container__image-prev div.wr').appendTo('.container__image-current');
                
            });          
        }

        // Preloade Larg image
        for(i=index-maxPreloadeLeftRight;i<=index+maxPreloadeLeftRight-1;i++){
             
            if(i<0) continue;
            if(i> $('.preview-bar img').size()) continue;
            
            var url = $('.preview-bar img').eq(i).data('src'); 
            $('<img>').attr('src',url).load(function(){
                // loading
            });
        }

        indexPrev = index;
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
            viewPreview.setParam({'index':item.index,'origin':item.original,'src':'./img/clear.png','id':item.id,'preloader':preloader.getHTML()});
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
        return photos.length; 
    };

    // For load prev photos
        function loadPrevPhoto (count) {
        var photos =  APP.modules.YandexPhotoAPI.getPrevImages(count);
        var viewPreview = new APP.modules.JStpl('templates.preview-bar__container-item-templ');

        var count = $('.preview-bar__container').children().size() + photos.length;

        $('.preview-bar__container').width( (count * 92)+10 );
        $('.preview-bar__container').css({'margin':'0 auto'});

        var preloader = new APP.modules.animation({'speed':50,'frames':12,'imagePath':'./img/sprites.png'});

        $.each(photos,function(index,item) {
            viewPreview.setParam({'index':item.index,'origin':item.original,'src':'./img/clear.png','id':item.id,'preloader':preloader.getHTML()});
            $('.preview-bar__container').prepend( viewPreview.getHTML() );

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
        return photos.length; 
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

            // If ssave state
            if( localStorage.getItem(user) != null ){
                var data =  ( JSON.parse( localStorage.getItem(user) ) );
                $('span[data-id="'+data.album+'"]').parent().find('img').click();
            }


        });
    };

    // Toggle albums panel
    function toggleAlbumBar ( event ) {
        
        switch( $(this).text() ){
            case "Закрыть" :{
                $(this).text("Открыть");
                $('.wrap').animate({top:"-180"},400);
                $('.container__image-current img').hide();
                sd = $('.container__image-current img').css({'height': $('body').height()-60});
                $.when($('div.wr').animate({'height': sd.height(),'width':sd.width()})).then(function(){
                    $('.container__image-current img').fadeIn(200);
                });
                

                break;
            }
            case "Открыть" :{
                $(this).text("Закрыть");
                $('.wrap').animate({top:"0"},300);
               // $('.container__image-current div.wr').animate({'height': $('body').height() - 240},300);
               $('.container__image-current img').hide();
                sd = $('.container__image-current img').css({'height': $('body').height()-240});
                $.when($('div.wr').animate({'height': sd.height(),'width':sd.width()})).then(function(){
                    $('.container__image-current img').fadeIn(200);
                });
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
        $('.album-bar__items').css({'left':-pos});
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
             var added = loadPrevPhoto(5);
             photoPos += 92 * added;

             if( added === 0){
                photoPos = 0;
                return 0;
             }
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
        $('.preview-bar__container').css({'left':-photoPos});
        // calculate photoPos
        (delta > 0) ? photoPos += photoStep : photoPos -= photoStep;

    });
});
