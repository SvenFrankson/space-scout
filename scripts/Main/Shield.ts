class Shield extends BABYLON.Mesh {
	private _spaceShip: Spaceship;
	constructor(spaceShip: Spaceship) {
		super(spaceShip.name + "-Shield", spaceShip.getScene());
		this._spaceShip = spaceShip;
		this.layerMask = 1;
	}

	public initialize(): void {
		let template = BABYLON.MeshBuilder.CreateSphere(
			"template",
			{
				diameterX: 6,
				diameterY: 3,
				diameterZ: 6,
				segments: 12
			},
			this._spaceShip.scene
		);
		let data = BABYLON.VertexData.ExtractFromMesh(template);
		data.applyToMesh(this);
		template.dispose();
		let shieldMaterial: ShieldMaterial = new ShieldMaterial(this.name, this.getScene());
		shieldMaterial.color = new BABYLON.Color4(0.13, 0.52, 0.80, 1);
		shieldMaterial.tex = new BABYLON.Texture("./datas/white-front-gradient.png", this._spaceShip.scene);
		shieldMaterial.noiseAmplitude = 0.05;
		shieldMaterial.noiseFrequency = 16;
		this.material = shieldMaterial;
	}

	public flashAt(position: BABYLON.Vector3, space: BABYLON.Space = BABYLON.Space.LOCAL, speed: number = 0.2): void {
		if (this.material instanceof ShieldMaterial) {
			if (space === BABYLON.Space.WORLD) {
				let worldToLocal: BABYLON.Matrix = BABYLON.Matrix.Invert(this.getWorldMatrix());
				BABYLON.Vector3.TransformCoordinatesToRef(position, worldToLocal, position);
			}
			this.material.flashAt(position, speed);
		}
	}
}
