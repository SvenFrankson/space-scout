class TrailMaterial extends BABYLON.ShaderMaterial {
  private _diffuseColor1: BABYLON.Color4 = new BABYLON.Color4(1, 1, 1, 1);
  public get diffuseColor1(): BABYLON.Color4 {
    return this._diffuseColor1;
  }
  public set diffuseColor1(v: BABYLON.Color4) {
    this._diffuseColor1 = v;
    this.setColor4("diffuseColor1", this._diffuseColor1);
  }

  private _diffuseColor2: BABYLON.Color4 = new BABYLON.Color4(1, 1, 1, 1);
  public get diffuseColor2(): BABYLON.Color4 {
    return this._diffuseColor2;
  }
  public set diffuseColor2(v: BABYLON.Color4) {
    this._diffuseColor2 = v;
    this.setColor4("diffuseColor2", this._diffuseColor2);
  }

  constructor(name: string, scene: BABYLON.Scene) {
    super(
      name,
      scene,
      "trail",
      {
        attributes: ["position", "normal", "uv"],
        uniforms: ["projection", "view", "world", "worldView", "worldViewProjection"],
        needAlphaBlending: true
      }
    );
    this.getScene().registerBeforeRender(() => {
      this.setFloat("alpha", this.alpha);
      this.setVector3("cameraPosition", Main.MenuCamera.position);
    });
  }
}
