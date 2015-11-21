angular.module("tjsModelViewer", [])
	.directive(
		"tjsModelViewer",
		["$http", function ($http) {
			return {
				restrict: "E",
				scope: {
					assimpUrl: "=assimpUrl"
				},
				link: function (scope, elem, attr) {
					var camera;
					var scene;
					var renderer;
					var previous;

					// init scene
					init();

					// Load jeep model using the AssimpJSONLoader
					var loader1 = new THREE.AssimpJSONLoader();

					scope.$watch("assimpUrl", function(newValue, oldValue) {
						if (newValue != oldValue) loadModel(newValue);
					});
					
					function toArrayBuffer(buffer) {
					  var ab = new ArrayBuffer(buffer.length);
					  var view = new Uint8Array(ab);
					  for (var i = 0; i < buffer.length; ++i) {
					    view[i] = buffer[i];
					  }
					  return ab;
					};
					
					// this is for reading local files
					var reader = new FileReader();
					reader.onload = function () {
					  var stlReader, data;
					 
					  data = reader.result;
					  stlReader = new StlReader();
					  var res = stlReader.read(data);
					 
					  var geometry = new THREE.BufferGeometry();
					  geometry.addAttribute('position', new THREE.BufferAttribute(res.vertices, 3));
					  geometry.addAttribute('normal', new THREE.BufferAttribute(res.normals, 3));
					  var material3 = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) ;
		        
					  var mesh = new THREE.Mesh(geometry, material);
							 
					  if (previous) scene.remove(previous);
					  scene.add(mesh);
					  previous = mesh;
					};
 
					function loadModel(modelUrl) {
						if (modelUrl && modelUrl.endsWith(".stl")) {
							$http({
							  method: 'GET',
							  url: modelUrl
							}).then(function successCallback(response) {
								if (response) {
									var stlReader = new StlReader();
					                var res = stlReader.read(toArrayBuffer(response.data));
				 
									var geometry = new THREE.BufferGeometry();
									//geometry.addAttribute('position', new THREE.BufferAttribute(res.vertices, 3));
									//geometry.addAttribute('normal', new THREE.BufferAttribute(res.normals, 3));
									//var material = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) ;
						        
									//var mesh = new THREE.Mesh(geometry, material);
											 
									//if (previous) {
									//	scene.remove(previous);
									//}
									//scene.add(mesh);
									//previous = mesh;
					            }
							  }, function errorCallback(response) {
							    
							  });
						} else {
							loader1.load(modelUrl, function (assimpjson) {
								assimpjson.scale.x = assimpjson.scale.y = assimpjson.scale.z = 0.2;
								assimpjson.updateMatrix();
								if (previous) scene.remove(previous);
								scene.add(assimpjson);
	
								previous = assimpjson;
							});
						}
					}

					loadModel(scope.assimpUrl);
					animate();

					function init() {
						camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
						camera.position.set(2, 4, 5);
						scene = new THREE.Scene();
						scene.fog = new THREE.FogExp2(0x000000, 0.035);
						// Lights
						scene.add(new THREE.AmbientLight(0xcccccc));
						var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee);
						directionalLight.position.x = Math.random() - 0.5;
						directionalLight.position.y = Math.random() - 0.5;
						directionalLight.position.z = Math.random() - 0.5;
						directionalLight.position.normalize();
						scene.add(directionalLight);

						// Renderer
						renderer = new THREE.WebGLRenderer();
						renderer.setSize(window.innerWidth/2, window.innerHeight/2);
						elem[0].appendChild(renderer.domElement);

						// Events
						window.addEventListener('resize', onWindowResize, false);
					}

					//
					function onWindowResize(event) {
						renderer.setSize(window.innerWidth/2, window.innerHeight/2);
						camera.aspect = window.innerWidth / window.innerHeight;
						camera.updateProjectionMatrix();
					}

					//
					var t = 0;

					function animate() {
						requestAnimationFrame(animate);
						render();
					}

					//
					function render() {
						var timer = Date.now() * 0.0005;
						camera.position.x = Math.cos(timer) * 10;
						camera.position.y = 4;
						camera.position.z = Math.sin(timer) * 10;
						camera.lookAt(scene.position);
						renderer.render(scene, camera);
					}
				}
			}
		}
	]);
