class SpaceShipCamera extends BABYLON.FreeCamera {
  private _spaceShip: SpaceShip;
  private _targetPosition: BABYLON.Vector3;
  private _targetRotation: BABYLON.Quaternion;
  private _offset: BABYLON.Vector3;
  private _offsetRotation: BABYLON.Quaternion;
  private _smoothness: number = 32;
  private _smoothnessRotation: number = 16;

  constructor(
    name: string,
    position: BABYLON.Vector3,
    scene: BABYLON.Scene,
    spaceShip: SpaceShip,
    smoothness?: number,
    smoothnessRotation?: number
  ) {
    super(name, position, scene);
    this._targetPosition = BABYLON.Vector3.Zero();
    this._targetRotation = BABYLON.Quaternion.Identity();
    this._offset = new BABYLON.Vector3(0, 4, -10);
    this._offsetRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, 6 / 60);
    this.rotation.copyFromFloats(0, 0, 0);
    this.rotationQuaternion = BABYLON.Quaternion.Identity();
    this._spaceShip = spaceShip;
    this.maxZ = 1000;
    if (!isNaN(smoothness)) {
      this._smoothness = smoothness;
    }
    if (!isNaN(smoothnessRotation)) {
      this._smoothnessRotation = smoothnessRotation;
    }
  }

  public _checkInputs(): void {
    if (!this._spaceShip.getWorldMatrix()) {
      return;
    }
    BABYLON.Vector3.TransformNormalToRef(
      this._offset,
      this._spaceShip.getWorldMatrix(),
      this._targetPosition
    );
    this._targetPosition.addInPlace(this._spaceShip.position);
    let s: number = this._smoothness - 1;
    this.position.copyFromFloats(
      (this._targetPosition.x + this.position.x * s) / this._smoothness,
      (this._targetPosition.y + this.position.y * s) / this._smoothness,
      (this._targetPosition.z + this.position.z * s) / this._smoothness
    );

    this._targetRotation.copyFrom(this._spaceShip.rotationQuaternion);
    this._targetRotation.multiplyInPlace(this._offsetRotation);
    BABYLON.Quaternion.SlerpToRef(
      this.rotationQuaternion,
      this._targetRotation,
      1 / this._smoothnessRotation,
      this.rotationQuaternion
    );
  }
}
