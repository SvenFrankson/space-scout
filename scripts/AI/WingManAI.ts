class WingManAI extends SpaceShipAI {
  private _leader: SpaceShip;
  private _groupPosition: BABYLON.Vector3;
  private _targetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private _direction: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
  private _distance: number = 1;

  constructor(spaceShip: SpaceShip, leader: SpaceShip, groupPosition: BABYLON.Vector3, scene: BABYLON.Scene) {
    super(spaceShip, scene);
    this._leader = leader;
    this._groupPosition = groupPosition;
    this._mode = IIABehaviour.Follow;
  }

  public checkInputs(dt: number): void {
    this._checkMode(dt);
    this._goTo(dt);
  }

  public commandPosition(newPosition: BABYLON.Vector3): void {
    this._targetPosition.copyFrom(newPosition);
    this._mode = IIABehaviour.GoTo;
    Comlink.Display(Dialogs.randomNeutralCommand(), 5000);
  }

  private _checkMode(dt: number): void {
    if (this._mode === IIABehaviour.Follow) {
      this._targetPosition.copyFrom(this._groupPosition);
      BABYLON.Vector3.TransformCoordinatesToRef(this._targetPosition, this._leader.getWorldMatrix(), this._targetPosition);
      this._direction.copyFrom(this._targetPosition);
      this._direction.subtractInPlace(this._spaceShip.position);
      this._distance = this._direction.length();
      this._direction.normalize();
      if (this._distance < 10) {
        this._targetPosition.copyFromFloats(- this._groupPosition.x, this._groupPosition.y, this._groupPosition.z);
        BABYLON.Vector3.TransformCoordinatesToRef(this._targetPosition, this._leader.getWorldMatrix(), this._targetPosition);
        this._mode = IIABehaviour.GoTo;
      }
    } else if (this._mode === IIABehaviour.GoTo) {
      this._direction.copyFrom(this._targetPosition);
      this._direction.subtractInPlace(this._spaceShip.position);
      this._distance = this._direction.length();
      this._direction.normalize();
      if (this._distance < 10) {
        this._mode = IIABehaviour.Follow;
      }
    }
    $("#behaviour").text(IIABehaviour[this._mode]);
  }

  private _goTo(dt: number): void {
    if (this._distance > 2 * this._spaceShip.forward) {
      this._spaceShip.forward += this._forwardPow * dt;
    }

    let angleAroundY: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localY);
    let yawInput: number = BABYLON.MathTools.Clamp(angleAroundY / Math.PI, -1, 1);
    this._spaceShip.yaw += this._yawPow * yawInput * dt;

    let angleAroundX: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localX);
    let pitchInput: number = BABYLON.MathTools.Clamp(angleAroundX / Math.PI, -1, 1);
    this._spaceShip.pitch += this._pitchPow * pitchInput * dt;

    let angleAroundZ: number = SpaceMath.AngleFromToAround(this._leader.localY, this._spaceShip.localY, this._spaceShip.localZ);
    let rollInput: number = BABYLON.MathTools.Clamp(angleAroundZ / Math.PI, -1, 1);
    this._spaceShip.roll += this._rollPow * rollInput * dt;
  }
}
