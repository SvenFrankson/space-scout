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
	private mapIconId: string;
	private mapIcon: JQuery;

	constructor(name: string, scene: BABYLON.Scene) {
		super(name, scene);
		BeaconEmiter.Instances.push(this);
		this.mapIconId = "map-icon-" + BeaconEmiter.Instances.length;
		$("body").append(
			"<img id='" + this.mapIconId + "' class='map-icon' src='./datas/objective-blue.png' hidden></img>"
		);
		this.mapIcon = $("#" + this.mapIconId);
	}

	public Dispose(): void {
		this.mapIcon.remove();
		this.dispose();
	}

	public static DisposeAll(): void {
		for (let i: number = 0; i < BeaconEmiter.Instances.length; i++) {
			let b: BeaconEmiter = BeaconEmiter.Instances[i];
			b.Dispose();
		}
		BeaconEmiter.Instances = [];
		BeaconEmiter.activatedCount = 0;
	}

	public initialize(): void {
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
		);
	}

	public activate(): void {
		if (this.activated) {
			return;
		}
		this.activated = true;
		$("#" + this.mapIconId).attr("src", "./datas/objective-green.png");
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

	public static UpdateAllMapIcons(): void {
		BeaconEmiter.Instances.forEach(
			(v: BeaconEmiter) => {
				v.updateMapIcon(SpaceShipInputs.SSIInstances[0].spaceShip);
			}
		);
	}

	public updateMapIcon(spaceShip: SpaceShip): void {
		let w: number = Main.Canvas.width;
		let h: number = Main.Canvas.height;
		let size: number = Math.min(w, h);

		let relPos: BABYLON.Vector3 = this.position.subtract(spaceShip.position);
		let angularPos: number = SpaceMath.Angle(relPos, spaceShip.localZ) / Math.PI;
		let rollPos: number = SpaceMath.AngleFromToAround(spaceShip.localY, relPos, spaceShip.localZ);
		let iconPos: BABYLON.Vector2 = new BABYLON.Vector2(
			- Math.sin(rollPos) * angularPos,
			- Math.cos(rollPos) * angularPos
		);

		let center: number = size / 2 * 0.1 + size / 2 * 0.4;
		$("#" + this.mapIconId).css("width", 32);
		$("#" + this.mapIconId).css("height", 32);
		$("#" + this.mapIconId).css("top", center + size / 2 * 0.4 * iconPos.y - 16);
		$("#" + this.mapIconId).css("left", center + size / 2 * 0.4 * iconPos.x - 16);
	}
}
