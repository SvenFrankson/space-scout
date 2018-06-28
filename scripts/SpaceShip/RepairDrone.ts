class RepairDrone extends BABYLON.TransformNode {

    public static easeOutElastic(t) {
        var p = 0.3;
        return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
    }
    
    public bodyTop: BABYLON.Mesh;
    public bodyBottom: BABYLON.Mesh;
    public wingL: BABYLON.Mesh;
    public wingR: BABYLON.Mesh;
    public antenna: BABYLON.Mesh;
    public armL: BABYLON.Mesh;
    public armR: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene) {
        super("Repair-Drone", scene);
    }

    public async initialize(): Promise<void> {
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
                                mesh.parent = this;
                            }
                        }
                        this.armL.parent = this.bodyBottom;
                        this.armR.parent = this.bodyBottom;
                        
                        this.bodyBottom.position.copyFrom(RepairDrone.BodyBottomFoldPosition);
                        this.antenna.scaling.copyFrom(RepairDrone.AntennaFoldScaling);
                        this.armR.scaling.copyFrom(RepairDrone.ArmLFoldScaling);
                        this.armL.scaling.copyFrom(RepairDrone.ArmRFoldScaling);
                        this.wingL.rotation.copyFrom(RepairDrone.WingLFoldRotation);
                        this.wingR.rotation.copyFrom(RepairDrone.WingFoldRotation);

                        this.unFold();

                        resolve();
                    }
                )
            }
        )
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