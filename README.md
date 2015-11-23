# 3Slice

This node app loads stl files on the server, generates a mesh and sends the vertices and normmals to the client for display in Three.js.

The app uses angular and wraps three.js as a directive.

Sample images
![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/pump.png)
![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/bunny.png)
![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/gearwheel.png)

TODO:
1.  serialize Float32Array values in binary form
2.  generate server-side slices
3.  better view manipulation and lighting
4.  enable client side loading of stl files to server with persistence
5.  lots more...

to run:
1. node server.js
2. http://localhost:8090/

to run with debugging
1. npm install -g node-inspector
2. node-debug server.js
3. http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858
