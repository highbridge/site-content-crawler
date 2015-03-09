// 
// Generic page crawler for site content audit / review
// @author Michael Roth <mr.hroth@gmail.com>
// @version 1.0.0
//

// --- globals --- //
var config = require('./config');
var UA = config.ua;
var Crawler = require("crawler");
var fs = require('fs');
var mkpath = require('mkpath');

// url queue
var nav = [config.url];

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

    
    // --- aggregator ---- //
    var data = require('./aggregators/'+config.aggregator)($, page);

    // write data to a page filen
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
    var page = res.uri.replace(config.url,'');
    // TODO remove query params?
    page = page.replace(/^http\:\/\/|^\/|\#.*|\?.*|\/$/g,'');
    page = page.replace(/\/$/,'');

    process($, page, function() {

        // queue additional links
        // on this page that we
        // haven't already queued
        $('a').each(function(i, a) {
            var url = false;
            var href = $(a).attr('href');

            // stay on this config.url
            if(a.hostname && (config.protocol + a.hostname) == config.url){
                url = href;
            } else {
                var valid = /^\/.*/;
                if(href && valid.test(href) ) {
                    url = config.url + href;
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
