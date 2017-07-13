/// <reference path="../SpaceShipControler.ts"/>

enum IIABehaviour {
  Track,
  Escape,
  Follow,
  GoTo
}

abstract class SpaceShipAI extends SpaceShipControler {
  protected _forwardPow: number = 10;
  // private _backwardPow: number = 10;
  protected _rollPow: number = 2.5;
  protected _yawPow: number = 3;
  protected _pitchPow: number = 3;
  protected _scene: BABYLON.Scene;
  // private _canvas: HTMLCanvasElement;
  protected _mode: IIABehaviour;

  constructor(spaceShip: SpaceShip, role: ISquadRole, team: number, scene: BABYLON.Scene) {
    super(spaceShip, role, team);
    this._scene = scene;
  }

  public abstract checkInputs(dt: number): void;
}
