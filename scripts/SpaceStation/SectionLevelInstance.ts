class SectionLevelInstance extends BABYLON.Mesh {

    public level: SectionLevel;

    constructor(level: SectionLevel) {
        super(level.name, level.scene);
        this.level = level;
        this.position.copyFrom(level.section.position);
        this.rotation.copyFrom(level.section.rotation);
        this.freezeWorldMatrix();
    }
}