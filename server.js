var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require("querystring"),
    stlModels = require('stl-models'),
    stlReader = require("stl-reader"),
    slicer = require("./slicer.js"),
    parseSTL = require('parse-stl'),
    computeNormals = require("normals"),
    extractContour = require('simplicial-complex-contour'),
    boundary = require('simplicial-complex-boundary'),
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
	  	if (uri.endsWith(".stl")) {
            var filename = path.join(process.cwd() + "/node_modules/stl-models/", uri);
            var buf = fs.readFileSync(filename);
            var mesh = parseSTL(buf);
            mesh.vertexNormals = computeNormals.vertexNormals(mesh.cells, mesh.positions);
            var sliceMesh = new slicer.Mesh();
            sliceMesh.init(mesh.positions, mesh.vertexNormals);

            var zMax = Number.MIN_VALUE;
            var zMin = Number.MAX_VALUE;
            var zvalues = mesh.positions.map(function(p) {
                if (p[2] > zMax) {
                    zMax = p[2];
                }
                if (p[2] < zMin) {
                    zMin = p[2];
                }
                return p[2]
            });
            sliceMesh.setBounds(zMin, zMax);
            var zRange = Math.abs(zMax - zMin);
            var sliceCount = 10;
            var sliceThickness = zRange/sliceCount;

            for (var i=0; i<sliceCount; i++) {
                var zVal = zMin + i*sliceThickness;
                var curve = extractContour(mesh.cells, zvalues, zVal);
                var curveEdges = curve.cells;
                var curvePositions = curve.vertexWeights.map(function (w, i) {
                    var a = mesh.positions[curve.vertexIds[i][0]]
                    var b = mesh.positions[curve.vertexIds[i][1]]
                    return [
                        w * a[0] + (1 - w) * b[0],
                        w * a[1] + (1 - w) * b[1],
                        w * a[2] + (1 - w) * b[2]
                    ]
                });
                sliceMesh.addSlice(curveEdges, curvePositions, zVal);
            }
            
            response.writeHead(200);
            response.write(JSON.stringify(sliceMesh.toJson()), "binary");
            response.end();
	  	} else {
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
		      		response.writeHead(200);
		      		response.write(file, "binary");
		      		response.end();
		    	});
		  	});
	  	}
		
		
	  }
}).listen(parseInt(port, 10));

console.log("3Slice server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");