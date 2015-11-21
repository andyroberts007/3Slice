'use strict';

angular.module('angularjsThreejsApp')
	.controller('MainCtrl', function ($scope) {
		$scope.assimpModelUrl = "models/jeep1.ms3d.json";

		$scope.changeModel = function() {
			if ($scope.assimpModelUrl == "models/interior.3ds.json") {
				$scope.assimpModelUrl = "models/jeep1.ms3d.json";
			} else if ($scope.assimpModelUrl == "models/jeep1.ms3d.json") {
				$scope.assimpModelUrl = "node_modules/stl-models/objects/gearwheel.ascii.stl";
			} else {
				$scope.assimpModelUrl = "models/interior.3ds.json";
			}
		};
	});
