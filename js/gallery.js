$(document).ready(function(){

    // preloader sprite
    $('<img>').attr('src','./img/sprites.png');
    $('<img>').attr('src','./img/sprites-lar.png');
    
    /* Constanst */
    var MAX_IMAGE_HEIGHT = 700;

    /* Variables */

    // elements
    var doc =                   $(document);
    var body =                  $('body');
    var wrap =                  $('.wrap');
    var previewBar =            $('.preview-bar');
    var previewBarContainer =   $('.preview-bar__container');
    var albumBar =              $('.album-bar');
    var slideBtn =              $('.album-bar__button');
    var searchInput =           $('.search__input');
    var searchBtn =             $('.search__btn');
    var albumBarItems =         $('.album-bar__items');
    var albumBarContainer =     $('.album-bar__container');
    var leftBtn =               $('.left');
    var rightBtn =              $('.right');
    var containerArrows =       $('.container__arrows');
    var containerImageCurrent = $('.container__image-current');
    var containerImageNext =    $('.container__image-next');
    var containerImagePrev =    $('.container__image-prev');
    var textLoadingAlbums =     $('<h1>Loading photos...</h1>').addClass('loading-l');
    var textLoadingPhotos =     $('<h1>Loading...</h1>').addClass('loading');

    // properties
    var isArrowsShow =          false;
    var isOpenPreview =         true; 
    var prevImage =             null;
    var previewBarImageWidth =  92;
    var previewBarTopOffet =    200;
    var albumBarCloseHeight =   60;
    var albumBarOpenHeight =    240;
    var previewBarArea =        100;
    var indexPrev =             0;
    var prevWidth =             200;
    var maxPreloadeLeftRight =  10; // when scroll
    var largePreloadeHalf =     64;
    var photoPos =              0;
    var photoStep =             30;
    var albumPos =              0;
    var albumScrollStep =       50;
    var preloadingPreviewsCount = 20; //  when document loading
    var limitToLoad = previewBarImageWidth * 5; // Elements count to begin or end 
    var idAlbum;

    /* Default set */
    wrap.height( body.height() * 2 );
    containerArrows.css({ 'top': ( body.height() / 2 ) +50 });

    /* Event listeners */
    slideBtn.bind('click', toggleAlbumBar);
    searchBtn.bind('click', searchAlbums);

    albumBar.delegate('img','click', loadImages);
    previewBar.delegate('img','click', loadLargeImages);

    leftBtn.bind('click', left);
    rightBtn.bind('click', right);

    /* global events */
    previewBar.bind('mouseleave',mouseLeavePreviewBar);
    doc.bind('mousemove', mouseMoveDoc);
    doc.bind('mouseleave',docMouseLeave);



    /* Realisation listeners */
    
    containerArrows.hide();

    // Mouse leave from document
    function docMouseLeave () {
        // hide arrows
        isArrowsShow = false;
        containerArrows.fadeOut(100);
    }

    // left arrow handler
    function left () {
        // if image not first then click ob next photo
        if ( indexPrev-1 >= 0 ) {    
            previewBar.find('img[data-index="'+(indexPrev-1)+'"]').click();
        }
        photoPos -= previewBarImageWidth;    
        // stop scrolling if next -1
        if ( photoPos < 0 ) {
            photoPos = 0;
            return 0;
        }
        // scroll
        previewBarContainer.css({'left':-photoPos});
    }

    // right arrow handler
    function right () {
        // click on prev image
        previewBar.find('img[data-index="'+(indexPrev+1)+'"]').click();
        // if end image list
        if ( previewBar.find('img').size() * previewBarImageWidth < doc.width()   ) {
            return;
        }
        // right limit 
        var rightLimit = (previewBarContainer.width() - photoPos) - previewBarImageWidth;
        // if end image list  
        if( rightLimit < doc.width() ){
            photoPos = (previewBarContainer.width()-doc.width() );
        } 
        // scroll
        previewBarContainer.css({'left':-photoPos});
    }
       
    /* Window resize */
    $(window).resize(function (e) {

        if(!isOpenPreview){
            previewBar.animate({'top': doc.height()+previewBarTopOffet},200);  
            isOpenPreview = true;  
        }
        previewBar.css({'top': doc.height()+previewBarTopOffet});
                
        var offsetTop = wrap.offset().top;
        if(offsetTop === 0){
            offsetTop = albumBarOpenHeight; 
        }else{
            offsetTop = albumBarCloseHeight;
        }

        if( body.height() - offsetTop < MAX_IMAGE_HEIGHT ){
            var current = containerImageCurrent.find('img').height( body.height() - offsetTop );
            containerImageCurrent.find('div.box').height( current.height()).width( current.width() );
        }
        containerArrows.css({ 'top': ( body.height() / 2 ) + 50 });
    });

    /* Mouse leave from preview-bar */
    function mouseLeavePreviewBar (e) {
        isOpenPreview = true;
        previewBar.animate({'top': body.height() + previewBarTopOffet },200);
    }

    /* Mouse move on document */
    function mouseMoveDoc (e) {
        if (!isArrowsShow && previewBar.find('img').size() !== 0){
            containerArrows.fadeIn(100);
            isArrowsShow = true;
        }
        if (e.clientY > body.height() - previewBarArea && isOpenPreview ) {
            isOpenPreview = false;
            previewBar.css({'top': body.height() + previewBarArea });
            previewBar.animate({'top': body.height() - previewBarArea },200);
        }
        if(e.clientY < body.height() - previewBarArea && !isOpenPreview){
            isOpenPreview = true;
            previewBar.animate({'top': body.height() + previewBarTopOffet },200);
        }
    }


    // Load images from album
    
    function loadImages () {
        var url = $(this).data('photos');
        idAlbum = $(this).parent().find('span').data('id');

        albumBar.undelegate('img','click', loadImages);

        containerImageCurrent.find('div.box').remove();
        
        albumBar.find('img').closest('div').removeClass('act');
        $(this).closest('div').addClass('act');

        APP.modules.YandexPhotoAPI.clearCache();
        previewBarContainer.empty();
        previewBarContainer.css({'left':'0'});

        containerImageCurrent.append( textLoadingAlbums );

        $.when( APP.modules.YandexPhotoAPI.loadImages( url ) ).then(function(){
            var user = searchInput.val();
             
            // if user data saved
             if( localStorage.getItem(user) != null){
                var data =  ( JSON.parse( localStorage.getItem(user) ) );
                if (data.album === idAlbum) {
                    
                    APP.modules.YandexPhotoAPI.setCurrent( data.image );
                    
                    var nextLoaded = loadNextPhoto(preloadingPreviewsCount); 
                    var prevLoaded = loadPrevPhoto(preloadingPreviewsCount);
                    
                    previewBar.find('img[data-id="'+data.image+'"]').click();
                    indexPrev = previewBar.find('img[data-id="'+data.image+'"]').data('index');

                    var search = previewBar.find('img[data-id="'+data.image+'"]').parent();
                    var centred = ( previewBar.find('div.preview-bar__border').index( search )  * previewBarImageWidth) - (doc.width()  / 2);
                    
                    photoPos = centred;
                    
                    if( nextLoaded  * previewBarImageWidth < doc.width()  / 2)
                    {
                        photoPos = previewBarContainer.width()- doc.width();
                    }
                    if( prevLoaded * previewBarImageWidth < doc.width()  / 2 ){
                        photoPos = 0;
                    }
                    previewBarContainer.css({'left':-photoPos});
                } else {
                    userFirstTime();       
                }
            } else {
                userFirstTime();
            }
            containerImageCurrent.find('h1').remove();
            albumBar.delegate('img','click', loadImages);
        });
    }

    /* for new user */
    function userFirstTime () {
        APP.modules.YandexPhotoAPI.setCurrent( 0 );
        loadNextPhoto( Math.round(doc.width()  / previewBarImageWidth) +20 );
        indexPrev = -1;
        previewBar.find('img:first').click();   
    }
    // Load large images
    
    function loadLargeImages () {


        var url = $(this).data('src');
        var id = $(this).data('id');
        var index = $(this).data('index');
        
        var idImage = $(this).data('id');
        var user = searchInput.val();

        // write to local storage
        localStorage.setItem(user,JSON.stringify({'album':idAlbum,'image':idImage}));

        if ( index * previewBarImageWidth > body.width() / 2 )
            loadNextPhoto( 10 );
        
        if ( photoPos / previewBarImageWidth < 10)
        {
            var added = loadPrevPhoto(5);
            photoPos += previewBarImageWidth * added;

            previewBarContainer.css({'left':-photoPos});
        }

        previewBar.find('img').closest('div').removeClass('preview-bar__border-active');
        $(this).closest('div').addClass('preview-bar__border-active');

        if( index === indexPrev ){
            return 0;
        }
        
        var offsetTop = wrap.offset().top;
        if ( offsetTop === 0 ) {
            offsetTop = albumBarOpenHeight;
        } else {
            offsetTop = 610;
        }

        var preloader = new APP.modules.animation({'width':128,'height':128,'speed':50,'frames':12,'imagePath':'./img/sprites-lar.png'});

        var img = $('<img>').attr('src',url).load(function(){
            
            img.css({'width':'auto'});
            img.fadeIn(2000);
            $('.box').animate({'width':img.width(),'height':img.height()},700);
            prevWidth = img.width();
            preloader.destroy();

        });

        if( body.height()-offsetTop > MAX_IMAGE_HEIGHT) {
            img.css({'height': MAX_IMAGE_HEIGHT });
        } else {
            img.css({'height': body.height()-offsetTop });
        }

        img.hide();
        // prepare box with preloader
        prel = $('<div class="preloader-lrg">'+preloader.getHTML()+'</div>');
        box = $('<div style="position:relative;" class="box">').append(img).append(prel);
        box.height( img.height() ).addClass('box_shadow');
        box.width(prevWidth);
        prel.css({'left':(box.width()/ 2) - largePreloadeHalf, 'top':box.height()/2 - largePreloadeHalf });

        // center position 
        var position = (doc.width()  / 2) - ( box.width() / 2);

        if ( index > indexPrev ) {
            // slide next
            containerImageNext.css({ 'left': doc.width() });
            if ( containerImageCurrent.find('img').size() > 0 ) {   
                containerImagePrev.empty().css({ 'left':position });
                containerImageCurrent.find('div.box').appendTo( containerImagePrev );
                $.when( containerImagePrev.animate({ 'left': - containerImageCurrent.find('img').width() }),200).then(function(){
                    containerImagePrev.empty();
                });
            }
            $.when( containerImageNext.empty().append(box).animate({ 'left':position }),200).then(function(itm){
                containerImageNext.find('div.box').appendTo( containerImageCurrent );
            });   

        }else{
            // slide prev
            containerImagePrev.css({'left': - containerImageCurrent.find('img').width()  });
            if(containerImageCurrent.find('img').size()>0){   
                containerImageNext.empty().css({'left':position});
                containerImageCurrent.find('div.box').appendTo( containerImageNext );
                $.when( containerImageNext.animate({'left': doc.width()  }),200).then(function(){
                    containerImageNext.empty();
                });
            }

            $.when(containerImagePrev.empty().append(box).animate({'left':position}),200).then(function(itm){
                containerImagePrev.find('div.box').appendTo( containerImageCurrent );
            });          
        }

        // Preloade Larg image
        for ( i = index - maxPreloadeLeftRight; i <= index + maxPreloadeLeftRight - 1; i++ ) {
             
            if ( i < 0 ) continue;
            if ( i > previewBar.find('img').size() ) continue;
            var url = previewBar.find('img').eq(i).data('src'); 
            $('<img>').attr('src',url).load(function(){
                // loading
            });
        }
        indexPrev = index;
    }

    // For load next photo
    function loadNextPhoto (count) {
        var photos =  APP.modules.YandexPhotoAPI.getNextImages(count);
        var viewPreview = new APP.modules.JStpl('templates.preview-bar__container-item-templ');
        var count = previewBarContainer.children().size() + photos.length;

        previewBarContainer.width( (count * previewBarImageWidth)+10 );
        previewBarContainer.css({'margin':'0 auto'});

        var preloader = new APP.modules.animation({'speed':50,'frames':12,'imagePath':'./img/sprites.png'});

        $.each(photos,function(index,item) {
            viewPreview.setParam({'index':item.index,'origin':item.original,'src':'./img/clear.png','id':item.id,'preloader':preloader.getHTML()});
            previewBarContainer.append( viewPreview.getHTML() );

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
    }

    // For load prev photos
    function loadPrevPhoto (count) {
        var photos =  APP.modules.YandexPhotoAPI.getPrevImages(count);
        var viewPreview = new APP.modules.JStpl('templates.preview-bar__container-item-templ');
        var count = previewBarContainer.children().size() + photos.length;

        previewBarContainer.width( (count * previewBarImageWidth)+10 );
        previewBarContainer.css({'margin':'0 auto'});

        var preloader = new APP.modules.animation({'speed':50,'frames':12,'imagePath':'./img/sprites.png'});

        $.each(photos,function(index,item) {
            viewPreview.setParam({'index':item.index,'origin':item.original,'src':'./img/clear.png','id':item.id,'preloader':preloader.getHTML()});
            previewBarContainer.prepend( viewPreview.getHTML() );

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

        searchBtn.unbind('click', searchAlbums);

        var user = $(this).closest('div').find('input').val();

        albumBarItems.empty();
        previewBarContainer.empty();
        previewBarContainer.empty();
        albumBarContainer.find('h1.loading').remove();    
        albumBarContainer.append(textLoadingPhotos);    

        $.when( APP.modules.YandexPhotoAPI.loadAlbums( user ) ).then(function(albums){
            // setup albums container        
            albumBarContainer.find('h1.loading').remove();
            albumBarItems.width( (albums.length * 97)+20 );        
            albumBarItems.css({"margin":"20px auto"});        
     
            // create view
            var viewBarElement = new APP.modules.JStpl('templates.album-bar__items__item-templ');
            
            $.each(albums,function(index,item) {
                // create preloader animation
                var preloader = new APP.modules.animation({'speed':50,'frames':12,'imagePath':'./img/sprites.png'});
                
                // templating
                viewBarElement.setParam({'photos':item.href, 'id' : item.id, 'imageCount' : item.count,'src':'./img/clear.png','preloader': preloader.getHTML()});
                // add template to DOM
                albumBarItems.append( viewBarElement.getHTML() );
                
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
            searchBtn.bind('click', searchAlbums);

            // If ssave state

           if( localStorage.getItem(user) != null ){
                var data =  ( JSON.parse( localStorage.getItem(user) ) );
                $('span[data-id="'+data.album+'"]').parent().find('img').click();
            }


        }).fail(function(){
            searchBtn.bind('click', searchAlbums);
            albumBarContainer.find('h1.loading').text('User not found');
            containerImageCurrent.find('div.box').remove();
        });
    }

    // Toggle albums panel
    function toggleAlbumBar ( event ) {
        
        switch( $(this).text() ){
            case "Закрыть" :{
                $(this).text("Открыть");
                wrap.animate({top:"-180"},400);
                containerImageCurrent.find('img').hide();
                
                var currentHeight  = body.height() - albumBarCloseHeight;
                if( currentHeight > MAX_IMAGE_HEIGHT ) {
                    currentHeight = MAX_IMAGE_HEIGHT;
                }    
        
                var image = containerImageCurrent.find('img').css({'height': currentHeight});

                $.when($('div.box').animate({'height': image.height(),'width':image.width()})).then(function(){
                    containerImageCurrent.find('img').fadeIn(200);
                });

                break;
            }
            case "Открыть" :{
                $(this).text("Закрыть");
                $('.wrap').animate({top:"0"},300);
                containerImageCurrent.find('img').hide();
                
                currentHeight = body.height() - albumBarOpenHeight;

                if( currentHeight > MAX_IMAGE_HEIGHT ) {
                    currentHeight = MAX_IMAGE_HEIGHT;
                }    
        
                var image = containerImageCurrent.find('img').css({'height': currentHeight});
                $.when($('div.box').animate({'height': image.height(),'width':image.width()})).then(function(){
                    containerImageCurrent.find('img').fadeIn(200);
                });
            }
        }
    }

    /* Global events */

    // SCROLL ALBUMS EVENT
    APP.modules.horizontalScroll.addListener( albumBar ,function(delta){
        
        // if left limit
        if(albumPos < 0 ){
             albumPos = 0;
             return 0;
        }
         
        // calculate right limit
        var rightLimit = (albumPos - albumBarItems.width()) * -1;
        
        // if right limit
        if( rightLimit < doc.width() ){
            albumPos = (albumBarItems.width()-doc.width() );
            return 0;
        }   

        // scroll container
        albumBarItems.css({'left':-albumPos});
        // calculate albumPos
        (delta > 0) ? albumPos += albumScrollStep : albumPos -= albumScrollStep;

    });

    // SCROLL PHOTOS EVENT
    APP.modules.horizontalScroll.addListener( previewBar ,function(delta){
        
        // if left limit
        if(photoPos < 0 ){
             var added = loadPrevPhoto( maxPreloadeLeftRight );
             photoPos += previewBarImageWidth * added;

             if( added === 0){
                photoPos = 0;
                return 0;
             }
        }
 
        // calculate right limit
        var rightLimit = (previewBarContainer.width() - photoPos);
        
        // if right limit
        if( rightLimit < doc.width() ){
            photoPos = (previewBarContainer.width()-doc.width() );
            return 0;
        }   
        // if right limit
        if( rightLimit < doc.width()  + limitToLoad){
            loadNextPhoto( maxPreloadeLeftRight );
        }   

        // scroll container
        previewBarContainer.css({'left':-photoPos});
        // calculate photoPos
        (delta > 0) ? photoPos += photoStep : photoPos -= photoStep;

    });
});