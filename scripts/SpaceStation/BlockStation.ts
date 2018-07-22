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

class Door extends MinMax {
    
    public static instances: Door[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public width: number,
        public direction: Direction
    ) {
        super();
        Door.instances.push(this);
        this.min.copyFrom(position);
        this.max.copyFrom(position);
        if (this.direction === Direction.North) {
            this.min.x -= width;
            this.max.x += width;
            this.max.z += 1;
        }
        if (this.direction === Direction.South) {
            this.min.x -= width;
            this.min.z -= 1;
            this.max.x += width;
        }
        if (this.direction === Direction.East) {
            this.min.z -= width;
            this.max.x += 1;
            this.max.z += width;
        }
        if (this.direction === Direction.West) {
            this.min.x -= 1;
            this.min.z -= width;
            this.max.z += width;
        }
        this.max.y += 4
    }

    public destroy(): void {
        super.destroy();
        let index = Door.instances.indexOf(this);
        if (index !== -1) {
            Door.instances.splice(index, 1);
        }
    }
    
    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let doorMesh = new BABYLON.Mesh("blockMesh", scene);
        let data = await VertexDataLoader.instance.get("station-door");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i + 1] < - 0.2 || data.positions[i + 1] > 1.5) {
                if (data.positions[i] > 0) {
                    data.positions[i] += (this.width - 1) * 0.5;
                }
                else if (data.positions[i] < 0) {
                    data.positions[i] -= (this.width - 1) * 0.5;
                }
            }
        }
        data.applyToMesh(doorMesh);
        doorMesh.layerMask = 1;
        doorMesh.position.x = this.position.x / 2 + 0.25;
        doorMesh.position.y = this.position.y / 2 + 0.25;
        doorMesh.position.z = this.position.z / 2 + 0.25;
        if (this.direction === Direction.South) {
            doorMesh.rotation.y = Math.PI;
        }
        if (this.direction === Direction.East) {
            doorMesh.rotation.y = Math.PI * 0.5;
        }
        if (this.direction === Direction.West) {
            doorMesh.rotation.y = - Math.PI * 0.5;
        }
        doorMesh.material = MinMax.cellShadingMaterial;

        return doorMesh;
    }
} 

class Block extends MinMax {

    public static instances: Block[] = [];
    private _nubs: Nub[] = [];
    private _platforms: Platform[] = [];
    private _doors: Door[] = [];
    private _poles: Pole[] = [];
    private _antennas: Antenna[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public width: number,
        public height: number,
        public depth: number
    ) {
        super();
        Block.instances.push(this);
        this.min.copyFrom(position);
        this.max.copyFrom(position);
        this.min.x -= width;
        this.min.y -= height;
        this.min.z -= depth;
        this.max.x += width;
        this.max.y += height;
        this.max.z += depth;

        for (let i = 0; i < 4; i++) {
            let min = Math.min(this.width, this.depth);
            let w = Math.floor(Math.random() * (min - 1) + 1);
            let h = Math.floor(Math.random() * 3 + 1);
            let d = Math.floor(Math.random() * (min - 1) + 1);
            let p = this.position.clone();
            p.y += this.height + 1;
            p.x += Math.floor((Math.random() - 0.5) * (this.width - w - 2) * 2);
            p.z += Math.floor((Math.random() - 0.5) * (this.depth - d - 2) * 2);
            let nub = new Nub(p, w, h, d);
            if (nub.intersectsAny()) {
                nub.destroy();
            }
            else {
                this._nubs.push(nub);
            }
        }

        let s = this.width * this.depth;
        let lMax = Math.max(150 - this.position.length(), 0) * 0.5;
        lMax = Math.floor(lMax) + 10;
        for (let i = 0; i < s / 80; i++) {
            let p = this.position.clone();
            p.y -= this.height + 1;
            p.x += Math.floor((Math.random() - 0.5) * (this.width - 2) * 2);
            p.z += Math.floor((Math.random() - 0.5) * (this.depth - 2) * 2);
            let l = Math.floor(10 + lMax * Math.random());
            let w = 1 + Math.floor(Math.random() * 2);
            let pole = new Pole(p, w, l, true);
            if (pole.intersectsAny()) {
                pole.destroy();
            }
            else {
                this._poles.push(pole);
            }
        }

        let p = this.position.clone();
        p.y += this.height + 1;
        p.x += Math.floor((Math.random() - 0.5) * (this.width - 2) * 2);
        p.z += Math.floor((Math.random() - 0.5) * (this.depth - 2) * 2);
        let antenna = new Antenna(p, Math.floor(0.5 + Math.random() * 4), Math.floor(0.5 + Math.random() * 6));
        this._antennas.push(antenna);

        if (Math.random() > 0.9) {
            let p = this.position.clone();
            p.y -= this.height - 1;
            p.z += this.depth + 1;
            let platform = new Platform(p, this.width - 1, Direction.North);
            if (platform.intersectsAny()) {
                platform.destroy();
            }
            else {
                this._platforms.push(platform);
                let pp = p.clone();
                pp.y += 1;
                let door = new Door(pp, 2, Direction.North);
                this._doors.push(door);
            }
        }
        if (Math.random() > 0.9) {
            let p = this.position.clone();
            p.y -= this.height - 1;
            p.z -= this.depth + 1;
            let platform = new Platform(p, this.width - 1, Direction.South);
            if (platform.intersectsAny()) {
                platform.destroy();
            }
            else {
                this._platforms.push(platform);
                let pp = p.clone();
                pp.y += 1;
                let door = new Door(pp, 2, Direction.South);
                this._doors.push(door);
            }
        }

        if (Math.random() > 0.9) {
            let p = this.position.clone();
            p.y -= this.height - 1;
            p.x += this.width + 1;
            let platform = new Platform(p, this.depth - 1, Direction.East);
            if (platform.intersectsAny()) {
                platform.destroy();
            }
            else {
                this._platforms.push(platform);
                let pp = p.clone();
                pp.y += 1;
                let door = new Door(pp, 2, Direction.East);
                this._doors.push(door);
            }
        }
        if (Math.random() > 0.9) {
            let p = this.position.clone();
            p.y -= this.height - 1;
            p.x -= this.width + 1;
            let platform = new Platform(p, this.depth - 1, Direction.West);
            if (platform.intersectsAny()) {
                platform.destroy();
            }
            else {
                this._platforms.push(platform);
                let pp = p.clone();
                pp.y += 1;
                let door = new Door(pp, 2, Direction.West);
                this._doors.push(door);
            }
        }
    }

    public slot(direction: Direction): BABYLON.Vector3 {
        let out = this.position.clone();
        if (direction === Direction.North) {
            out.z += this.depth + 1;
        }
        if (direction === Direction.South) {
            out.z -= this.depth + 1;
        }
        if (direction === Direction.East) {
            out.x += this.width + 1;
        }
        if (direction === Direction.West) {
            out.x -= this.width + 1;
        }
        out.y -= this.height;
        out.y += 1;
        let floors = Math.floor(this.height / 3);
        ScreenLoger.instance.log("Floors " + floors);
        out.y += Math.floor(floors * Math.random()) * 6;
        return out;
    }

    public destroy(): void {
        super.destroy();
        let index = Block.instances.indexOf(this);
        if (index !== -1) {
            Block.instances.splice(index, 1);
        }
        for (let i = 0; i < this._nubs.length; i++) {
            this._nubs[i].destroy();
        }
    }

    public async tryPush(
        scene: BABYLON.Scene,
        face: number[][],
        side: Direction,
        elementName: string,
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
                let newMesh: BABYLON.Mesh;
                if (side === Direction.North) {
                    newMesh = await this.pushNorth(scene, elementName, w, h, x, y);
                }
                if (side === Direction.East) {
                    newMesh = await this.pushEast(scene, elementName, w, h, x, y);
                }
                if (side === Direction.South) {
                    newMesh = await this.pushSouth(scene, elementName, w, h, x, y);
                }
                if (side === Direction.West) {
                    newMesh = await this.pushWest(scene, elementName, w, h, x, y);
                }
                if (newMesh) {
                    this._meshes.push(newMesh);
                }
            }
        }
    }

    public async pushNorth(
        scene: BABYLON.Scene,
        elementName: string,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        //ScreenLoger.instance.log("NORTH");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get(elementName);
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
        windowMesh.position.copyFromFloats(this.max.x + 1, this.min.y, this.max.z + 1).scaleInPlace(0.5);
        windowMesh.position.x -= x * 0.5;
        windowMesh.position.y += y * 0.5;
        windowMesh.rotation.y = Math.PI;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async pushEast(
        scene: BABYLON.Scene,
        elementName: string,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        //ScreenLoger.instance.log("EAST");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get(elementName);
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
        windowMesh.position.copyFromFloats(this.max.x + 1, this.min.y, this.min.z).scaleInPlace(0.5);
        windowMesh.position.y += y * 0.5;
        windowMesh.rotation.y = - Math.PI / 2;
        windowMesh.position.z += x * 0.5;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async pushSouth(
        scene: BABYLON.Scene,
        elementName: string,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        //ScreenLoger.instance.log("SOUTH");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get(elementName);
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
        windowMesh.position.copyFrom(this.min).scaleInPlace(0.5);
        windowMesh.position.x += x * 0.5;
        windowMesh.position.y += y * 0.5;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async pushWest(
        scene: BABYLON.Scene,
        elementName: string,
        w: number,
        h: number,
        x: number,
        y: number
    ): Promise<BABYLON.Mesh> {
        //ScreenLoger.instance.log("West");
        let windowMesh = new BABYLON.Mesh("windowMesh", scene);
        let data = await VertexDataLoader.instance.get(elementName);
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
        windowMesh.position.copyFromFloats(this.min.x, this.min.y, this.max.z + 1).scaleInPlace(0.5);
        windowMesh.position.y += y * 0.5;
        windowMesh.rotation.y = Math.PI / 2;
        windowMesh.position.z -= x * 0.5;
        windowMesh.layerMask = 1;
        return windowMesh;
    }

    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let blockMesh = new BABYLON.Mesh("blockMesh", scene);
        let data = await VertexDataLoader.instance.get("station-block");
        data = VertexDataLoader.clone(data);
        for (let i = 0; i < data.positions.length; i += 3) {
            if (data.positions[i] > 0) {
                data.positions[i] += (this.width - 1) * 0.5;
            }
            else {
                data.positions[i] -= (this.width - 1) * 0.5;
            }
            if (data.positions[i + 1] > 0) {
                data.positions[i + 1] += (this.height - 1) * 0.5;
            }
            else {
                data.positions[i + 1] -= (this.height - 1) * 0.5;
            }
            if (data.positions[i + 2] > 0) {
                data.positions[i + 2] += (this.depth - 1) * 0.5;
            }
            else {
                data.positions[i + 2] -= (this.depth - 1) * 0.5;
            }
        }
        data.applyToMesh(blockMesh);
        blockMesh.position.copyFrom(this.position).scaleInPlace(0.5);
        blockMesh.layerMask = 1;
        blockMesh.position.x = this.position.x / 2 + 0.25;
        blockMesh.position.y = this.position.y / 2 + 0.25;
        blockMesh.position.z = this.position.z / 2 + 0.25;
        blockMesh.material = MinMax.cellShadingMaterial;

        this._meshes.push(blockMesh);

        let northFace: number[][] = [];
        for (let i = 0; i < this.width * 2 + 1; i++) {
            northFace[i] = [];
            for (let j = 0; j < this.height * 2 + 1; j++) {
                northFace[i][j] = 0;
                let I = this.max.x + 1 - i;
                let J = this.min.y + j;
                let K = this.max.z + 1;
                if (MinMax.containsPointAny(new BABYLON.Vector3(I, J, K))) {
                    northFace[i][j] = 1;
                }
            }
        }

        let eastFace: number[][] = [];
        for (let i = 0; i < this.depth * 2 + 1; i++) {
            eastFace[i] = [];
            for (let j = 0; j < this.height * 2 + 1; j++) {
                eastFace[i][j] = 0;
                let I = this.max.x + 1;
                let J = this.min.y + j;
                let K = this.min.z + i;
                if (MinMax.containsPointAny(new BABYLON.Vector3(I, J, K))) {
                    eastFace[i][j] = 1;
                }
            }
        }

        let southFace: number[][] = [];
        for (let i = 0; i < this.width * 2 + 1; i++) {
            southFace[i] = [];
            for (let j = 0; j < this.height * 2 + 1; j++) {
                southFace[i][j] = 0;
                let I = this.min.x + i;
                let J = this.min.y + j;
                let K = this.min.z - 1;
                if (MinMax.containsPointAny(new BABYLON.Vector3(I, J, K))) {
                    southFace[i][j] = 1;
                }
            }
        }

        let westFace: number[][] = [];
        for (let i = 0; i < this.depth * 2 + 1; i++) {
            westFace[i] = [];
            for (let j = 0; j < this.height * 2 + 1; j++) {
                westFace[i][j] = 0;
                let I = this.min.x - 1;
                let J = this.min.y + j;
                let K = this.max.z + 1 - i;
                if (MinMax.containsPointAny(new BABYLON.Vector3(I, J, K))) {
                    westFace[i][j] = 1;
                }
            }
        }

        let r = Math.random();
        if (r < 0.33) {
            await this.tryPushLiving(scene, northFace, eastFace, southFace, westFace);
        }
        else if (r < 0.66) {
            await this.tryPushUtil(scene, northFace, eastFace, southFace, westFace);
        }
        else {
            await this.tryPushView(scene, northFace, eastFace, southFace, westFace);
        }

        for (let i = 0; i < this._nubs.length; i++) {
            let nub = this._nubs[i];
            let nubMesh = await nub.instantiate(scene)
            this._meshes.push(nubMesh);
        }

        for (let i = 0; i < this._platforms.length; i++) {
            let platform = this._platforms[i];
            let platformMesh = await platform.instantiate(scene)
            this._meshes.push(platformMesh);
        }

        for (let i = 0; i < this._doors.length; i++) {
            let door = this._doors[i];
            let doorMesh = await door.instantiate(scene)
            this._meshes.push(doorMesh);
        }

        for (let i = 0; i < this._poles.length; i++) {
            let pole = this._poles[i];
            let poleMesh = await pole.instantiate(scene)
            this._meshes.push(poleMesh);
        }

        for (let i = 0; i < this._antennas.length; i++) {
            let antenna = this._antennas[i];
            let antennaMesh = await antenna.instantiate(scene)
            this._meshes.push(antennaMesh);
        }

        let mergedMesh = BABYLON.Mesh.MergeMeshes(this._meshes, true);
        mergedMesh.material = MinMax.cellShadingMaterial;
        mergedMesh.layerMask = 1;
        return mergedMesh;
    }

    public async tryPushUtil(
        scene: BABYLON.Scene,
        northFace: number[][],
        eastFace: number[][],
        southFace: number[][],
        westFace: number[][]
    ): Promise<void> {
        let surface = this.width * this.height + this.width * this.depth + this.height * this.depth;
        let count = Math.ceil(surface / 30);

        for (let w = 3; w > 0; w--) {
            await this.tryPush(scene, northFace, Direction.North, "station-dark", count, w, w);
            await this.tryPush(scene, eastFace, Direction.East, "station-dark", count, w, w);
            await this.tryPush(scene, southFace, Direction.South, "station-dark", count, w, w);
            await this.tryPush(scene, westFace, Direction.West, "station-dark", count, w, w);
        }
    
        await this.tryPush(scene, northFace, Direction.North, "station-window", count, 3, 3);
        await this.tryPush(scene, eastFace, Direction.East, "station-window", count, 3, 3);
        await this.tryPush(scene, southFace, Direction.South, "station-window", count, 3, 3);
        await this.tryPush(scene, westFace, Direction.West, "station-window", count, 3, 3);
    }

    public async tryPushLiving(
        scene: BABYLON.Scene,
        northFace: number[][],
        eastFace: number[][],
        southFace: number[][],
        westFace: number[][]
    ): Promise<void> {
        let floors = Math.floor(this.height / 3);
        for (let i = 1; i < floors; i++) {
            await this.tryPush(scene, northFace, Direction.North, "station-dark", 1, this.width * 2 - 1, 1, i * 6);
            await this.tryPush(scene, eastFace, Direction.East, "station-dark", 1, this.depth * 2 - 1, 1, i * 6);
            await this.tryPush(scene, southFace, Direction.South, "station-dark", 1, this.width * 2 - 1, 1, i * 6);
            await this.tryPush(scene, westFace, Direction.West, "station-dark", 1, this.depth * 2 - 1, 1, i * 6);
        }
        for (let i = 0; i < floors; i++) {
            await this.tryPush(scene, northFace, Direction.North, "station-window", 3, 4, 5, i * 6 + 1);
            await this.tryPush(scene, eastFace, Direction.East, "station-window", 3, 4, 5, i * 6 + 1);
            await this.tryPush(scene, southFace, Direction.South, "station-window", 3, 4, 5, i * 6 + 1);
            await this.tryPush(scene, westFace, Direction.West, "station-window", 3, 4, 5, i * 6 + 1);
        }
        await this.tryPush(scene, northFace, Direction.North, "station-window", 6, 3, 3);
        await this.tryPush(scene, eastFace, Direction.East, "station-window", 6, 3, 3);
        await this.tryPush(scene, southFace, Direction.South, "station-window", 6, 3, 3);
        await this.tryPush(scene, westFace, Direction.West, "station-window", 6, 3, 3);
    }

    public async tryPushView(
        scene: BABYLON.Scene,
        northFace: number[][],
        eastFace: number[][],
        southFace: number[][],
        westFace: number[][]
    ): Promise<void> {
        let floors = Math.floor(this.height / 3);
        for (let i = 1; i < floors; i++) {
            await this.tryPush(scene, northFace, Direction.North, "station-dark", 1, this.width * 2 - 1, 1, i * 6);
            await this.tryPush(scene, eastFace, Direction.East, "station-dark", 1, this.depth * 2 - 1, 1, i * 6);
            await this.tryPush(scene, southFace, Direction.South, "station-dark", 1, this.width * 2 - 1, 1, i * 6);
            await this.tryPush(scene, westFace, Direction.West, "station-dark", 1, this.depth * 2 - 1, 1, i * 6);
        }
        for (let i = 0; i < floors; i++) {
            for (let w = 8; w > 0; w -= 2) {
                await this.tryPush(scene, northFace, Direction.North, "station-window", 3, w, 5, i * 6 + 1);
                await this.tryPush(scene, eastFace, Direction.East, "station-window", 3, w, 5, i * 6 + 1);
                await this.tryPush(scene, southFace, Direction.South, "station-window", 3, w, 5, i * 6 + 1);
                await this.tryPush(scene, westFace, Direction.West, "station-window", 3, w, 5, i * 6 + 1);
            }
        }
    }

    public tryPop(): Block[] {
        let blocks: Block[] = [];

        if (Math.random() > 0.2) {
            let northL = Math.floor(5 + 20 * Math.random());
            let northWay = new Way(this.slot(Direction.North), Direction.North, 1, 5, northL);
            if (northWay.intersectsAny()) {
                northWay.destroy();
            }
            else {
                let w = Math.floor(5 + 20 * Math.random());
                let d = Math.floor(5 + 20 * Math.random());
                let h = 3 * Math.floor(4 * Math.random() + 1);
                let pos = northWay.slot();
                pos.y += h - 1;
                pos.z += d;
                let northBlock = new Block(pos, w, h, d);
                if (northBlock.intersectsAny()) {
                    northWay.destroy();
                    northBlock.destroy();
                }
                else {
                    blocks.push(northBlock);
                }
            }
        }

        if (Math.random() > 0.2) {
            let eastL = Math.floor(5 + 20 * Math.random());
            let eastWay = new Way(this.slot(Direction.East), Direction.East, 1, 5, eastL);
            if (eastWay.intersectsAny()) {
                eastWay.destroy();
            }
            else {
                let w = Math.floor(5 + 20 * Math.random());
                let d = Math.floor(5 + 20 * Math.random());
                let h = 3 * Math.floor(4 * Math.random() + 1);
                let pos = eastWay.slot();
                pos.x += w;
                pos.y += h - 1;
                let eastBlock = new Block(pos, w, h, d);
                if (eastBlock.intersectsAny()) {
                    eastWay.destroy();
                    eastBlock.destroy();
                }
                else {
                    blocks.push(eastBlock);
                }
            }
        }

        if (Math.random() > 0.2) {
            let southL = Math.floor(5 + 20 * Math.random());
            let southWay = new Way(this.slot(Direction.South), Direction.South, 1, 5, southL);
            if (southWay.intersectsAny()) {
                southWay.destroy();
            }
            else {
                let w = Math.floor(5 + 20 * Math.random());
                let d = Math.floor(5 + 20 * Math.random());
                let h = 3 * Math.floor(4 * Math.random() + 1);
                let pos = southWay.slot();
                pos.y += h - 1;
                pos.z -= d;
                let southBlock = new Block(pos, w, h, d);
                if (southBlock.intersectsAny()) {
                    southWay.destroy();
                    southBlock.destroy();
                }
                else {
                    blocks.push(southBlock);
                }
            }
        }

        if (Math.random() > 0.2) {
            let westL = Math.floor(5 + 20 * Math.random());
            let westWay = new Way(this.slot(Direction.West), Direction.West, 1, 5, westL);
            if (westWay.intersectsAny()) {
                westWay.destroy();
            }
            else {
                let w = Math.floor(5 + 20 * Math.random());
                let d = Math.floor(5 + 20 * Math.random());
                let h = 3 * Math.floor(4 * Math.random() + 1);
                let pos = westWay.slot();
                pos.x -= w;
                pos.y += h - 1;
                let westBlock = new Block(pos, w, h, d);
                if (westBlock.intersectsAny()) {
                    westWay.destroy();
                    westBlock.destroy();
                }
                else {
                    blocks.push(westBlock);
                }
            }
        }

        return blocks;
    }
}