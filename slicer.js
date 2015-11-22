var SLICER = SLICER || { REVISION: '1' };

SLICER.Mesh = function() {
    Object.call(this);
    this.meshData = null;
};

SLICER.Mesh.prototype = new Object();
SLICER.Mesh.prototype.constructor = SLICER.Mesh;

SLICER.Mesh.prototype.init = function(meshData) {
    this.meshData = meshData;
};

SLICER.Mesh.prototype.toJson = function() {
	var json = {};
    if (this.meshData) {
    	json["vn"] = this.meshData.vn;
    	json["vertices"] = this.meshData.vertices;
    	json["vLength"] = this.meshData.vertices.length;
    	json["normals"] = this.meshData.normals;
    	json["nLength"] = this.meshData.normals.length;
    }
    return json;
};

exports.Mesh = SLICER.Mesh;