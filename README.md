# 3Slice

This node app loads stl files on the server, generates a mesh and sends the vertices and normals to the client for display in Three.js.

The app uses angular and wraps three.js as a directive.

![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/slice1.png)
![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/slice2.png)
![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/slice3.png)
![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/slice4.png)
![alt tag](https://raw.githubusercontent.com/andyroberts007/3Slice/basic-functionality/images/slice5.png)

to run:
1. node server.js
2. http://localhost:8090/

to run with debugging
1. npm install -g node-inspector
2. node-debug server.js
3. http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858
