enum Direction {
    North,
    East,
    South,
    West
};

class MinMax {

	public static _cellShadingMaterial: BABYLON.CellMaterial;
	public static get cellShadingMaterial(): BABYLON.CellMaterial {
		if (!SpaceShipFactory._cellShadingMaterial) {
			SpaceShipFactory._cellShadingMaterial = new BABYLON.CellMaterial("CellMaterial", Main.Scene);
			SpaceShipFactory._cellShadingMaterial.computeHighLevel = true;
		}
		return SpaceShipFactory._cellShadingMaterial;
	}

    public static instances: MinMax[] = [];

    public min: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public max: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    protected _meshes: BABYLON.Mesh[] = [];

    constructor() {
        MinMax.instances.push(this);
    }

    public destroy(): void {
        let index = MinMax.instances.indexOf(this);
        if (index !== -1) {
            MinMax.instances.splice(index, 1);
        }
    }

    public containsPoint(point: BABYLON.Vector3): boolean {
        if (point.x >= this.min.x) {
            if (point.x <= this.max.x) {
                if (point.y >= this.min.y) {
                    if (point.y <= this.max.y) {
                        if (point.z >= this.min.z) {
                            if (point.z <= this.max.z) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    public static containsPointAny(point: BABYLON.Vector3): boolean {
        for (let i = 0; i < MinMax.instances.length; i++) {
            let minMax = MinMax.instances[i];
            if (minMax.containsPoint(point)) {
                return true;
            }
        }
        return false;
    }

    public intersects(other: MinMax): boolean {
        if (other.max.x >= this.min.x) {
            if (other.min.x <= this.max.x) {
                if (other.max.y >= this.min.y) {
                    if (other.min.y <= this.max.y) {
                        if (other.max.z >= this.min.z) {
                            if (other.min.z <= this.max.z) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    public intersectsAny(): boolean {
        for (let i = 0; i < MinMax.instances.length; i++) {
            let other = MinMax.instances[i];
            if (this !== other) {
                if (this.intersects(other)) {
                    return true;
                }
            }
        }
        return false;
    }
}

class Way extends MinMax {

    public static instances: Way[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public direction: Direction,
        public width: number,
        public height: number,
        public length: number
    ) {
        super();
        Way.instances.push(this);
        this.min.copyFrom(position);
        this.max.copyFrom(position);
        this.max.y += height - 1;
        if (this.direction === Direction.North) {
            this.min.x -= width;
            this.max.x += width;
            this.max.z += length - 1;
        }
        if (this.direction === Direction.East) {
            this.max.x += length - 1;
            this.min.z -= width;
            this.max.z += width;
        }
        if (this.direction === Direction.South) {
            this.min.x -= width;
            this.max.x += width;
            this.min.z -= length - 1;
        }
        if (this.direction === Direction.West) {
            this.min.x -= length - 1;
            this.min.z -= width;
            this.max.z += width;
        }
    }

    public destroy(): void {
        super.destroy();
        let index = Way.instances.indexOf(this);
        if (index !== -1) {
            Way.instances.splice(index, 1);
        }
    }

    public slot(): BABYLON.Vector3 {
        let slot = this.position.clone();
        if (this.direction === Direction.North) {
            slot.z += this.length;
        }
        if (this.direction === Direction.East) {
            slot.x += this.length;
        }
        if (this.direction === Direction.South) {
            slot.z -= this.length;
        }
        if (this.direction === Direction.West) {
            slot.x -= this.length;
        }
        return slot;
    }

    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        //let container = new BABYLON.Mesh("container", scene);
        let wayMesh = new BABYLON.Mesh("wayMesh", scene);
        wayMesh.position.x = this.position.x / 2 + 0.25;
        wayMesh.position.y = this.position.y / 2 + 0.25;
        wayMesh.position.z = this.position.z / 2 + 0.25;
        if (this.direction === Direction.East) {
            wayMesh.rotation.y = Math.PI / 2;
        }
        if (this.direction === Direction.South) {
            wayMesh.rotation.y = Math.PI;
        }
        if (this.direction === Direction.West) {
            wayMesh.rotation.y = - Math.PI / 2;
        }
        let data = await VertexDataLoader.instance.get("station-way");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0) {
                data.positions[i] += (this.width - 1) * 0.5;
            }
            else {
                data.positions[i] -= (this.width - 1) * 0.5;
            }
            if (data.positions[i + 1] > 1) {
                data.positions[i + 1] += (this.height - 4) * 0.5;
            }
            if (data.positions[i + 2] > 0) {
                data.positions[i + 2] += (this.length - 2) * 0.5;
            }
        }
        data.applyToMesh(wayMesh);
        wayMesh.layerMask = 1;
        wayMesh.material = MinMax.cellShadingMaterial;
        return wayMesh;
    }
}

class Nub extends MinMax {
    
    public static instances: Nub[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public width: number,
        public height: number,
        public depth: number
    ) {
        super();
        Nub.instances.push(this);
        this.min.copyFrom(position);
        this.max.copyFrom(position);
        this.min.x -= width;
        this.min.z -= depth;
        this.max.x += width;
        this.max.y += height;
        this.max.z += depth;
    }

    public destroy(): void {
        super.destroy();
        let index = Nub.instances.indexOf(this);
        if (index !== -1) {
            Nub.instances.splice(index, 1);
        }
    }
    
    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let nubMesh = new BABYLON.Mesh("blockMesh", scene);
        let meshIndex = Math.floor(Math.random() * 2 + 1);
        if (this.height > 2 || this.width < 2 || this.depth < 2) {
            meshIndex = 1;
        }
        let data = await VertexDataLoader.instance.get("station-nub-" + meshIndex.toFixed(0));
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0) {
                data.positions[i] += (this.width - 2) * 0.5;
            }
            else {
                data.positions[i] -= (this.width - 2) * 0.5;
            }
            if (data.positions[i + 1] > 0) {
                data.positions[i + 1] += (this.height - 1) * 0.5;
            }
            if (data.positions[i + 2] > 0) {
                data.positions[i + 2] += (this.depth - 2) * 0.5;
            }
            else {
                data.positions[i + 2] -= (this.depth - 2) * 0.5;
            }
        }
        data.applyToMesh(nubMesh);
        nubMesh.layerMask = 1;
        nubMesh.position.x = this.position.x / 2 + 0.25;
        nubMesh.position.y = this.position.y / 2 + 0.25;
        nubMesh.position.z = this.position.z / 2 + 0.25;
        nubMesh.material = MinMax.cellShadingMaterial;

        return nubMesh;
    }
}