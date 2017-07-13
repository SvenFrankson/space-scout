enum IIABehaviour {
  Track,
  Escape,
  Follow,
  GoTo
}

class SpaceShipAI {
  protected _spaceShip: SpaceShip;
  protected _forwardPow: number = 10;
  // private _backwardPow: number = 10;
  protected _rollPow: number = 2.5;
  protected _yawPow: number = 3;
  protected _pitchPow: number = 3;
  protected _scene: BABYLON.Scene;
  // private _canvas: HTMLCanvasElement;
  protected _mode: IIABehaviour;

  constructor(spaceShip: SpaceShip, scene: BABYLON.Scene) {
    this._spaceShip = spaceShip;
    this._scene = scene;
  }
}
