class BeaconEmiter extends BABYLON.Mesh {

  public static Instances: BeaconEmiter[] = [];
  public static activatedCount: number = 0;

  public get shieldMaterial(): ShieldMaterial {
    if (this.material instanceof ShieldMaterial) {
      return this.material;
    }
    return undefined;
  }

  public activated: boolean = false;
  private mapIcon: JQuery;
  private mapIconId: string;

  constructor(name: string, scene: BABYLON.Scene) {
    super(name, scene);
    BeaconEmiter.Instances.push(this);
    this.mapIconId = "map-icon-" + BeaconEmiter.Instances.length;
    $("#canvas-zone").append(
      "<img id='" + this.mapIconId + "' class='map-icon' src='./datas/target3.png'></img>"
    );
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
    if (this.shieldMaterial) {
      this.shieldMaterial.flashAt(BABYLON.Vector3.Zero(), 0.1);
    }
    setInterval(
      () => {
        if (this.shieldMaterial) {
          this.shieldMaterial.flashAt(BABYLON.Vector3.Zero(), 0.1);
        }
      },
      3000
    );
  }

  public updateMapIcon(): void {
    let w: number = Main.Canvas.width;
    let h: number = Main.Canvas.height;
    let size: number = Math.min(w, h);

    $("#" + this.mapIconId).css("top", size / 2 * 0.1 + size / 2 * 0.4 * this.position.z / 300);
    $("#" + this.mapIconId).css("left", size / 2 * 0.1 + size / 2 * 0.4 * this.position.x / 300);
    $("#" + this.mapIconId).show();
  }
}
