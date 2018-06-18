enum ISquadRole {
	Leader,
	WingMan,
	Default
}

interface ISpaceshipInstanceData {
	name: string;
	url: string;
	x: number;
	y: number;
	z: number;
	team: number;
	role: ISquadRole;
}

class SpaceShipFactory {
	public static async AddSpaceShipToScene(
		data: ISpaceshipInstanceData,
		scene: BABYLON.Scene
	): Promise<SpaceShip> {
		let spaceshipData = await SpaceshipLoader.instance.get(data.url);
		let spaceShip: SpaceShip = new SpaceShip(spaceshipData, Main.Scene);
		spaceShip.name = data.name;
		await spaceShip.initialize(spaceshipData.model);
		let spaceshipAI = new DefaultAI(spaceShip, data.role, data.team, scene);
		spaceShip.attachControler(spaceshipAI);
		spaceShip.position.copyFromFloats(data.x, data.y, data.z);
		return spaceShip;
	}

	public static async LoadSpaceshipPart(
		part: string,
		scene: BABYLON.Scene,
		baseColor: string,
		detailColor: string
	): Promise<BABYLON.Mesh> {
		let baseColor3 = BABYLON.Color3.FromHexString(baseColor);
		let detailColor3 = BABYLON.Color3.FromHexString(detailColor);
		let data = VertexDataLoader.clone(await VertexDataLoader.instance.get(part));
		if (data.colors) {
			for (let i = 0; i < data.colors.length / 4; i++) {
				let r = data.colors[4 * i];
				let g = data.colors[4 * i + 1];
				let b = data.colors[4 * i + 2];
				if (r === 1 && g === 0 && b === 0) {
					data.colors[4 * i] = detailColor3.r;
					data.colors[4 * i + 1] = detailColor3.g;
					data.colors[4 * i + 2] = detailColor3.b;
				}
			}
		}
		let m = new BABYLON.Mesh(part, Main.Scene);
		data.applyToMesh(m);
		let cellMaterial = new BABYLON.CellMaterial("CellMaterial", Main.Scene);
		cellMaterial.computeHighLevel = true;
		m.material = cellMaterial;
		return m;
	}
}
