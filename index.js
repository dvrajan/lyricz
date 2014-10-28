var request = require('request');
var cheerio = require("cheerio");
var _ = require("lodash");
var store = require("./store");
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var seedUrls = ['http://www.paadalvarigal.com'];

function Crawler (baseUrl){
	this.crawledUrls = [];
	this.baseUrl = baseUrl;
}

	
Crawler.prototype.filterLinks = function (body){					
		$ = cheerio.load(body);
		var links = [];
		$("body").find("a").each(function(i, element){
			links[i] = $(this).attr('href');
		});
		return links;
};

Crawler.prototype.fetch = function (url, callback){	  
		var self = this;
	  var newUrl = this.resolveUrl(url);	  
	  if(newUrl == '')
	  	return;
		request.get(newUrl, function(error, response, body){				
				callback(body);												
		});
};

Crawler.prototype.parse = function(body){
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

Crawler.prototype.resolveUrl = function(url){	
	if(url.indexOf(this.baseUrl) != -1){
		return url;
	} else if(url.indexOf("http://") != -1 || url.indexOf("https://") != -1) {
		return '';
	} else if(this.alreadyCrawled(url)){
		return '';
	}else {
		return  this.baseUrl + url;		
	}

}

Crawler.prototype.alreadyCrawled = function(url){
	return this.crawledUrls.indexOf(url) > -1;
}

Crawler.prototype.addToCrawledUrls = function(url){
	this.crawledUrls.push(url);
}


Crawler.prototype.crawl = function (urls){
	var self = this;	
	_(urls).forEach(function(url){
			self.fetch(url, function(body){			 		
			 		self.parse(body);
					self.addToCrawledUrls(url);
					var links = self.filterLinks(body);					
					emitter.emit('links_found', links);
			 });			 								
	});
			 
};	

emitter.on('links_found', function(links){	
	new Crawler(seedUrls[0]).crawl(links);
});


new Crawler(seedUrls[0]).crawl(seedUrls);
