var SLICER = SLICER || { REVISION: '1' };

SLICER.Mesh = function() {
    Object.call(this);
    this.positions = [];
    this.vertexNormals = [];
    this.zMin;
    this.zMax;
    this.slices = [];
};

SLICER.Mesh.prototype = new Object();
SLICER.Mesh.prototype.constructor = SLICER.Mesh;

SLICER.Mesh.prototype.init = function(positions, vertexNormals) {
    this.positions = positions;
    this.vertexNormals = vertexNormals;
};

SLICER.Mesh.prototype.addSlice = function(curveEdges, curvePositions, sliceZ) {
    var slice = {"curveEdges": curveEdges, "curvePositions": curvePositions, "sliceZ": sliceZ};
    this.slices.push(slice);
};

SLICER.Mesh.prototype.setBounds = function(zMin, zMax) {
    this.zMin = zMin;
    this.zMax = zMax;
};

SLICER.Mesh.prototype.toJson = function() {
	var json = {};
    if (this.positions && this.vertexNormals) {
        json["positions"] = this.positions;
        json["vertexNormals"] = this.vertexNormals;
    }
    json["slices"] = this.slices;
    if (this.zMin) {
        json["zMin"] = this.zMin;
    }
    if (this.zMax) {
        json["zMax"] = this.zMax;
    }
    return json;
};

exports.Mesh = SLICER.Mesh;