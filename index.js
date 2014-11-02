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
var queueCleanLimit=5000;

function filterLinks($){
		var urls = [];
		var links = $("body").find("a");
		var filteredLinks  = _.filter(links, function(link){
			var resolvedUrl = resolveUrl($(link).attr('href'));
			return resolvedUrl == '' ? false : true;
		});
		$(filteredLinks).each(function(i, element){
			var url = $(this).attr('href');
			var strippedUrl = stripQueryParams(url);
			if(!alreadyCrawled(strippedUrl)){
				urls[i] = strippedUrl;
			}
		});
		return urls;
};

function fetch(url, callback){
		request.get(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				callback(body);
			} else {
				callback(null);
			}
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
		if(!alreadyCrawled(url)){
		 store.addLyrics({"source": baseUrl, "url": url, "song": songName, "movie": movieName, "music": musicBy,"singer": singers,"lyrics": lyrics.html()});
	  }
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
   fetch(url, function(body){
		if(body != null){
			var $ = cheerio.load(body);
	 		parse($, url);
			var links = filterLinks($);
			_(links).forEach(function(link){
					queue.push(link);
			});
	 	}
		crawlNextUrl();
		});

};

function stripQueryParams(url){
	var parts = url.split('?');
	return parts[0];
}

function crawlNextUrl(){
		var url = queue.pop();
		addToCrawledUrls(url);
		console.log("Queue length:" + queue.length + ":" + crawledUrls.length);
		emitter.emit('pushed', url)
}

function clean(){
 	_().forEach()
}

emitter.on('pushed', function(url){
	if(queue.length >= queueCleanLimit){
		clean();
	}
	crawl(url)
});

queue.push(seedUrls[0]);
crawlNextUrl();
