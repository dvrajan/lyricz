var uuid = require("node-uuid");
var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: 'localhost:9200'
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
		}
	};
