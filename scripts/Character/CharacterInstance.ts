class CharacterInstance extends BABYLON.Mesh {

    public mesh: BABYLON.Mesh;

    constructor(character: Character) {
        super(character.name, character.scene);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./datas/" + character.name + ".babylon",
            "",
            character.scene,
            (meshes) => {
                console.log(meshes.length);
                meshes.forEach(
                    (m) => {
                        if (m instanceof BABYLON.Mesh) {
                            this.mesh = m;
                            this.mesh.parent = this;
                            console.log(this.mesh.skeleton);
                            this.mesh.skeleton.beginAnimation("ArmatureAction", true);
                        }
                    }
                )
            }
        );
    }
}