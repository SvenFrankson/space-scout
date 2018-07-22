class Antenna {
    
    public static instances: Antenna[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public size: number,
        public height: number
    ) {
        
    }

    public destroy(): void {
        let index = Antenna.instances.indexOf(this);
        if (index !== -1) {
            Antenna.instances.splice(index, 1);
        }
    }
    
    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let poleMesh = new BABYLON.Mesh("blockMesh", scene);
        let positions: number[] = [];
        let indices: number[] = [];
        let colors: number[] = [];

        Pole.PushPolePart(
            positions,
            indices,
            colors,
            1,
            0.5,
            this.height * 0.5 + 0.5,
            0,
            this.height * 0.5 + 0.5,
            new BABYLON.Color3(0.2, 0.2, 0.2)
        );
        
        let data = new BABYLON.VertexData();
        data.positions = positions;
        data.indices = indices;
        data.colors = colors;
        data.normals = [];
        BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);
        data.applyToMesh(poleMesh);

        let antennaMesh = new BABYLON.Mesh("antennaMesh", scene);
        let antennaMeshData = await VertexDataLoader.instance.getColorized("antenna", "#c4c4c4", "#1ece50");
        antennaMeshData.applyToMesh(antennaMesh);
        antennaMesh.scaling.copyFromFloats(this.size, this.size, this.size);
        antennaMesh.position.y = this.height * 0.5 + 0.5;
        antennaMesh.rotation.x = Math.random() * Math.PI / 3;
        antennaMesh.rotation.y = Math.random() * Math.PI / 3;
        antennaMesh.rotation.z = Math.random() * Math.PI / 3;
        antennaMesh.computeWorldMatrix(true);

        antennaMesh = BABYLON.Mesh.MergeMeshes([poleMesh, antennaMesh], true);

        antennaMesh.layerMask = 1;
        antennaMesh.position.x = this.position.x / 2 + 0.25;
        antennaMesh.position.y = this.position.y / 2 + 0.25;
        antennaMesh.position.z = this.position.z / 2 + 0.25;
        antennaMesh.material = MinMax.cellShadingMaterial;

        return antennaMesh;
    }
} 