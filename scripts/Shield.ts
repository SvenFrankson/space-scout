class Shield extends BABYLON.Mesh {
  private _spaceShip: SpaceShip;
  constructor(spaceShip: SpaceShip) {
    super(spaceShip.name + "-Shield", spaceShip.getScene());
    this._spaceShip = spaceShip;
  }

  public initialize(): void {
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./datas/shield.babylon",
      "",
      Main.Scene,
      (
        meshes: Array<BABYLON.AbstractMesh>,
        particleSystems: Array<BABYLON.ParticleSystem>,
        skeletons: Array<BABYLON.Skeleton>
      ) => {
        let shield: BABYLON.AbstractMesh = meshes[0];
        if (shield instanceof BABYLON.Mesh) {
          let data: BABYLON.VertexData = BABYLON.VertexData.ExtractFromMesh(shield);
          data.applyToMesh(this);
          shield.dispose();
          let material: BABYLON.StandardMaterial = new BABYLON.StandardMaterial(this.name, this.getScene());
          material.diffuseTexture = new BABYLON.Texture("./datas/shield-diffuse.png", this.getScene());
          material.alpha = 0.2;
          this.material = material;
        }
      }
    );
  }
}
