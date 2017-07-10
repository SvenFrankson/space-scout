class Flash {
  public source: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  public distance: number = 11;
  public speed: number = 0.02;
  public resetLimit: number = 10;
}

class ShieldMaterial extends BABYLON.ShaderMaterial {
  private _flash1: Flash = new Flash();

  constructor(name: string, scene: BABYLON.Scene) {
    super(
      name,
      scene,
      "shield",
      {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection"],
        needAlphaBlending: true
      }
    );
    this.setTexture("textureSampler", new BABYLON.Texture("./datas/shield-diffuse.png", this.getScene()));
    this.getScene().registerBeforeRender(() => {
      this._flash1.distance += this._flash1.speed;
      this.setVector3("source1", this._flash1.source);
      this.setFloat("sqrSourceDist1", this._flash1.distance * this._flash1.distance);
    });
  }

  public flashAt(position: BABYLON.Vector3, speed: number): void {
    if (this._flash1.distance > this._flash1.resetLimit) {
      this._flash1.distance = 0.01;
      this._flash1.source.copyFrom(position);
      this._flash1.speed = speed;
    }
  }
}
