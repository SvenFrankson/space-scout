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
          this.material = new ShieldMaterial(this.name, this.getScene());
        }
      }
    );
  }
}
