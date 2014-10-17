var request = require('request');
var cheerio = require("cheerio");
var _ = require("lodash");

var seedUrls = ['http://www.paadalvarigal.com/'];

function crawler (){
	this.filterLinks	= function (body){					
				$ = cheerio.load(body);
				var links = $("body").find("a").map(function(i, element){
					return $(this).attr('href');
				});
				console.log(links.length);				
				this.crawl(links);
		}

		this.fetch = function (url, callback){
				request.get(url, function(error, response, body){
						callback(body);
				});
		}

		this.crawl = function (urls){
			var self = this;
			_.forEach(urls, function(url){
					 self.fetch(url, self.filterLinks);							
			});
		}	
}


new crawler().crawl(seedUrls);