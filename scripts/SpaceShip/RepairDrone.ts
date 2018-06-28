class RepairDrone extends BABYLON.TransformNode {

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
                        this.fold();
                        setTimeout(
                            () => {
                                this.unFold();
                            },
                            3000
                        )
                        resolve();
                    }
                )
            }
        )
    }

    public fold(): void {
        this.bodyBottom.position.copyFromFloats(0, 0.095, 0);
        this.antenna.scaling.copyFromFloats(0, 0, 0);
        this.armR.scaling.copyFromFloats(0, 0, 0);
        this.armL.scaling.copyFromFloats(0, 0, 0);
        this.wingL.rotation.copyFromFloats(0, - 1.22, 0);
        this.wingR.rotation.copyFromFloats(0, 1.22, 0);
    }

    public unFold(): void {
        this.bodyBottom.position.copyFromFloats(0, 0, 0);
        this.antenna.scaling.copyFromFloats(1, 1, 1);
        this.armR.scaling.copyFromFloats(1, 1, 1);
        this.armL.scaling.copyFromFloats(1, 1, 1);
        this.wingL.rotation.copyFromFloats(0, 0, 0);
        this.wingR.rotation.copyFromFloats(0, 0, 0);
    }
}