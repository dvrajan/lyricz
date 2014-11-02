var uuid = require("node-uuid");
var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: 'lyricz.in:9200'
});
var lyricz_index = 'main';

module.exports = {
		addLyrics:	function(data){
			client.create({
				index: lyricz_index,
				type: 'lyrics',
				id: uuid.v1(),
				body: data
				},
				function(error, response){
			});
		},

    getLyricsFromUrlAndCallback: function(lyricsUrl, callback){
      client.count({
          index: lyricz_index,
          body: {
            filtered: {
                filter: {
                  terms: {
                    url:  [ '\'' + lyricsUrl +'\'']
                    }
                }
              }
            }
          }, function (err, response) {
              callback(response.count);
            });
    }

	};
