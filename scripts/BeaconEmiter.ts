class BeaconEmiter extends BABYLON.Mesh {

  public static activatedCount: number = 0;

  public get shieldMaterial(): ShieldMaterial {
    if (this.material instanceof ShieldMaterial) {
      return this.material;
    }
    return undefined;
  }

  public activated: boolean = false;

  constructor(name: string, scene: BABYLON.Scene) {
    super(name, scene);
  }

  public initialize() {
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./datas/beacon-emit.babylon",
      "",
      this.getScene(),
      (
        meshes: BABYLON.AbstractMesh[],
        particleSystems: BABYLON.ParticleSystem[],
        skeletons: BABYLON.Skeleton[]
      ) => {
        if (meshes[0] instanceof BABYLON.Mesh) {
          let data: BABYLON.VertexData = BABYLON.VertexData.ExtractFromMesh(meshes[0] as BABYLON.Mesh);
          data.applyToMesh(this);
          meshes[0].dispose();
          let emitMat: ShieldMaterial = new ShieldMaterial(this.name + ("-mat"), this.getScene());
          emitMat.length = 2;
          emitMat.tex = new BABYLON.Texture("./datas/fading-white-stripes.png", this.getScene());
          emitMat.color.copyFromFloats(0.5, 0.5, 0.8, 1);
          emitMat.fadingDistance = 10;
          this.material = emitMat;
        }
      }
    )
  }

  public activate(): void {
    if (this.activated) {
      return;
    }
    this.activated = true;
    BeaconEmiter.activatedCount++;
    setInterval(
      () => {
        if (this.shieldMaterial) {
          this.shieldMaterial.flashAt(BABYLON.Vector3.Zero(), 0.1);
        }
      },
      5000
    );
  }
}
