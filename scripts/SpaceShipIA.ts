enum IIABehaviour {
  Track,
  Escape,
  Follow,
  GoTo
}

class SpaceShipIA {
  private _target: SpaceShip;
  private _targetPosition: BABYLON.Vector3;
  private _spaceShip: SpaceShip;
  private _forwardPow: number = 10;
  // private _backwardPow: number = 10;
  private _rollPow: number = 2.5;
  private _yawPow: number = 1.5;
  private _pitchPow: number = 1.5;
  private _scene: BABYLON.Scene;
  // private _canvas: HTMLCanvasElement;
  private _mode: IIABehaviour = IIABehaviour.Follow;

  constructor(spaceShip: SpaceShip, target: SpaceShip, scene: BABYLON.Scene) {
    this._spaceShip = spaceShip;
    this._target = target;
    this._scene = scene;
  }

  public checkInputs(dt: number): void {
    this._checkMode(dt);
    if (this._mode === IIABehaviour.Track) {
      this.track(dt);
    } else if (this._mode === IIABehaviour.Escape) {
      this.escape(dt);
    } else if (this._mode === IIABehaviour.Follow) {
      this.follow(dt);
    } else if (this._mode === IIABehaviour.GoTo) {
      this.goTo(dt);
    }
  }

  private _checkMode(dt: number): void {
    if (this._mode === IIABehaviour.Track) {
      let direction: BABYLON.Vector3 = this._target.position.subtract(this._spaceShip.position);
      let distance: number = direction.length();
      direction.normalize();
      if (distance < 10) {
        this._mode = IIABehaviour.Escape;
      }
    } else if (this._mode === IIABehaviour.Escape) {
      let direction: BABYLON.Vector3 = this._target.position.subtract(this._spaceShip.position);
      let distance: number = direction.length();
      direction.normalize();
      if (distance > 100) {
        this._mode = IIABehaviour.Track;
      }
    } else if (this._mode === IIABehaviour.Follow) {
      let direction: BABYLON.Vector3 = this._target.position.subtract(this._spaceShip.position);
      let distance: number = direction.length();
      direction.normalize();
      if (distance < 20) {
        this._targetPosition = this._target.position.add(this._target.localZ.scale(50));
        this._mode = IIABehaviour.GoTo;
      }
    } else if (this._mode === IIABehaviour.GoTo) {
      let direction: BABYLON.Vector3 = this._targetPosition.subtract(this._spaceShip.position);
      let distance: number = direction.length();
      direction.normalize();
      if (distance < 10) {
        this._mode = IIABehaviour.Follow;
      }
    }
    $("#behaviour").text(IIABehaviour[this._mode] + "");
  }

  public track(dt: number): void {
    let direction: BABYLON.Vector3 = this._target.position.subtract(this._spaceShip.position);
    let distance: number = direction.length();
    direction.normalize();
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

  public follow(dt: number): void {
    let direction: BABYLON.Vector3 = this._target.position.subtract(this._spaceShip.position);
    let distance: number = direction.length();
    direction.normalize();
    if (distance > 20) {
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

  public goTo(dt: number): void {
    let direction: BABYLON.Vector3 = this._targetPosition.subtract(this._spaceShip.position);
    let distance: number = direction.length();
    direction.normalize();
    if (distance > 10) {
      this._spaceShip.forward += this._forwardPow * dt;
    }

    let angleAroundY: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localY);
    let yawInput: number = BABYLON.MathTools.Clamp(angleAroundY / Math.PI, -1, 1);
    this._spaceShip.yaw += this._yawPow * yawInput * dt;

    let angleAroundX: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localX);
    let pitchInput: number = BABYLON.MathTools.Clamp(angleAroundX / Math.PI, -1, 1);
    this._spaceShip.pitch += this._pitchPow * pitchInput * dt;
  }

  public escape(dt: number): void {
    let direction: BABYLON.Vector3 = this._target.position.subtract(this._spaceShip.position);
    direction.normalize();
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
