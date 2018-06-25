/// <reference path="../SpaceShipControler.ts"/>

enum IIABehaviour {
	Track,
	Escape,
	Follow,
	GoTo
}

abstract class SpaceShipAI extends SpaceShipControler {
	protected _forwardPow: number = 15;
	// private _backwardPow: number = 10;
	protected _scene: BABYLON.Scene;
	// private _canvas: HTMLCanvasElement;
	protected _mode: IIABehaviour;

	constructor(spaceShip: SpaceShip, role: ISquadRole, team: number, scene: BABYLON.Scene) {
		super(spaceShip, role, team);
		this._scene = scene;
	}

	public abstract checkInputs(dt: number): void;

	public static FuturePosition(spaceship: SpaceShip, delay: number): BABYLON.Vector3 {
		let futurePosition = spaceship.localZ.clone();
		futurePosition.scaleInPlace(spaceship.speed * delay);
		futurePosition.addInPlace(spaceship.position);
		return futurePosition;
	}
}
