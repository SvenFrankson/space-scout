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
                "./datas/" + name + ".babylon",
                "",
                this.scene,
                (meshes, particleSystems, skeletons) => {
                    let mesh: BABYLON.AbstractMesh = meshes[0];
                    if (mesh instanceof BABYLON.Mesh) {
                        this.lookup.set(name, mesh);
                        mesh.isVisible = false;
                        callback(mesh.createInstance(mesh.name + "-instance"));
                        if (mesh.material instanceof BABYLON.StandardMaterial) {
                            if (mesh.material.name.endsWith("metro")) {
                                console.log("Texture loading for " + mesh.material.name);
                                mesh.material.diffuseTexture = new BABYLON.Texture("./datas/metro.png", this.scene);
                                mesh.material.diffuseColor.copyFromFloats(1, 1, 1);
                                
                                mesh.material.bumpTexture = new BABYLON.Texture("./datas/metro-normal.png", this.scene);

                                mesh.material.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                            }
                        }
                        if (mesh.material && mesh.material instanceof BABYLON.MultiMaterial) {
                            mesh.material.subMaterials.forEach(
                                (m: BABYLON.Material) => {
                                    if (m instanceof BABYLON.StandardMaterial) {
                                        if (m.name.endsWith("Floor")) {
                                            console.log("Texture loading");
                                            m.diffuseTexture = new BABYLON.Texture("./datas/floor.png", this.scene);
                                            
                                            m.diffuseColor.copyFromFloats(1, 1, 1);
                                            m.bumpTexture = new BABYLON.Texture("./datas/floor-normal.png", this.scene);

                                            m.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                                        }
                                        if (m.name.endsWith("Road")) {
                                            console.log("Texture loading");
                                            m.diffuseTexture = new BABYLON.Texture("./datas/road.png", this.scene);
                                            
                                            m.diffuseColor.copyFromFloats(1, 1, 1);
                                            m.bumpTexture = new BABYLON.Texture("./datas/road-normal.png", this.scene);

                                            m.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                                        }
                                        if (m.name.endsWith("Wall")) {
                                            console.log("Texture loading");
                                            m.diffuseTexture = new BABYLON.Texture("./datas/wall.png", this.scene);
                                            
                                            m.diffuseColor.copyFromFloats(1, 1, 1);
                                            m.bumpTexture = new BABYLON.Texture("./datas/wall-normal.png", this.scene);

                                            m.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                                        }
                                    }
                                }
                            )
                        }
                    } else {
                        this.lookup.set(name, null);
                        callback(null);
                    }
                }
            )
        }
    }
}