class Door {
    
    public static instances: Door[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public width: number
    ) {
        Door.instances.push(this);
    }

    public destroy(): void {
        let index = Door.instances.indexOf(this);
        if (index !== -1) {
            Door.instances.splice(index, 1);
        }
    }
    
    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let doorMesh = new BABYLON.Mesh("blockMesh", scene);
        let doorIndex = Math.floor(2 * Math.random() + 1);
        if (this.width > 3) {
            doorIndex = 2;
        }
        let data = await VertexDataLoader.instance.get("station-door-" + doorIndex.toFixed(0));
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0.5) {
                data.positions[i] += (this.width - 2) * 0.5;
            }
            else if (data.positions[i] < - 0.5) {
                data.positions[i] -= (this.width - 2) * 0.5;
            }
        }
        data.applyToMesh(doorMesh);
        doorMesh.layerMask = 1;
        doorMesh.material = MinMax.cellShadingMaterial;

        return doorMesh;
    }

    public intersects(other: Door): boolean {
        if (this.position.x + this.width < other.position.x - other.width) {
            return false;
        }
        if (other.position.x + other.width < this.position.x - this.width) {
            return false;
        }
        return true;
    }
} 