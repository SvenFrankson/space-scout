class Flash {
  public source: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  public distance: number = 100;
  public speed: number = 0.1;
  public resetLimit: number = 10;
}

class ShieldMaterial extends BABYLON.ShaderMaterial {
  private _flash1: Flash = new Flash();
  private _color: BABYLON.Color4;
  public get color(): BABYLON.Color4 {
    return this._color;
  }
  public set color(v: BABYLON.Color4) {
    this._color = v;
    this.setColor4("color", this._color);
  }
  private _length: number;
  public get length(): number {
    return this._length;
  }
  public set length(v: number) {
    this._length = v;
    this.setFloat("length", this._length);
  }
  private _tex: BABYLON.Texture;
  public get tex(): BABYLON.Texture {
    return this._tex;
  }
  public set tex(v: BABYLON.Texture) {
    this._tex = v;
    this.setTexture("tex", this._tex);
  }

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
    this.color = new BABYLON.Color4(1, 1, 1, 1);
    this.tex = new BABYLON.Texture("./datas/shield.png", this.getScene());
    this.length = 1.5;
    this.getScene().registerBeforeRender(() => {
      this._flash1.distance += this._flash1.speed;
      this.setVector3("source1", this._flash1.source);
      this.setFloat("sourceDist1", this._flash1.distance);
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
