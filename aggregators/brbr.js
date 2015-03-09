    
module.exports = function($, page) {

    // get page data
    var title = $('head title').text();
    var keywords = $('head meta[name=keywords]').attr('content');
    var desc = $('head meta[name=description]').attr('content');

    // build this page
    var data = {
        meta: {
            title : title,
            keywords : keywords,
            desc: desc
        }
    };

    // ---- video pages ---- //
    if($('body').hasClass('single-youtube_video_type')) {
        data.title = $('.entry-title').text().trim();
        data.video = $('iframe').attr('src');
        data.desc = $('.contentzone').text().trim();
    }

    // ----- single posts ---- //
    else if($('.single').length) {
        data.title = $('.entry-title').text();
        data.subtitle = $('.subtitle').text();
        data.author = {
            name : $('.theAuthor a').text().trim(),
            url : $('.theAuthor a').attr('href'),
            img : $('.auteur img').attr('src')
        };
        data.content = $('.entry-content').text().trim();
        data.images = [];

        $('img').each(function(){
            data.images.push($(this).attr('src'));
        });
    }

    // ----- list pages ----- //
    else if($('.element').length) {
        data.items = [];

        $('.element').each(function(){
            var item = {};
            item.title = $(this).find('.name').text().trim();
            item.desc = $(this).find('.tiny-desc').text().trim();
            item.link = $(this).find('.name a').attr('href');
            item.excerpt = $('.element .excerpt').text().trim();
            item.image = $(this).css('background-image').replace(/url\(|\)\;/g, '');
            data.items.push(item);
        });
    } 

    // general
    else {
        data.headers = [];
        data.content = [];
        data.images = [];

        // general
        var hTags = $('h1,h2,h3,h4,h5,h6,header');
        $(hTags).each(function(i, h){
            var header = {
                type: h.name,
                text : $(h).text().trim()
            };
            if(header.text.trim()) {
                data.headers.push(header);
            }      
        });

        // content
        var cTags = $('p,.entry-content,.excerpt,section');
        $(cTags).each(function(i, c){
            var text = $(c).text().trim();
            if(text) {
                data.content.push(text);
            }
        });

        // images
        $('img').each(function(i, image){
            data.images.push($(image).attr('src'));
        });
    }

    return data;
};