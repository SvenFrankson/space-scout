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
          BABYLON.Engine.ShadersRepository = "./shaders/";
          let glassMaterial: BABYLON.ShaderMaterial = new BABYLON.ShaderMaterial(
            "Glass",
            Main.Scene,
            "glass",
            {
              attributes: ["position", "normal", "uv"],
              uniforms: ["world", "worldView", "worldViewProjection"],
              needAlphaBlending: true
            }
          );
          glassMaterial.setTexture("textureSampler", new BABYLON.Texture("./datas/shield-diffuse.png", this.getScene()));
          let k: number = 0;
          this.getScene().registerBeforeRender(() => {
            glassMaterial.setVector3("source1", new BABYLON.Vector3(0, 0, 3));
            glassMaterial.setFloat("sqrSourceDist1", k * k / 1000);
            k++;
            if (k > 300) {
              k = 0;
            }
          });
          this.material = glassMaterial;
        }
      }
    );
  }
}
