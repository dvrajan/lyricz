var uuid = require("node-uuid");
var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: 'lyricz.in:9200'
});

module.exports = {
		addLyrics:	function(data){
			client.create({
				index: 'main',
				type: 'lyrics',
				id: uuid.v1(),
				body: data
				},
				function(error, response){
			});
		},

    getLyricsFromUrlAndCallback: function(url, callback){
      client.search({
        q: 'url:'+url
      }).then(function (body) {
          callback(body.hits.total)
      }, function (error) {
          console.trace(error.message);
      });
    }

	};
