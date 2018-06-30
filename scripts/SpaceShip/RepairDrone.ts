class RepairDrone extends BABYLON.TransformNode {

    public static easeOutElastic(t) {
        let p = 0.3;
        return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
    }
    
    public basePosition: BABYLON.Vector3 = new BABYLON.Vector3(-1.5, 1.5, -1.5);

    public container: BABYLON.TransformNode;
    public bodyTop: BABYLON.Mesh;
    public bodyBottom: BABYLON.Mesh;
    public wingL: BABYLON.Mesh;
    public wingR: BABYLON.Mesh;
    public antenna: BABYLON.Mesh;
    public armL: BABYLON.Mesh;
    public armR: BABYLON.Mesh;

    private _speed: number = 0;

    constructor(public spaceship: BABYLON.Mesh, scene: BABYLON.Scene) {
        super("Repair-Drone", scene);
    }

    public async initialize(): Promise<void> {
        this.container = new BABYLON.TransformNode("container", this.getScene());
        this.container.parent = this;
        return new Promise<void>(
            (resolve) => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/models/repair-drone.babylon",
                    "",
                    this.getScene(),
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                if (mesh.name === "antenna") {
                                    this.antenna = mesh;
                                }
                                else if (mesh.name === "body-top") {
                                    this.bodyTop = mesh;
                                }
                                else if (mesh.name === "body-bottom") {
                                    this.bodyBottom = mesh;
                                }
                                else if (mesh.name === "arm-L") {
                                    this.armL = mesh;
                                }
                                else if (mesh.name === "arm-R") {
                                    this.armR = mesh;
                                }
                                else if (mesh.name === "wing-L") {
                                    this.wingL = mesh;
                                }
                                else if (mesh.name === "wing-R") {
                                    this.wingR = mesh;
                                }
                                ScreenLoger.instance.log(mesh.name);
                                mesh.parent = this.container;
                            }
                        }
                        this.armL.parent = this.bodyBottom;
                        this.armR.parent = this.bodyBottom;
                        
                        this.bodyBottom.position.copyFrom(RepairDrone.BodyBottomFoldPosition);
                        this.antenna.scaling.copyFrom(RepairDrone.AntennaFoldScaling);
                        this.armR.scaling.copyFrom(RepairDrone.ArmLFoldScaling);
                        this.armL.scaling.copyFrom(RepairDrone.ArmRFoldScaling);
                        this.wingL.rotation.copyFrom(RepairDrone.WingLFoldRotation);
                        this.wingR.rotation.copyFrom(RepairDrone.WingRFoldRotation);

                        this.parent = this.spaceship;
                        this.position.copyFrom(this.basePosition);
                        this.getScene().onBeforeRenderObservable.add(this._update);
                        this.repairCycle();

                        resolve();
                    }
                )
            }
        )
    }

    private async repairCycle() {
        while (!this.isDisposed()) {
            ScreenLoger.instance.log("New Cycle.");
            let A = this.position.clone();
            let B = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            B.normalize().scaleInPlace(10);
            let ray = new BABYLON.Ray(B, B.scale(-1).normalize());
            ray = BABYLON.Ray.Transform(ray, this.spaceship.getWorldMatrix());
            let hit = ray.intersectsMesh(this.spaceship)
            if (hit.hit) {
                let p = hit.pickedPoint;
                B = BABYLON.Vector3.TransformCoordinates(
                    p,
                    this.spaceship.getWorldMatrix().clone().invert()
                );
                B = B.addInPlace(BABYLON.Vector3.Normalize(B));
            }
            await RuntimeUtils.RunCoroutine(this._repairStep(A, B));
        }
    }

    private * _repairStep(A: BABYLON.Vector3, B: BABYLON.Vector3): IterableIterator<any> {
        ScreenLoger.instance.log("New Step.");
        // Build a path for the step.
        let n = BABYLON.Vector3.Cross(A, B).normalize();
        let alpha = Math.acos(BABYLON.Vector3.Dot(A.clone().normalize(), B.clone().normalize()));
        let length = Math.ceil(alpha / (Math.PI / 32));
        let step = alpha / length;
        let dA = A.length();
        let dB = B.length();

        this._targetPositions = [A];
        for (let i = 1; i < length; i++) {
            let matrix = BABYLON.Matrix.RotationAxis(n, step * i);
            let p = BABYLON.Vector3.TransformCoordinates(A, matrix);
            let mult = 1.5 - 0.5 * (1 - i / (length / 2)) * (1 - i / (length / 2));
            let r = i / length;
            p.normalize();
            p.scaleInPlace(dA * mult * (1 - r) + dB * mult * r);
            this._targetPositions.push(p);
        }
        this._targetPositions.push(B);
        
        let path = BABYLON.MeshBuilder.CreateLines(
            "path",
            {
                points: this._targetPositions,
            },
            this.getScene()
        );
        path.parent = this.spaceship;

        let l = this._targetPositions.length;
        this.fold();
        while (this._targetPositions.length > 1) {
            let targetPosition = this._targetPositions[0];
            let d = BABYLON.Vector3.Distance(targetPosition, this.position);
            let ll = this._targetPositions.length;
            this._speed = 1.5 - 0.5 * (1 - ll / (l / 2)) * (1 - ll / (l / 2));
            if (d < 0.5) {
                ScreenLoger.instance.log("Repair Drone reached point in path, " + this._targetPositions.length + " points left.");
                this._targetPositions.splice(0, 1);
            }
            yield;
        }

        let timer = 0;
        this.unFold();
        while (timer < 5) {
            timer += this.getScene().getEngine().getDeltaTime() / 1000;
            yield;
        }
        ScreenLoger.instance.log("Step Done.");
    }

    private _targetPositions: BABYLON.Vector3[] = [];

    private _kIdle: number = 0;
    private _m: BABYLON.Mesh;
    private _isBased: boolean = false;
    private _update = () => {
        if (this._isBased) {
           this.position.copyFrom(this.basePosition);
        }
        else {
            this.container.position.x = 0.25 * Math.sin(this._kIdle / 200 * Math.PI * 2);
            this.container.position.y = 0.25 * Math.sin(this._kIdle / 100 * Math.PI * 2);
            this.container.position.z = 0.25 * Math.sin(this._kIdle / 400 * Math.PI * 2);
            this._kIdle++;
            let deltaTime = this.getScene().getEngine().getDeltaTime() / 1000;
            let targetPosition = this._targetPositions[0];
            if (targetPosition) {
                /*
                if (!this._m) {
                    this._m = BABYLON.MeshBuilder.CreateBox("m", {size: 0.3}, Main.Scene);
                    this._m.parent = this.spaceship;
                }
                this._m.position.copyFrom(targetPosition);
                */
                let dir = targetPosition.subtract(this.position);
                let dist = dir.length();
                dir.scaleInPlace(1 / dist);
                console.log(this.position);
                if (dist > 0) {
                    this.position.addInPlace(dir.scale(Math.min(dist, this._speed * deltaTime)));
                }
                this.lookAt(BABYLON.Vector3.Zero(), 0, Math.PI, Math.PI, BABYLON.Space.LOCAL);
            }
        }
    }

    public fold(): void {
        this._kFold = 0;
        this.getScene().onBeforeRenderObservable.add(this._fold);
    }

    private static BodyBottomFoldPosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0.095, 0);
    private static AntennaFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static ArmLFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static ArmRFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static WingLFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, - 1.22, 0);
    private static WingRFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, 1.22, 0);
    private _kFold: number = 0;
    private _fold = () => {
        this._kFold++;
        let ratio = this._kFold / 60;
        BABYLON.Vector3.LerpToRef(RepairDrone.BodyBottomUnFoldPosition, RepairDrone.BodyBottomFoldPosition, ratio, this.bodyBottom.position);
        BABYLON.Vector3.LerpToRef(RepairDrone.AntennaUnFoldScaling, RepairDrone.AntennaFoldScaling, ratio, this.antenna.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmLUnFoldScaling, RepairDrone.ArmLFoldScaling, ratio, this.armL.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmRUnFoldScaling, RepairDrone.ArmRFoldScaling, ratio, this.armR.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingLUnFoldRotation, RepairDrone.WingLFoldRotation, ratio, this.wingL.rotation);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingRUnFoldRotation, RepairDrone.WingRFoldRotation, ratio, this.wingR.rotation);
        if (this._kFold > 60) {
            this.bodyBottom.position.copyFrom(RepairDrone.BodyBottomFoldPosition);
            this.antenna.scaling.copyFrom(RepairDrone.AntennaFoldScaling);
            this.armR.scaling.copyFrom(RepairDrone.ArmLFoldScaling);
            this.armL.scaling.copyFrom(RepairDrone.ArmRFoldScaling);
            this.wingL.rotation.copyFrom(RepairDrone.WingLFoldRotation);
            this.wingR.rotation.copyFrom(RepairDrone.WingRFoldRotation);
            this.getScene().onBeforeRenderObservable.removeCallback(this._fold);
        }
    }

    public unFold(): void {
        this._kUnFold = 0;
        this.getScene().onBeforeRenderObservable.add(this._unFold);
    }

    private static BodyBottomUnFoldPosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static AntennaUnFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);
    private static ArmLUnFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);
    private static ArmRUnFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);
    private static WingLUnFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static WingRUnFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private _kUnFold: number = 0;
    private _unFold = () => {
        this._kUnFold++;
        let ratio = RepairDrone.easeOutElastic(this._kUnFold / 60);
        BABYLON.Vector3.LerpToRef(RepairDrone.BodyBottomFoldPosition, RepairDrone.BodyBottomUnFoldPosition, ratio, this.bodyBottom.position);
        BABYLON.Vector3.LerpToRef(RepairDrone.AntennaFoldScaling, RepairDrone.AntennaUnFoldScaling, ratio, this.antenna.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmLFoldScaling, RepairDrone.ArmLUnFoldScaling, ratio, this.armL.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmRFoldScaling, RepairDrone.ArmRUnFoldScaling, ratio, this.armR.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingLFoldRotation, RepairDrone.WingLUnFoldRotation, ratio, this.wingL.rotation);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingRFoldRotation, RepairDrone.WingRUnFoldRotation, ratio, this.wingR.rotation);
        if (this._kUnFold > 60) {
            this.bodyBottom.position.copyFrom(RepairDrone.BodyBottomUnFoldPosition);
            this.antenna.scaling.copyFrom(RepairDrone.AntennaUnFoldScaling);
            this.armR.scaling.copyFrom(RepairDrone.ArmLUnFoldScaling);
            this.armL.scaling.copyFrom(RepairDrone.ArmRUnFoldScaling);
            this.wingL.rotation.copyFrom(RepairDrone.WingLUnFoldRotation);
            this.wingR.rotation.copyFrom(RepairDrone.WingRUnFoldRotation);
            this.getScene().onBeforeRenderObservable.removeCallback(this._unFold);
        }
    }
}