'use strict';

angular.module('3SliceApp')
	.controller('MainCtrl', function ($scope) {
		$scope.assimpModelUrl = "objects/gearwheel.ascii.stl";

		$scope.changeModel = function() {
			if ($scope.assimpModelUrl == "objects/gearwheel.ascii.stl") {
				$scope.assimpModelUrl = "objects/pump.stl";
			} else if ($scope.assimpModelUrl == "objects/pump.stl") {
				$scope.assimpModelUrl = "objects/teapot.stl";
			} else if ($scope.assimpModelUrl == "objects/teapot.stl") {
				$scope.assimpModelUrl = "polytopes/cube.ascii.stl";
			} else if ($scope.assimpModelUrl == "objects/bunny.bin.stl") {
				$scope.assimpModelUrl = "polytopes/cube.ascii.stl";
			} else {
				$scope.assimpModelUrl = "objects/gearwheel.ascii.stl";
			}
		};
	});
