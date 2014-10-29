var request = require('request');
var cheerio = require("cheerio");
var _ = require("lodash");
var store = require("./store");
var q= require('queue');
var queue = new q();
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var seedUrls = ['http://www.paadalvarigal.com'];

var crawledUrls = [];
var baseUrl = seedUrls[0];

	
function filterLinks($){					
		var links = [];
		$("body").find("a").each(function(i, element){
			links[i] = $(this).attr('href');
		});
		return links;
};

function fetch(url, callback){	  		
	  var newUrl = resolveUrl(url);	  
	  if(newUrl == '')
	  	return 'invalid';
		request.get(newUrl, function(error, response, body){				
				callback(body);												
		});
};

function parse($, url){
	var lyrics = $("body").find("div#lyricscontent");
	if(lyrics.length > 0){
		var main = $("div#main");
		var songName = main.find("h1 span[itemprop='name']").text();
		var movieName = main.find("meta[itemprop='inAlbum']").attr('content');
		var musicBy = $("head").find("meta[property='paadalvarigal:music_by']").attr('content');
		var singers = $("head").find("meta[property='paadalvarigal:singers']").attr('content');		
		console.log(songName + '-' + movieName + '-' + url);
		 store.addLyrics({"source": baseUrl, "song": songName, "movie": movieName, "music": musicBy,"singer": singers,"lyrics": lyrics.html()});		
	}
}

function resolveUrl (url){	
	if(url.indexOf(baseUrl) != -1){
		return url;
	} else if(url.indexOf("http://") != -1 || url.indexOf("https://") != -1) {
		return '';
	} else {
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
		var err = fetch(url, function(body){
					try{
					var $ = cheerio.load(body);			 		
			 		parse($, url);
					addToCrawledUrls(url);
					var links = filterLinks($);					
					_(links).forEach(function(link){							
							queue.push(link);						
					});					
				} catch(err){
					console.log("error for "+ url);
				}					
				pushed();

		});
		if(err == 'invalid' && queue.length > 0){
			pushed();
		}
		
};	

function stripQueryParams(url){
	var parts = url.split('?');
	return parts[0];
}

function pushed(){
		var url; 
		var strippedUrl;
		do{
		   url = queue.pop()
			 strippedUrl = stripQueryParams(url); 
		}while(alreadyCrawled(strippedUrl));
		emitter.emit('pushed', url)		
}

emitter.on('pushed', function(url){
	crawl(url)
});

queue.push(seedUrls[0]);
pushed();
