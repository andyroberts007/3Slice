angular.module("modelViewer", [])
	.directive(
		"modelViewer",
		["$http", function ($http) {
			return {
				restrict: "E",
				scope: {
					assimpUrl: "=assimpUrl"
				},
				link: function (scope, elem, attr) {
				
					var camera;
					var cameraControls;
					var scene;
					var renderer;
					var previous;
					var clock = new THREE.Clock();

					// init scene
					init();

					// not used currently given the loadable models
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
					
					// this is for reading local files and parsing stl on client - not currently used
					var reader = new FileReader();
					reader.onload = function () {
					  var stlReader, data;
					 
					  data = reader.result;
					  stlReader = new StlReader();
					  var res = stlReader.read(data);
					 
					  var geometry = new THREE.BufferGeometry();
					  geometry.addAttribute('position', new THREE.BufferAttribute(res.vertices, 3));
					  geometry.addAttribute('normal', new THREE.BufferAttribute(res.normals, 3));
					  var material = new THREE.MeshBasicMaterial({ color: 0xeeeedd, shading: THREE.FlatShading });
									
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
									var data = response.data;
									var geometry = new THREE.BufferGeometry();
									
									var vertices = new Float32Array(data.vLength);
									for (var i=0; i<data.vLength; i++) {
										vertices[i] = data.vertices[i];
									}
									var normals = new Float32Array(data.nLength);
									for (var i=0; i<data.nLength; i++) {
										normals[i] = data.normals[i];
									}
									geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
									geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
									var material1 = new THREE.MeshBasicMaterial({ color: 0xeeeedd, side: THREE.DoubleSide, shading: THREE.FlatShading, wireframe: false });
        							var material2 = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) ;
        
        							var mesh = new THREE.Mesh(geometry, material2);
											 
									if (previous) {
										scene.remove(previous);
									}
									scene.add(mesh);
									previous = mesh;
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
						camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
						camera.position.set(20, 20, 20);
						
						scene = new THREE.Scene();
						scene.fog = new THREE.FogExp2(0x000000, 0.035);
				
						var directionalLight1 = new THREE.DirectionalLight(0xeeee55);
						directionalLight1.position.set( 0, 0.35, 0.5 ).normalize();
						scene.add(directionalLight1);
						var directionalLight2 = new THREE.DirectionalLight(0x55eeee);
						directionalLight2.position.set( 0, -0.35, -0.5 ).normalize();
						scene.add(directionalLight2);
						var ambientLight = new THREE.AmbientLight( 0x444444 );
    					scene.add( ambientLight );

						// Renderer
						renderer = new THREE.WebGLRenderer();
						renderer.setSize(window.innerWidth*0.7, window.innerHeight*0.7);
						elem[0].appendChild(renderer.domElement);
						
						cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
        				cameraControls.target.set(0, 0, 0);

						// Events
						window.addEventListener('resize', onWindowResize, false);
					}

					function onWindowResize(event) {
						renderer.setSize(window.innerWidth*0.7, window.innerHeight*0.7);
						camera.aspect = window.innerWidth / window.innerHeight;
						camera.updateProjectionMatrix();
					}

					function animate() {
						requestAnimationFrame(animate);
						var delta = clock.getDelta();
        				cameraControls.update(delta);
						render();
					}

					//
					function render() {
						var timer = Date.now() * 0.0002;
						//camera.position.x = Math.cos(timer) * 30;
						//camera.position.y = 20;
						//camera.position.z = Math.sin(timer) * 30;
						//camera.lookAt(scene.position);
						renderer.render(scene, camera);
					}
				}
			}
		}
	]);
