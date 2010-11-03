var io = require('./socket.io'),
    http = require('http'),
	url = require('url'),
	fs = require('fs');

var server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	switch (path) {
		case '/':
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<html><title>Achtung</title><h1>Achtung die Kurve!</h1></html>');
			res.end();
			break;
		
		case '/test.html':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write(data, 'utf8');
				res.end();
			});	
			break;
		default:
			send404(res);
	}
});

send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

server.listen(8080);

var io = io.listen(server),
		 buffer = [];

io.on('connection', function(client){
	client.on('message', function(obj){
		if ('respond' in obj) {
			client.send({alert: "Du sendte: " + obj.respond});
		}
	})
});
