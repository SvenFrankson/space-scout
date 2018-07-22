class Platform extends MinMax {
    
    public static instances: Platform[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public width: number,
        public direction: Direction
    ) {
        super();
        Platform.instances.push(this);
        this.min.copyFrom(position);
        this.max.copyFrom(position);
        if (this.direction === Direction.North) {
            this.min.x -= width;
            this.max.x += width;
            this.max.z += width;
        }
        if (this.direction === Direction.South) {
            this.min.x -= width;
            this.min.z -= width;
            this.max.x += width;
        }
        if (this.direction === Direction.East) {
            this.min.z -= width;
            this.max.x += width;
            this.max.z += width;
        }
        if (this.direction === Direction.West) {
            this.min.x -= width;
            this.min.z -= width;
            this.max.z += width;
        }
    }

    public destroy(): void {
        super.destroy();
        let index = Platform.instances.indexOf(this);
        if (index !== -1) {
            Platform.instances.splice(index, 1);
        }
    }
    
    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let platformMesh = new BABYLON.Mesh("blockMesh", scene);
        let data = await VertexDataLoader.instance.get("station-platform");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            let x = data.positions[i];
            let y = data.positions[i + 1];
            let z = data.positions[i + 2];
            let ll = x * x + z * z;
            if (ll > 0) {
                if (y > 0.15 || y < - 0.15) {
                    data.positions[i] *= (0.1 + this.width * 0.5) / 0.6;
                    data.positions[i + 2] *= (0.1 + this.width * 0.5) / 0.6;
                }
                else {
                    data.positions[i] *= (0.2 + this.width * 0.5) / 0.7;
                    data.positions[i + 2] *= (0.2 + this.width * 0.5) / 0.7;
                }
            }
            data.positions[i + 2] -= 0.25;
        }
        data.applyToMesh(platformMesh);

        let lightMesh = new BABYLON.Mesh("lightMesh", scene);
        let lightMeshData = await VertexDataLoader.instance.getColorized("light-s", "#c4c4c4", "#1ece50");
        lightMeshData.applyToMesh(lightMesh);
        lightMesh.position.z = (this.width - 1) * 0.5;
        lightMesh.position.y = 0.5;
        lightMesh.computeWorldMatrix(true);

        let newPlatformMesh = BABYLON.Mesh.MergeMeshes([platformMesh, lightMesh], true);

        newPlatformMesh.layerMask = 1;
        newPlatformMesh.position.x = this.position.x / 2 + 0.25;
        newPlatformMesh.position.y = this.position.y / 2 + 0.25;
        newPlatformMesh.position.z = this.position.z / 2 + 0.25;
        if (this.direction === Direction.South) {
            newPlatformMesh.rotation.y = Math.PI;
        }
        if (this.direction === Direction.East) {
            newPlatformMesh.rotation.y = Math.PI * 0.5;
        }
        if (this.direction === Direction.West) {
            newPlatformMesh.rotation.y = - Math.PI * 0.5;
        }
        newPlatformMesh.material = MinMax.cellShadingMaterial;
        

        return newPlatformMesh;
    }
} 