/// <reference path="../../lib/babylon.material.d.ts"/>

enum ISquadRole {
	Leader,
	WingMan,
	Default
}

interface ISpaceshipInstanceData {
	name: string;
	url: string;
	x?: number;
	y?: number;
	z?: number;
	rx?: number;
	ry?: number;
	rz?: number;
	rw?: number;
	team: number;
	role: ISquadRole;
}

class SpaceShipFactory {

	public static Scene: BABYLON.Scene;

	constructor(scene: BABYLON.Scene) {
		SpaceShipFactory.Scene = scene;
	}

	public static _cellShadingMaterial: BABYLON.CellMaterial;
	public static get cellShadingMaterial(): BABYLON.CellMaterial {
		if (!SpaceShipFactory._cellShadingMaterial) {
			SpaceShipFactory._cellShadingMaterial = new BABYLON.CellMaterial("CellMaterial", SpaceShipFactory.Scene);
			SpaceShipFactory._cellShadingMaterial.computeHighLevel = true;
		}
		return SpaceShipFactory._cellShadingMaterial;
	}

	public static baseColorFromTeam(team: number): string {
		return "#ffffff";
	}

	public static detailColorFromTeam(team: number): string {
		if (team === 0) {
			return "#0000ff";
		}
		if (team === 1) {
			return "#ff0000";
		}
		return "#00ff00";
	}

	public static async AddSpaceShipToScene(
		data: ISpaceshipInstanceData,
		scene: BABYLON.Scene
	): Promise<Spaceship> {
		let spaceshipData = await SpaceshipLoader.instance.get(data.url);
		let spaceShip: Spaceship = new Spaceship(spaceshipData, scene);
		spaceShip.name = data.name;
		await spaceShip.initialize(
			spaceshipData.model,
			SpaceShipFactory.baseColorFromTeam(data.team),
			SpaceShipFactory.detailColorFromTeam(data.team)
		);
		
		if (isFinite(data.x) && isFinite(data.y) && isFinite(data.z)) {
			spaceShip.position.copyFromFloats(data.x, data.y, data.z);
		}
		if (isFinite(data.rx) && isFinite(data.ry) && isFinite(data.rz) && isFinite(data.rw)) {
			spaceShip.rotationQuaternion.copyFromFloats(data.rx, data.ry, data.rz, data.rw);
		}
		requestAnimationFrame(() => {
			spaceShip.trailMeshes.forEach(
				(t) => {
					t.foldToGenerator();
				}
			)
		});
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
				else if (r === 1 && g === 1 && b === 1) {
					data.colors[4 * i] = baseColor3.r;
					data.colors[4 * i + 1] = baseColor3.g;
					data.colors[4 * i + 2] = baseColor3.b;
				}
				else if (r === 0.502 && g === 0.502 && b === 0.502) {
					data.colors[4 * i] = baseColor3.r * 0.5;
					data.colors[4 * i + 1] = baseColor3.g * 0.5;
					data.colors[4 * i + 2] = baseColor3.b * 0.5;
				}
			}
		}
		let m = new BABYLON.Mesh(part, SpaceShipFactory.Scene);
		m.layerMask = 1;
		data.applyToMesh(m);
		m.material = SpaceShipFactory.cellShadingMaterial;
		return m;
	}
}
