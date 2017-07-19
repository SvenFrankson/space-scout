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
  private _noiseAmplitude: number;
  public get noiseAmplitude(): number {
    return this._noiseAmplitude;
  }
  public set noiseAmplitude(v: number) {
    this._noiseAmplitude = v;
    this.setFloat("noiseAmplitude", this._noiseAmplitude);
  }
  private _noiseFrequency: number;
  public get noiseFrequency(): number {
    return this._noiseFrequency;
  }
  public set noiseFrequency(v: number) {
    this._noiseFrequency = v;
    this.setFloat("noiseFrequency", this._noiseFrequency);
  }
  private _fresnelBias: number;
  public get fresnelBias(): number {
    return this._fresnelBias;
  }
  public set fresnelBias(v: number) {
    this._fresnelBias = v;
    this.setFloat("fresnelBias", this._fresnelBias);
  }
  private _fresnelPower: number;
  public get fresnelPower(): number {
    return this._fresnelPower;
  }
  public set fresnelPower(v: number) {
    this._fresnelPower = v;
    this.setFloat("fresnelPower", this._fresnelPower);
  }
  private _fadingDistance: number;
  public get fadingDistance(): number {
    return this._fadingDistance;
  }
  public set fadingDistance(v: number) {
    this._fadingDistance = v;
    this.setFloat("fadingDistance", this._fadingDistance);
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
    this.backFaceCulling = false;
    this.color = new BABYLON.Color4(1, 1, 1, 1);
    this.tex = new BABYLON.Texture("./datas/shield.png", this.getScene());
    this.length = 1.5;
    this.noiseFrequency = 1;
    this.noiseAmplitude = 0;
    this.fresnelBias = 2;
    this.fresnelPower = 64;
    this.fadingDistance = 0;
    this.getScene().registerBeforeRender(() => {
      this._flash1.distance += this._flash1.speed;
      this.setVector3("source1", this._flash1.source);
      this.setFloat("sourceDist1", this._flash1.distance);
      this.setVector3("cameraPosition", scene.activeCamera.position);
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
