var request = require('request');
var cheerio = require("cheerio")

request.get("http://www.paadalvarigal.com/a-songs", function(err, res, body){
    $ = cheerio.load(body);
    var songs = $("div#main p").find('a');
    var hrefs = songs.map(function(i, elem){
       return $(this).attr('href');
    });
    console.log(hrefs.length);
    
});