var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require('querystring'),
    stlReader = require('stl-reader'),
    port = process.argv[2] || 8090;

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
};

http.createServer(function(request, response) {
	if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
            // use post['blah'], etc.
        });
    } else {
	  	var uri = url.parse(request.url).pathname;
	  	var filename = path.join(process.cwd(), uri);
		
		fs.exists(filename, function(exists) {
	    	if(!exists) {
	      		response.writeHead(404, {"Content-Type": "text/plain"});
	      		response.write("404 Not Found\n");
	      		response.end();
	      		return;
	    	}
	    	if (fs.statSync(filename).isDirectory()) filename += '/index.html';
			fs.readFile(filename, "binary", function(err, file) {
	      		if(err) {        
	        		response.writeHead(500, {"Content-Type": "text/plain"});
	        		response.write(err + "\n");
	        		response.end();
	        		return;
	      		}
	      		var responseData = file;
	      		if (filename.endsWith(".stl")) {
	      			var ab = toArrayBuffer(file);
	      			var a = 5;
					//responseData = stlReader.read(ab);
				}
	      		response.writeHead(200);
	      		response.write(responseData, "binary");
	      		response.end();
	    	});
	  	});
	  }
}).listen(parseInt(port, 10));

console.log("3Slice server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");