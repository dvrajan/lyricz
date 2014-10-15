var http = require('http');

http.get("http://www.paadalvarigal.com/", function(res){
	console.log(res.data);
});