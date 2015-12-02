'use strict';

angular.module('3SliceApp')
	.controller('MainCtrl', function ($scope) {
		var models = [];
        models.push("objects/pumphousing.stl");
        models.push("objects/gearwheel.ascii.stl");
        models.push("objects/curvedhousing.stl");
        models.push("objects/reducercasing.stl");
        models.push("polytopes/cube.ascii.stl");
        //models.push("objects/pump.stl");

        $scope.assimpModelUrl = models[0];

        var modelCounter = 0;
		$scope.changeModel = function() {
            modelCounter += 1;
            if (modelCounter == models.length) {
                modelCounter = 0;
            }
            $scope.assimpModelUrl = models[modelCounter];
		};
	});
