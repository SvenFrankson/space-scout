class Solid2 {

	public static _cellShadingMaterial: BABYLON.CellMaterial;
	public static get cellShadingMaterial(): BABYLON.CellMaterial {
		if (!SpaceShipFactory._cellShadingMaterial) {
			SpaceShipFactory._cellShadingMaterial = new BABYLON.CellMaterial("CellMaterial", Main.Scene);
			SpaceShipFactory._cellShadingMaterial.computeHighLevel = true;
		}
		return SpaceShipFactory._cellShadingMaterial;
	}

    public position: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public size: BABYLON.Vector3 = BABYLON.Vector3.One();

    public intersects(i: number, j: number, k: number): boolean {
        if (i >= this.position.x && i < this.position.x + this.size.x) {
            if (j >= this.position.y && j < this.position.y + this.size.y) {
                if (k >= this.position.z && k < this.position.z + this.size.z) {
                    return true;
                }
            }
        }
        return false;
    }

    public static intersectsAny(i: number, j: number, k: number): boolean {
        for (let b = 0; b < Block2.Instances.length; b++) {
            if (Block2.Instances[b].intersects(i, j, k)) {
                return true;
            }
        }
        for (let w = 0; w < Way2.Instances.length; w++) {
            if (Way2.Instances[w].intersects(i, j, k)) {
                return true;
            }
        }
        return false;
    }
}

class Block2 extends Solid2 {

    public static Instances: Block2[] = [];

    constructor() {
        super();
        Block2.Instances.push(this);
    }

    public northOrigin(): BABYLON.Vector3 {
        return new BABYLON.Vector3(
            this.position.x + Math.floor(this.size.x / 2),
            this.position.y + 1,
            this.position.z + this.size.z
        );
    }

    public southOrigin(): BABYLON.Vector3 {
        return new BABYLON.Vector3(
            this.position.x + Math.floor(this.size.x / 2),
            this.position.y + 1,
            this.position.z
        );
    }

    public eastOrigin(): BABYLON.Vector3 {
        return new BABYLON.Vector3(
            this.position.x + this.size.x,
            this.position.y + 1,
            this.position.z + Math.floor(this.size.z / 2)
        );
    }

    public westOrigin(): BABYLON.Vector3 {
        return new BABYLON.Vector3(
            this.position.x,
            this.position.y + 1,
            this.position.z + Math.floor(this.size.z / 2)
        );
    }

    public async tryPush(
        scene: BABYLON.Scene,
        face: number[][],
        side: string,
        attempts: number,
        w: number,
        h: number,
        y?: number
    ): Promise<void> {
        let randomizeY = false;
        if (y === undefined) {
            randomizeY = true;
        }
        for (let n = 0; n < attempts; n++) {
            let x = Math.floor(Math.random() * (face.length - w - 1) + 1);
            if (randomizeY) {
                y = Math.floor(Math.random() * (face[0].length - h - 1) + 1);
            }
            let ok = true;
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    if (face[x + i][y + j] > 0) {
                        ok = false;
                    }
                }
            }
            if (ok) {
                for (let i = 0; i < w; i++) {
                    for (let j = 0; j < h; j++) {
                        face[x + i][y + j] = 2;
                    }
                }
                if (side === "north") {
                    await this.pushNorth(scene, w, h, x, y);
                }
                if (side === "east") {
                    await this.pushEast(scene, w, h, x, y);
                }
                if (side === "south") {
                    await this.pushSouth(scene, w, h, x, y);
                }
                if (side === "west") {
                    await this.pushWest(scene, w, h, x, y);
                }
            }
        }
    }

    public async pushNorth(
        scene: BABYLON.Scene,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        ScreenLoger.instance.log("NORTH");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get("station-window");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0.5) {
                data.positions[i] += w * 0.5 - 1;
            }
            if (data.positions[i + 1] > 0.5) {
                data.positions[i + 1] += h * 0.5 - 1;
            }
        }
        data.applyToMesh(windowMesh);
        windowMesh.position.copyFromFloats((this.position.x + this.size.x - x) * 0.5, (this.position.y + y) * 0.5, (this.position.z + this.size.z) * 0.5);
        windowMesh.rotation.y = Math.PI;
        windowMesh.material = Solid2.cellShadingMaterial;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async pushEast(
        scene: BABYLON.Scene,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        ScreenLoger.instance.log("EAST");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get("station-window");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0.5) {
                data.positions[i] += w * 0.5 - 1;
            }
            if (data.positions[i + 1] > 0.5) {
                data.positions[i + 1] += h * 0.5 - 1;
            }
        }
        data.applyToMesh(windowMesh);
        windowMesh.position.copyFromFloats((this.position.x + this.size.x) * 0.5, (this.position.y + y) * 0.5, (this.position.z + x) * 0.5);
        windowMesh.rotation.y = - Math.PI / 2;
        windowMesh.material = Solid2.cellShadingMaterial;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async pushSouth(
        scene: BABYLON.Scene,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        ScreenLoger.instance.log("SOUTH");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get("station-window");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0.5) {
                data.positions[i] += w * 0.5 - 1;
            }
            if (data.positions[i + 1] > 0.5) {
                data.positions[i + 1] += h * 0.5 - 1;
            }
        }
        data.applyToMesh(windowMesh);
        windowMesh.position.copyFromFloats((this.position.x + x) * 0.5, (this.position.y + y) * 0.5, this.position.z * 0.5);
        windowMesh.material = Solid2.cellShadingMaterial;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async pushWest(
        scene: BABYLON.Scene,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        ScreenLoger.instance.log("WEST");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get("station-window");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0.5) {
                data.positions[i] += w * 0.5 - 1;
            }
            if (data.positions[i + 1] > 0.5) {
                data.positions[i + 1] += h * 0.5 - 1;
            }
        }
        data.applyToMesh(windowMesh);
        windowMesh.position.copyFromFloats(this.position.x * 0.5, (this.position.y + y) * 0.5, (this.position.z + this.size.z - x) * 0.5);
        windowMesh.rotation.y = Math.PI / 2;
        windowMesh.material = Solid2.cellShadingMaterial;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let block2Mesh = new BABYLON.Mesh("block2Mesh", scene);
        let data = await VertexDataLoader.instance.get("station-block2");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0.5) {
                data.positions[i] += this.size.x * 0.5 - 1;
            }
            if (data.positions[i + 1] > 0.5) {
                data.positions[i + 1] += this.size.y * 0.5 - 1;
            }
            if (data.positions[i + 2] > 0.5) {
                data.positions[i + 2] += this.size.z * 0.5 - 1;
            }
        }
        data.applyToMesh(block2Mesh);
        block2Mesh.position.copyFrom(this.position).scaleInPlace(0.5);
        block2Mesh.material = Solid2.cellShadingMaterial;
        block2Mesh.layerMask = 1;

        let eastFace: number[][] = [];
        for (let i = 0; i < this.size.z; i++) {
            eastFace[i] = [];
            for (let j = 0; j < this.size.y; j++) {
                eastFace[i][j] = 0;
                let I = this.position.x + this.size.x;
                let J = this.position.y + j;
                let K = this.position.z + i;
                if (Solid2.intersectsAny(I, J, K)) {
                    eastFace[i][j] = 1;
                }
            }
        }

        let southFace: number[][] = [];
        for (let i = 0; i < this.size.x; i++) {
            southFace[i] = [];
            for (let j = 0; j < this.size.y; j++) {
                southFace[i][j] = 0;
                let I = this.position.x + i;
                let J = this.position.y + j;
                let K = this.position.z - 1;
                if (Solid2.intersectsAny(I, J, K)) {
                    southFace[i][j] = 1;
                }
            }
        }

        let westFace: number[][] = [];
        for (let i = 0; i < this.size.z; i++) {
            westFace[i] = [];
            for (let j = 0; j < this.size.y; j++) {
                westFace[i][j] = 0;
                let I = this.position.x - 1;
                let J = this.position.y + j;
                let K = this.position.z + this.size.z - i - 1;
                if (Solid2.intersectsAny(I, J, K)) {
                    westFace[i][j] = 1;
                }
            }
        }

        let northFace: number[][] = [];
        for (let i = 0; i < this.size.x; i++) {
            northFace[i] = [];
            for (let j = 0; j < this.size.y; j++) {
                northFace[i][j] = 0;
                let I = this.position.x + this.size.x - i - 1;
                let J = this.position.y + j;
                let K = this.position.z + this.size.z;
                if (Solid2.intersectsAny(I, J, K)) {
                    northFace[i][j] = 1;
                }
            }
        }

        await this.tryPush(scene, eastFace, "east", 3, 2, 4, 1);
        await this.tryPush(scene, eastFace, "east", 2, 1, 4, 1);
        await this.tryPush(scene, eastFace, "east", 10, 2, 2, 1);
        await this.tryPush(scene, eastFace, "east", 10, 2, 2, 3);
        await this.tryPush(scene, eastFace, "east", 20, 1, 1);

        await this.tryPush(scene, southFace, "south", 3, 2, 4, 1);
        await this.tryPush(scene, southFace, "south", 2, 1, 4, 1);
        await this.tryPush(scene, southFace, "south", 10, 2, 2, 1);
        await this.tryPush(scene, southFace, "south", 10, 2, 2, 3);
        await this.tryPush(scene, southFace, "south", 20, 1, 1);
        
        await this.tryPush(scene, westFace, "west", 3, 2, 4, 1);
        await this.tryPush(scene, westFace, "west", 2, 1, 4, 1);
        await this.tryPush(scene, westFace, "west", 10, 2, 2, 1);
        await this.tryPush(scene, westFace, "west", 10, 2, 2, 3);
        await this.tryPush(scene, westFace, "west", 20, 1, 1);
        
        await this.tryPush(scene, northFace, "north", 3, 2, 4, 1);
        await this.tryPush(scene, northFace, "north", 2, 1, 4, 1);
        await this.tryPush(scene, northFace, "north", 10, 2, 2, 1);
        await this.tryPush(scene, northFace, "north", 10, 2, 2, 3);
        await this.tryPush(scene, northFace, "north", 20, 1, 1);

        return block2Mesh;
    }
}

class Way2 extends Solid2 {

    public static Instances: Way2[] = [];

    constructor(public origin: BABYLON.Vector3, public direction: string, public width: number, public height: number, public length: number) {
        super();
        if (direction === "north") {
            this.position.copyFrom(origin);
            this.size.copyFromFloats(width, height, length);
        }
        if (direction === "east") {
            this.position.copyFrom(origin);
            this.position.z -= this.width;
            this.size.copyFromFloats(length, height, width);
        }
        if (direction === "west") {
            this.position.copyFrom(origin);
            this.position.x -= this.length;
            this.size.copyFromFloats(length, height, width);
        }
        if (direction === "south") {
            this.position.copyFrom(origin);
            this.position.x -= this.width;
            this.position.z -= this.length;
            this.size.copyFromFloats(width, height, length);
        }
        Way2.Instances.push(this);
    }

    public outPoint(): BABYLON.Vector3 {
        let out = this.origin.clone();
        if (this.direction === "north") {
            out.z += this.length;
        }
        if (this.direction === "east") {
            out.x += this.length;
        }
        if (this.direction === "south") {
            out.z -= this.length;
        }
        if (this.direction === "west") {
            out.x -= this.length;
        }
        return out;
    }

    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let block2Mesh = new BABYLON.Mesh("way2Mesh", scene);
        let data = await VertexDataLoader.instance.get("station-way2");
        data = VertexDataLoader.clone(data);

        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0.5) {
                data.positions[i] += this.width * 0.5 - 1;
            }
            if (data.positions[i + 1] > 1.5) {
                data.positions[i + 1] += this.height * 0.5 - 2;
            }
            if (data.positions[i + 2] > 0.5) {
                data.positions[i + 2] += this.length * 0.5 - 1;
            }
        }
        data.applyToMesh(block2Mesh);
        block2Mesh.position.copyFrom(this.origin).scaleInPlace(0.5);
        if (this.direction === "east") {
            block2Mesh.rotation.y = Math.PI / 2;
        }
        if (this.direction === "west") {
            block2Mesh.rotation.y = - Math.PI / 2;
        }
        if (this.direction === "south") {
            block2Mesh.rotation.y = Math.PI;
        }
        block2Mesh.material = Solid2.cellShadingMaterial;
        block2Mesh.layerMask = 1;

        return block2Mesh;
    }
}