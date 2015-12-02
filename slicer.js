var SLICER = SLICER || { REVISION: '1' };

SLICER.Mesh = function() {
    Object.call(this);
    this.positions = [];
    this.vertexNormals = [];
    this.slices = [];
};

SLICER.Mesh.prototype = new Object();
SLICER.Mesh.prototype.constructor = SLICER.Mesh;

SLICER.Mesh.prototype.init = function(positions, vertexNormals) {
    this.positions = positions;
    this.vertexNormals = vertexNormals;
};

SLICER.Mesh.prototype.addSlice = function(slice) {
    this.slices.push(slice);
};

SLICER.Mesh.prototype.toJson = function() {
	var json = {};
    if (this.positions && this.vertexNormals) {
        json["positions"] = this.positions;
        json["vertexNormals"] = this.vertexNormals;
    }
    json["slices"] = this.slices;
    return json;
};

exports.Mesh = SLICER.Mesh;