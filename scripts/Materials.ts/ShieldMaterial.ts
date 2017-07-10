class ShieldMaterial extends BABYLON.ShaderMaterial {
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
    let k: number = 0;
    this.getScene().registerBeforeRender(() => {
      this.setVector3("source1", new BABYLON.Vector3(0, 0, 3));
      this.setFloat("sqrSourceDist1", k * k / 1000);
      k++;
      if (k > 300) {
        k = 0;
      }
    });
  }
}
