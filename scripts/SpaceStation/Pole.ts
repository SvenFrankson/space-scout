class Pole extends MinMax {
    
    public static instances: Pole[] = [];

    private static _p0 = new BABYLON.Vector3(0.5, 0, 0);
    private static _p1 = new BABYLON.Vector3(0.25, 0, Math.sqrt(3) * 0.25);
    private static _p2 = new BABYLON.Vector3(- 0.25, 0, Math.sqrt(3) * 0.25);
    private static _p3 = new BABYLON.Vector3(- 0.5, 0, 0);
    private static _p4 = new BABYLON.Vector3(- 0.25, 0, - Math.sqrt(3) * 0.25);
    private static _p5 = new BABYLON.Vector3(0.25, 0, - Math.sqrt(3) * 0.25);

    public static PushPoleParts(
        positions: number[],
        indices: number[],
        colors: number[],
        d0: number,
        d1: number,
        length: number,
        y0: number,
        y1: number,
        color: BABYLON.Color3,
        cutsCount: number,
        cutsHeight: number
    ): void {
        let cutLength = (y1 - y0) / cutsCount;
        for (let i = 0; i < cutsCount; i++) {
            if (Math.random() < 0.5) {
                Pole.PushPolePart(
                    positions,
                    indices,
                    colors,
                    d0,
                    d1,
                    length,
                    y0 + cutLength * i + cutsHeight * 0.5,
                    y0 + cutLength * (i + 1) - cutsHeight * 0.5,
                    color
                );
            }
        }
    }

    public static PushPolePart(
        positions: number[],
        indices: number[],
        colors: number[],
        d0: number,
        d1: number,
        length: number,
        y0: number,
        y1: number,
        color: BABYLON.Color3
    ): void {
        let r0 = y0 / length;
        r0 = r0 * d1 + (1 - r0) * d0;
        r0 *= 0.5;
        let r1 = y1 / length;
        r1 = r1 * d1 + (1 - r1) * d0;
        r1 *= 0.5;
        let l = positions.length / 3;

        positions.push(0, y0, 0);
        positions.push(Pole._p0.x * r0, y0, Pole._p0.z * r0);
        positions.push(Pole._p1.x * r0, y0, Pole._p1.z * r0);
        positions.push(Pole._p2.x * r0, y0, Pole._p2.z * r0);
        positions.push(Pole._p3.x * r0, y0, Pole._p3.z * r0);
        positions.push(Pole._p4.x * r0, y0, Pole._p4.z * r0);
        positions.push(Pole._p5.x * r0, y0, Pole._p5.z * r0);

        positions.push(0, y1, 0);
        positions.push(Pole._p0.x * r1, y1, Pole._p0.z * r1);
        positions.push(Pole._p1.x * r1, y1, Pole._p1.z * r1);
        positions.push(Pole._p2.x * r1, y1, Pole._p2.z * r1);
        positions.push(Pole._p3.x * r1, y1, Pole._p3.z * r1);
        positions.push(Pole._p4.x * r1, y1, Pole._p4.z * r1);
        positions.push(Pole._p5.x * r1, y1, Pole._p5.z * r1);

        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);
        colors.push(color.r, color.g, color.b, 1);

        indices.push(1 + l, 2 + l, 8 + l);
        indices.push(8 + l, 2 + l, 9 + l);
        indices.push(2 + l, 3 + l, 9 + l);
        indices.push(9 + l, 3 + l, 10 + l);
        indices.push(3 + l, 4 + l, 10 + l);
        indices.push(10 + l, 4 + l, 11 + l);
        indices.push(4 + l, 5 + l, 11 + l);
        indices.push(11 + l, 5 + l, 12 + l);
        indices.push(5 + l, 6 + l, 12 + l);
        indices.push(12 + l, 6 + l, 13 + l);
        indices.push(6 + l, 1 + l, 13 + l);
        indices.push(13 + l, 1 + l, 8 + l);

        indices.push(0 + l, 2 + l, 1 + l);
        indices.push(0 + l, 3 + l, 2 + l);
        indices.push(0 + l, 4 + l, 3 + l);
        indices.push(0 + l, 5 + l, 4 + l);
        indices.push(0 + l, 6 + l, 5 + l);
        indices.push(0 + l, 1 + l, 6 + l);

        indices.push(7 + l, 8 + l, 9 + l);
        indices.push(7 + l, 9 + l, 10 + l);
        indices.push(7 + l, 10 + l, 11 + l);
        indices.push(7 + l, 11 + l, 12 + l);
        indices.push(7 + l, 12 + l, 13 + l);
        indices.push(7 + l, 13 + l, 8 + l);
    }

    constructor(
        public position: BABYLON.Vector3,
        public width: number,
        public length: number,
        public down: boolean = false
    ) {
        super();
        Pole.instances.push(this);
        this.min.copyFrom(position);
        this.max.copyFrom(position);
        this.min.x -= this.width;
        this.min.z -= this.width;
        this.max.x += this.width;
        this.max.z += this.width;
        if (this.down) {
            this.min.y -= this.length;
        }
        else {
            this.max.y += this.length;
        }
    }

    public destroy(): void {
        super.destroy();
        let index = Pole.instances.indexOf(this);
        if (index !== -1) {
            Pole.instances.splice(index, 1);
        }
    }
    
    public async instantiate(scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        let poleMesh = new BABYLON.Mesh("blockMesh", scene);
        let positions: number[] = [];
        let indices: number[] = [];
        let colors: number[] = [];

        Pole.PushPoleParts(
            positions,
            indices,
            colors,
            this.width + 0.5,
            0.5,
            this.length * 0.5 + 0.5,
            0,
            this.length * 0.5 + 0.5,
            new BABYLON.Color3(0.2, 0.2, 0.2),
            Math.floor(this.length * 0.5 + 0.5),
            0.2
        );

        Pole.PushPolePart(
            positions,
            indices,
            colors,
            this.width + 0.1,
            0.1,
            this.length * 0.5 + 0.5,
            0.1,
            this.length * 0.5 + 0.5 - 0.2,
            new BABYLON.Color3(1, 1, 1)
        );
        
        let data = new BABYLON.VertexData();
        data.positions = positions;
        data.indices = indices;
        data.colors = colors;
        data.normals = [];
        BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);
        data.applyToMesh(poleMesh);
        poleMesh.layerMask = 1;
        poleMesh.position.x = this.position.x / 2 + 0.25;
        poleMesh.position.y = this.position.y / 2 + 0.25;
        poleMesh.position.z = this.position.z / 2 + 0.25;
        if (this.down) {
            poleMesh.rotation.x = Math.PI;
        }
        poleMesh.material = MinMax.cellShadingMaterial;

        return poleMesh;
    }
} 