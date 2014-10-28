var request = require('request');
var cheerio = require("cheerio");
var _ = require("lodash");
var store = require("./store");
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var seedUrls = ['http://www.paadalvarigal.com'];



crawledUrls = [];
baseUrl = seedUrls[0];

	
function filterLinks(body){					
		$ = cheerio.load(body);
		var links = [];
		$("body").find("a").each(function(i, element){
			links[i] = $(this).attr('href');
		});
		return links;
};

function fetch(url, callback){	  		
	  var newUrl = resolveUrl(url);	  
	  if(newUrl == '')
	  	return;
		request.get(newUrl, function(error, response, body){				
				callback(body);												
		});
};

function parse(body){
	$ = cheerio.load(body);
	var lyrics = $("body").find("div#lyricscontent");
	if(lyrics.length > 0){
		var main = $("div#main");
		var songName = main.find("h1 span[itemprop='name']").text();
		var movieName = main.find("meta[itemprop='inAlbum']").attr('content');
		var musicBy = $("head").find("meta[property='paadalvarigal:music_by']").attr('content');
		var singers = $("head").find("meta[property='paadalvarigal:singers']").attr('content');		
		console.log(songName + '-' + movieName);
		// store.addLyrics({"source": this.baseUrl, "song": songName, "movie": movieName, "music": musicBy,"singer": singers,"lyrics": lyrics.html()});		
	}
}

function resolveUrl (url){	
	if(url.indexOf(baseUrl) != -1){
		return url;
	} else if(url.indexOf("http://") != -1 || url.indexOf("https://") != -1) {
		return '';
	} else if(alreadyCrawled(url)){
		return '';
	}else {
		return  baseUrl + url;		
	}

}

function alreadyCrawled(url){
	return crawledUrls.indexOf(url) > -1;
}

function addToCrawledUrls(url){
	crawledUrls.push(url);
}


function crawl (url){	
		fetch(url, function(body){			 		
			 		parse(body);
					addToCrawledUrls(url);
					var links = filterLinks(body);					
					_(links).forEach(function(link){
							emitter.emit('link_found', link);
					});
		});
			
};	

emitter.on('link_found', function(link){			
	crawl(link);		
});



crawl(seedUrls[0]);

