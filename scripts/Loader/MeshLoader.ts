class MeshLoader {

    public static instance: MeshLoader;

    public scene: BABYLON.Scene;
    public lookup: Map<string, BABYLON.Mesh>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.lookup = new Map<string, BABYLON.Mesh>();
        MeshLoader.instance = this;
    }

    public get(name: string, callback: (mesh: BABYLON.InstancedMesh) => void): void {
        let mesh = this.lookup.get(name);
        if (mesh) {
            callback(mesh.createInstance(mesh.name + "-instance"));
        } else {
            BABYLON.SceneLoader.ImportMesh(
                "",
                "./datas/SectionLevels/" + name + ".babylon",
                "",
                this.scene,
                (meshes, particleSystems, skeletons) => {
                    let mesh: BABYLON.AbstractMesh = meshes[0];
                    if (mesh instanceof BABYLON.Mesh) {
                        this.lookup.set(name, mesh);
                        mesh.isVisible = false;
                        callback(mesh.createInstance(mesh.name + "-instance"));
                    } else {
                        this.lookup.set(name, null);
                        callback(null);
                    }
                }
            )
        }
    }
}