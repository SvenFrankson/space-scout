class PlayerCamera extends BABYLON.FreeCamera {

    public smoothness: number = 10;
    public character: Character;
    public alpha: number = Math.PI / 4;
    public distance: number = 25;

    private _targetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _targetRotation: BABYLON.Quaternion = BABYLON.Quaternion.Identity();

    constructor(character: Character, scene: BABYLON.Scene) {
        super("PlayerCamera", BABYLON.Vector3.Zero(), scene);
        this.character = character;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        scene.registerBeforeRender(this._update);
    }

    private _update = () => {
        this._updateTarget();
        this._updatePositionRotation();
    }

    private _updateTarget(): void {
        if (this.character && this.character.instance) {
            this._targetPosition.copyFrom(this.character.instance.absolutePosition);
            this._targetPosition.addInPlace(
                this.character.instance.getDirection(BABYLON.Axis.Z).scale(-this.distance * Math.cos(this.alpha))
            );
            this._targetPosition.addInPlace(
                this.character.instance.getDirection(BABYLON.Axis.Y).scale(this.distance * Math.sin(this.alpha))
            );
            this._targetRotation.copyFrom(BABYLON.Quaternion.RotationAxis(
                this.character.instance.getDirection(BABYLON.Axis.X), this.alpha
            ));
            this._targetRotation.multiplyInPlace(
                this.character.instance.rotationQuaternion
            );
        }
    }

    private _updatePositionRotation(): void {
        BABYLON.Vector3.LerpToRef(this.position, this._targetPosition, 1 / this.smoothness, this.position);
        BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, this._targetRotation, 1 / this.smoothness, this.rotationQuaternion);
    }
}