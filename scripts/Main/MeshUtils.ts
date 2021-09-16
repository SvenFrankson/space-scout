class MeshUtils {

	public static getXMinVertex(mesh: BABYLON.Mesh): BABYLON.Vector3 {
		let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
		if (positions && positions.length > 3) {
			let tip = new BABYLON.Vector3(positions[0], positions[1], positions[2]);
			for (let i = 3; i < positions.length; i += 3) {
				if (positions[i] < tip.x) {
					tip.copyFromFloats(positions[i], positions[i + 1], positions[i + 2]);
				}
			}
			return tip;
		}
		return BABYLON.Vector3.Zero();
	}

	public static getZMaxVertex(mesh: BABYLON.Mesh): BABYLON.Vector3 {
		let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
		if (positions && positions.length > 3) {
			let tip = new BABYLON.Vector3(positions[0], positions[1], positions[2]);
			for (let i = 3; i < positions.length; i += 3) {
				if (positions[i + 2] > tip.z) {
					tip.copyFromFloats(positions[i], positions[i + 1], positions[i + 2]);
				}
			}
			return tip;
		}
		return BABYLON.Vector3.Zero();
	}
}