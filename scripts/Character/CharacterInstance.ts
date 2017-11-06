class CharacterInstance extends BABYLON.Mesh {

    constructor(character: Character) {
        super(character.name, character.scene);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
}