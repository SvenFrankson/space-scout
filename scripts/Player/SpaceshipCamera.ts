class SpaceshipCamera extends BABYLON.FreeCamera {

    public get engine(): BABYLON.Engine {
        return this.scene.getEngine();
    }
    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    public spaceship: Spaceship;

    private _targetCameraPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    constructor(scene: BABYLON.Scene) {
        super("spaceship-camera", BABYLON.Vector3.Zero(), scene);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        if (this.spaceship) {
            let dt = this.engine.getDeltaTime() / 1000;
            let fps = 1 / dt;
            let forward = this.spaceship.forward;
            let up = this.spaceship.up;

            let f = Math.pow(0.025, 1 / fps);
            BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, this.spaceship.rotationQuaternion, f, this.rotationQuaternion);

            this.target.copyFrom(this.spaceship.position);
            this.target.addInPlace(up.scale(2.5));
            this.target.subtractInPlace(forward.scale(10));

            console.log(f.toFixed(3));
            this.position.scaleInPlace(f);
            this.target.scaleInPlace(1 - f);
            this.position.addInPlace(this.target);
        }
    }
}