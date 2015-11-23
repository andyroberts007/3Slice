# 3Slice

This node app loads stl files on the server, generates a mesh and sends the vertices and normmals to the client for display in Three.js.

The app uses angular and wraps three.js as a directive.

TODO:
1)  serialize Float32Array values in binary form
2)  generate server-side slices
3)  better view manipulation and lighting
4)  enable client side loading of stl files to server with persistence
lots more...

to run:
node server.js
http://localhost:8090/

to run with debugging
npm install -g node-inspector
node-debug server.js
http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858
