class MetroLine {

    public name: string;
    public index: number;
    public path: BABYLON.Vector3[] = [];

    public load(data: MetroLineData): void {
        this.name = data.name;
        this.index = data.index;
        this.path = data.path;
    }

    public evaluatePosition(t: number): BABYLON.Vector3 {
        let v: BABYLON.Vector3 = BABYLON.Vector3.Zero();
        this.evaluatePositionToRef(t, v);
        return v;
    }

    public evaluatePositionToRef(t: number, v: BABYLON.Vector3): void {
        if (t < 0) {
            t += this.path.length;
        }
        let pIndex = Math.floor(t);
        console.log(pIndex);
        let delta = t - pIndex;
        let p0 = this.path[(pIndex - 1 + this.path.length) % this.path.length];
        let p1 = this.path[pIndex % this.path.length];
        let p2 = this.path[(pIndex + 1) % this.path.length];
        let p3 = this.path[(pIndex + 2) % this.path.length];
        v.copyFrom(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, delta));
    }
    
    public evaluateDirection(t: number): BABYLON.Vector3 {
        let v: BABYLON.Vector3 = BABYLON.Vector3.Zero();
        this.evaluateDirectionToRef(t, v);
        return v;
    }

    public evaluateDirectionToRef(t: number, v: BABYLON.Vector3): void {
        this.evaluatePositionToRef(t + 0.1, v);
        v.subtractInPlace(this.evaluatePosition(t - 0.1));
        v.normalize();
    }
}