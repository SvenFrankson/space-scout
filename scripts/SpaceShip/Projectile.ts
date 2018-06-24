class Projectile extends BABYLON.Mesh {

    private _direction: BABYLON.Vector3;
    public shooter: SpaceShip;
    public shotSpeed: number = 150;
    private _lifeSpan: number = 3;
    public power: number = 2;
    private _displacementRay: BABYLON.Ray;

    constructor(direction: BABYLON.Vector3, shooter: SpaceShip) {
        super("projectile", shooter.getScene());
        this._direction = direction;
        this.shooter = shooter;
        this.shotSpeed = this.shooter.shootSpeed;
        this.power = this.shooter.shootPower;
        this.position.copyFrom(shooter.position);
        this.rotationQuaternion = shooter.rotationQuaternion.clone();
        this._displacementRay = new BABYLON.Ray(this.position, this._direction.clone());
        this.getScene().onBeforeRenderObservable.add(this._update);
    }

    public async instantiate(): Promise<void> {
        let vertexData = await VertexDataLoader.instance.get("blaster-trail");
        if (vertexData && !this.isDisposed()) {
            vertexData.applyToMesh(this);
        }
        let material = await MaterialLoader.instance.get("red");
        if (material && !this.isDisposed()) {
            this.material = material;
        }
    }

    public destroy(): void {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }

    private _update = () => {
        let dt = this.getEngine().getDeltaTime() / 1000;
        this._lifeSpan -= dt;
        if (this._lifeSpan < 0) {
            return this.destroy();
        }
        let hitSpaceship = this._collide(dt);
        if (hitSpaceship) {
            hitSpaceship.wound(this);
            return this.destroy();
        }
        this.position.addInPlace(this._direction.scale(this.shotSpeed * dt));
        let zAxis = this._direction;
        let yAxis: BABYLON.Vector3;
        if (Main.Scene.activeCameras && Main.Scene.activeCameras[0]) {
            yAxis = Main.Scene.activeCameras[0].position.subtract(this.position);
        }
        else {
            yAxis = Main.Scene.activeCamera.position.subtract(this.position);
        }
        let xAxis = BABYLON.Vector3.Cross(yAxis, zAxis).normalize();
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, this.rotationQuaternion);
    }

    private _collide(dt: number): SpaceShip {
        this._displacementRay.length = this.shotSpeed * dt;
        for (let i = 0; i < SpaceShipControler.Instances.length; i++) {
            let spaceship = SpaceShipControler.Instances[i].spaceShip;
            if (spaceship.controler.team !== this.shooter.controler.team) {
                let hitInfo = this._displacementRay.intersectsMesh(spaceship.shield, false);
                if (hitInfo.hit) {
                    return spaceship;
                }
            }
        }
        return undefined;
    }
}