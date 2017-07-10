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
          let shieldMaterial: ShieldMaterial = new ShieldMaterial(this.name, this.getScene());
          shieldMaterial.color = new BABYLON.Color3(0.5, 0.8, 1);
          this.material = shieldMaterial;
        }
      }
    );
  }

  public flashAt(position: BABYLON.Vector3, space: BABYLON.Space = BABYLON.Space.LOCAL, speed: number = 0.1): void {
    if (this.material instanceof ShieldMaterial) {
      if (space === BABYLON.Space.WORLD) {
        let worldToLocal: BABYLON.Matrix = BABYLON.Matrix.Invert(this.getWorldMatrix());
        BABYLON.Vector3.TransformCoordinatesToRef(position, worldToLocal, position);
      }
      this.material.flashAt(position, speed);
    }
  }
}
