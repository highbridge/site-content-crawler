// 
// Generic page crawler for site content audit / review
// @author Michael Roth <mr.hroth@gmail.com>
// @version 1.0.0
//

// --- globals --- //
// crawler
var UA = 'HighbridgeCreativeBot/1.0 (+http://highbridgecreative.com/bot.html)';
var Crawler = require("crawler");
var fs = require('fs');
var mkpath = require('mkpath');

// site data
var DOMAIN = 'http://www.brbrtfo.com';
var nav = ['http://www.brbrtfo.com/'];
var data = [];

// ----- crawler helper functions ----- //

//
// process
// - attempts to traverse a page
//   getting all data on the page
//   and saving the data to a file
//
// @param {object} $
// @param {string} page
//
var process = function($, page, callback) {
    var page = page || 'home';
    var cb = callback || function(){};

    // get page data
    var title = $('head title').text();
    var keywords = $('head meta[name=keywords]').attr('content');
    var desc = $('head meta[name=description]').attr('content');

    // build this page
    var data = {
        title : title,
        meta: {
            title : title,
            keywords : keywords,
            desc: desc
        },
        headers : [],
        text : [],
        images : []
    };

    // headers
    var hTags = $('h1,h2,h3,h4,h5,h6,header');
    $(hTags).each(function(i, h){
        var header = {
            type : h.nodeName,
            text : $(h).text().trim()
        };
        data.headers.push(header);
    });

    // content
    var cTags = $('p,section,.section');
    $(cTags).each(function(i, c){
        data.text.push($(c).text().trim());
    });

    // images
    $('img').each(function(i, image){
        data.images.push($(image).attr('src'));
    });

    // write data to a page file
    var path = page.split('/');
    var filename = path.pop() || page;
    var dir = './tmp/site';

    if(path.length){
        dir += '/' + path.join('/');
    }

    mkpath(dir, function (err) {
        if(err) {
            console.log('failed to create dir:', dir);
            return cb();
        }

        fs.writeFile(dir+'/'+filename+'.json', JSON.stringify(data, null, 4), function(err) {
            if(err) {
              console.log('failed to save file:', dir+'/'+filename+'.json');
            } else {
              console.log("saved file:", dir+'/'+filename+'.json');
            }

            return cb();
        }); 
    });
};

//
// crawl
//  - main crawler callback
//
// @param {object} err
// @param {object} res
// @param {object} $
//
var crawl = function(err, res, $) {

    console.log('Crawling: ', res.uri);

    // traverse the page
    // building the data
    var page = res.uri.replace(DOMAIN,'');
    page = page.replace(/^http\:\/\/|^\/|\#.*|\/$/g,'');
    page = page.replace(/\/$/,'');

    process($, page, function() {

        // queue additional links
        // on this page that we
        // haven't already queued
        $('a').each(function(i, a) {
            var url = false;
            var href = $(a).attr('href');

            // stay on this domain
            if(a.hostname && a.hostname == DOMAIN){
                url = href;
            } else {
                var valid = /^\/.*/;
                if(href && valid.test(href) ) {
                    url = DOMAIN + href;
                }
            }
            
            // queue
            if(url && nav.indexOf(url) == -1) {
                nav.push(url);
                c.queue(url);
            }
            
        });

    });    

};

// --- setup --- //
var c = new Crawler({
    jQuery : true,
    maxConnections: 10,
    userAgent: UA,
    callback: crawl
});

// --- start --- //
c.queue(nav[0]);
