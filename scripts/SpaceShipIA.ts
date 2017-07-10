enum IIABehaviour {
  Track,
  Escape
}

class SpaceShipIA {
  private _target: SpaceShip;
  private _spaceShip: SpaceShip;
  private _forwardPow: number = 20;
  // private _backwardPow: number = 10;
  private _rollPow: number = 3;
  private _yawPow: number = 3;
  private _pitchPow: number = 3;
  private _scene: BABYLON.Scene;
  // private _canvas: HTMLCanvasElement;
  private _mode: IIABehaviour = IIABehaviour.Track;

  constructor(spaceShip: SpaceShip, target: SpaceShip, scene: BABYLON.Scene) {
    this._spaceShip = spaceShip;
    this._target = target;
    this._scene = scene;
  }

  public checkInputs(dt: number): void {
    let direction: BABYLON.Vector3 = this._target.position.subtract(this._spaceShip.position);
    let distance: number = direction.length();
    direction.normalize();

    this._checkMode(dt, direction, distance);
    if (this._mode === IIABehaviour.Track) {
      this.track(dt, direction, distance);
    } else if (this._mode === IIABehaviour.Escape) {
      this.escape(dt, direction, distance);
    }
  }

  private _checkMode(dt: number, direction: BABYLON.Vector3, distance: number): void {
    if (this._mode === IIABehaviour.Track) {
      if (distance < 10) {
        this._mode = IIABehaviour.Escape;
      }
    } else if (this._mode === IIABehaviour.Escape) {
      if (distance > 100) {
        this._mode = IIABehaviour.Track;
      }
    }
  }

  public track(dt: number, direction: BABYLON.Vector3, distance: number): void {
    if (distance > 10) {
      this._spaceShip.forward += this._forwardPow * dt;
    }

    let angleAroundY: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localY);
    let yawInput: number = BABYLON.MathTools.Clamp(angleAroundY / Math.PI, -1, 1);
    this._spaceShip.yaw += this._yawPow * yawInput * dt;

    let angleAroundX: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localX);
    let pitchInput: number = BABYLON.MathTools.Clamp(angleAroundX / Math.PI, -1, 1);
    this._spaceShip.pitch += this._pitchPow * pitchInput * dt;

    let angleAroundZ: number = SpaceMath.AngleFromToAround(this._target.localY, this._spaceShip.localY, this._spaceShip.localZ);
    let rollInput: number = BABYLON.MathTools.Clamp(angleAroundZ / Math.PI, -1, 1);
    this._spaceShip.roll += this._rollPow * rollInput * dt;
  }

  public escape(dt: number, direction: BABYLON.Vector3, distance: number): void {
    this._spaceShip.forward += this._forwardPow * dt;

    let angleAroundY: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localY);
    let yawInput: number = BABYLON.MathTools.Clamp(angleAroundY / Math.PI, -1, 1);
    yawInput = - BABYLON.MathTools.Sign(yawInput) * (1 - Math.abs(yawInput));
    this._spaceShip.yaw += this._yawPow * yawInput * dt;

    let angleAroundX: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localX);
    let pitchInput: number = BABYLON.MathTools.Clamp(angleAroundX / Math.PI, -1, 1);
    pitchInput = - BABYLON.MathTools.Sign(pitchInput) * (1 - Math.abs(pitchInput));
    this._spaceShip.pitch += this._pitchPow * pitchInput * dt;

    let angleAroundZ: number = SpaceMath.AngleFromToAround(this._target.localY, this._spaceShip.localY, this._spaceShip.localZ);
    let rollInput: number = BABYLON.MathTools.Clamp(angleAroundZ / Math.PI, -1, 1);
    this._spaceShip.roll += this._rollPow * rollInput * dt;
  }
}
