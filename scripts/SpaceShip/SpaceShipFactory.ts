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
		spaceShip.initialize(
			spaceshipData.model,
			() => {
				let spaceshipAI = new DefaultAI(spaceShip, data.role, data.team, scene);
				spaceShip.attachControler(spaceshipAI);
			}
		);
		spaceShip.position.copyFromFloats(data.x, data.y, data.z);
		return spaceShip;
	}
}
