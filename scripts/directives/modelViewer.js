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

                    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

                    var camera, scene, renderer, dirLight, hemiLight, axes;
                    var stats;
					var cameraControls;
					var previousMesh;
                    var previousSlices = [];
					var clock = new THREE.Clock();
                    var floor = -10;

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
							 
					  if (previousMesh) scene.remove(previousMesh);
					  scene.add(mesh);
					  previousMesh = mesh;
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

                                    var vertices = new Float32Array(3*data.positions.length);
                                    for (var i=0; i<data.positions.length; i++) {
                                        var pos = data.positions[i];
                                        vertices[3*i] = pos[0];
                                        vertices[3*i+1] = pos[1];
                                        vertices[3*i+2] = pos[2];
                                    }
                                    var normals = new Float32Array(3*data.vertexNormals.length);
                                    for (var i=0; i<data.vertexNormals.length; i++) {
                                        var nor = data.vertexNormals[i];
                                        normals[3*i] = nor[0];
                                        normals[3*i+1] = nor[1];
                                        normals[3*i+2] = nor[2];
                                    }
                                    var slices = data.slices;

									geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
									geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

                                    // use this vertexColors: THREE.FaceColors,
                                    var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, shading: THREE.FlatShading } );
                                    var mesh = new THREE.Mesh( geometry, material );

                                    var s = 1.0;
                                    mesh.scale.set( s, s, s );
                                    // rotate mesh so Z is vertical
                                    mesh.rotation.x = -Math.PI/2;
                                    mesh.position.y = 0;
                                    mesh.castShadow = true;
                                    mesh.receiveShadow = true;

                                    for (var i=0; i<previousSlices.length; i++) {
                                        scene.remove(previousSlices[i]);
                                    }
                                    previousSlices = [];
                                    var sliceMaterial = new THREE.LineBasicMaterial({
                                        color: 0xff0000
                                    });

                                    for (var i=0; i<slices.length; i++) {
                                        var slice = slices[i];
                                        var curveEdges = slice.curveEdges;
                                        var curvePositions = slice.curvePositions;
                                        for (var j= 0; j<curveEdges.length; j++) {
                                            var sliceGeometry = new THREE.Geometry();
                                            var curveEdge = curveEdges[j];
                                            var index1 = curveEdge[0];
                                            var index2 = curveEdge[1];
                                            var cp1 = curvePositions[index1];
                                            var v1 = new THREE.Vector3(cp1[0], cp1[1], cp1[2])
                                            sliceGeometry.vertices.push(v1);
                                            var cp2 = curvePositions[index2];
                                            var v2 = new THREE.Vector3(cp2[0], cp2[1], cp2[2])
                                            sliceGeometry.vertices.push(v2);
                                            var sliceProfile = new THREE.Line(sliceGeometry, sliceMaterial);
                                            // rotate mesh so Z is vertical
                                            sliceProfile.rotation.x = -Math.PI/2;
                                            previousSlices.push(sliceProfile);
                                            scene.add(sliceProfile);
                                        }
                                    }

                                    if (previousMesh) {
										scene.remove(previousMesh);
									}
									scene.add(mesh);
									previousMesh = mesh;
					            }
							  }, function errorCallback(response) {
							    
							  });
						} else {
							loader1.load(modelUrl, function (assimpjson) {
								assimpjson.scale.x = assimpjson.scale.y = assimpjson.scale.z = 0.2;
								assimpjson.updateMatrix();
								if (previousMesh) scene.remove(previousMesh);
								scene.add(assimpjson);
								previousMesh = assimpjson;
							});
						}
					};

                    function buildAxes(length, floor) {
                        var axes = new THREE.Object3D();
                        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
                        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
                        //axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
                        // rotate axes so Z is vertical
                        axes.rotation.x = -Math.PI/2;
                        axes.position.y = floor;
                        return axes;
                    };

                    function buildAxis( src, dst, colorHex, dashed ) {
                        var geom = new THREE.Geometry(),
                            mat;
                        if(dashed) {
                            mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
                        } else {
                            mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
                        }
                        geom.vertices.push( src.clone() );
                        geom.vertices.push( dst.clone() );
                        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
                        var axis = new THREE.Line( geom, mat, THREE.LinePieces );
                        return axis;
                    };


					function init() {
                        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
                        camera.position.set( 100, 30, 100 );

                        scene = new THREE.Scene();
                        scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
                        scene.fog.color.setHSL( 0.6, 0, 1 );

                        hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
                        hemiLight.color.setHSL( 0.6, 1, 0.6 );
                        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                        hemiLight.position.set( 0, 100, 0 );
                        scene.add( hemiLight );

                        dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
                        dirLight.color.setHSL( 0.1, 1, 0.95 );
                        dirLight.position.set( -1, 1.75, 1 );
                        dirLight.position.multiplyScalar( 50 );
                        dirLight.castShadow = true;
                        dirLight.shadowMapWidth = 2048;
                        dirLight.shadowMapHeight = 2048;
                        var d = 50;
                        dirLight.shadowCameraLeft = -d;
                        dirLight.shadowCameraRight = d;
                        dirLight.shadowCameraTop = d;
                        dirLight.shadowCameraBottom = -d;
                        dirLight.shadowCameraFar = 3500;
                        dirLight.shadowBias = -0.0001;
                        scene.add( dirLight );

                        var groundGeo1 = new THREE.PlaneBufferGeometry( 10000, 10000 );
                        var groundMat1 = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
                        groundMat1.color.setHSL( 0.095, 1, 0.75 );
                        var ground1 = new THREE.Mesh( groundGeo1, groundMat1 );
                        // rotate ground normal to Z
                        ground1.rotation.x = -Math.PI/2;
                        ground1.position.y = floor - 1;
                        scene.add( ground1 );

                        var groundGeo2 = new THREE.PlaneBufferGeometry( 100, 100 );
                        var groundMat2 = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
                        groundMat2.color.setHSL( 130, .09, .61 );
                        var ground2 = new THREE.Mesh( groundGeo2, groundMat2 );
                        // rotate ground normal to Z
                        ground2.rotation.x = -Math.PI/2;
                        ground2.position.y = floor;
                        scene.add( ground2 );
                        ground2.receiveShadow = true;

                        axes = buildAxes(50, floor);
                        scene.add( axes );

                        var vertexShader = document.getElementById( 'vertexShader' ).textContent;
                        var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
                        var uniforms = {
                            topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
                            bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
                            offset:		 { type: "f", value: 33 },
                            exponent:	 { type: "f", value: 0.6 }
                        };
                        uniforms.topColor.value.copy( hemiLight.color );

                        scene.fog.color.copy( uniforms.bottomColor.value );

                        var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
                        var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
                        var sky = new THREE.Mesh( skyGeo, skyMat );
                        scene.add( sky );

                        renderer = new THREE.WebGLRenderer( { antialias: true } );
                        renderer.setClearColor( scene.fog.color );
                        renderer.setPixelRatio( window.devicePixelRatio );
                        renderer.setSize( window.innerWidth*0.7, window.innerHeight*0.7);
                        renderer.gammaInput = true;
                        renderer.gammaOutput = true;
                        renderer.shadowMap.enabled = true;
                        renderer.shadowMap.cullFace = THREE.CullFaceBack;

                        elem[0].appendChild(renderer.domElement);

                        stats = new Stats();
                        elem[0].appendChild( stats.domElement );

                        cameraControls = new THREE.OrbitControls(camera, renderer.domElement, elem[0]);
                        cameraControls.target.set(0, 0, 0);

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
                        stats.update();
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

                    init();
                    loadModel(scope.assimpUrl);
                    animate();
                }
			}
		}
	]);
