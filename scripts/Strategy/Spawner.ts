class Spawner extends BABYLON.Mesh {

    public static Instances: Spawner[] = [];

    public static onAnySpawnerSpawnObservable: BABYLON.Observable<Spawner> = new BABYLON.Observable<Spawner>();

    public speed = 0;
    public delay: number = 10;
    public maxSpawns: number = 3;
    public localX: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
    public localY: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
    public localZ: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
	
	public isAlive: boolean = true;
	public hitPoint: number = 200;
    public stamina: number = 50;
    
    private _spawns: SpaceShip[] = [];

    constructor(
        public team: number,
        scene: BABYLON.Scene,
        position: BABYLON.Vector3 = BABYLON.Vector3.Zero(),
        rotationQuaternion: BABYLON.Quaternion = BABYLON.Quaternion.Identity()
    ) {
        super("spawner-" + team.toFixed(0), scene);
        this.position = position;
        this.rotationQuaternion = rotationQuaternion;
        BABYLON.VertexData.CreateCylinder(
            {
                height: 5   ,
                diameterBottom: 5,
                diameterTop: 2.5,
                tessellation: 8
            }
        ).applyToMesh(this);
        this.getScene().onBeforeRenderObservable.add(this._update);
        Spawner.Instances.push(this);
    }

	public onDestroyObservable: BABYLON.Observable<void> = new BABYLON.Observable<void>();

	public destroy(): void {
		this.getScene().onBeforeRenderObservable.removeCallback(this._update);
		this.dispose();
        this.onDestroyObservable.notifyObservers(undefined);
        let index = Spawner.Instances.indexOf(this);
        if (index !== -1) {
            Spawner.Instances.splice(index, 1);
        }
	}

    private _cooldown: number = 0;
    private _update = async () => {
        if (this._cooldown > 0) {
            let dt = this.getScene().getEngine().getDeltaTime() / 1000;
            this._cooldown -= dt;
            return;
        }
        if (this._spawns.length >= this.maxSpawns) {
            this._cooldown = this.delay / 10;
            return;
        }
        this._cooldown = this.delay;
        let spawn = await SpaceShipFactory.AddSpaceShipToScene(
            {
                name: "Mob",
                url: "arrow-3",
                team: this.team,
                role: ISquadRole.Default
            },
            Main.Scene
        );
        spawn.position.copyFromFloats(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        spawn.position.scaleInPlace(5);
        spawn.position.addInPlace(this.position);
        BABYLON.Quaternion.RotationYawPitchRollToRef(
            (Math.random() - 0.5) * Math.PI / 8,
            (Math.random() - 0.5) * Math.PI / 8,
            (Math.random() - 0.5) * Math.PI / 8,
            spawn.rotationQuaternion
        );
        spawn.rotationQuaternion.multiplyInPlace(this.rotationQuaternion);
        this._spawns.push(spawn);
        spawn.onDestroyObservable.add(
            () => {
                let index = this._spawns.indexOf(spawn);
                if (index !== -1) {
                    this._spawns.splice(index, 1);
                }
            }
        )
        Spawner.onAnySpawnerSpawnObservable.notifyObservers(this);
    }

    public onWoundObservable: BABYLON.Observable<Projectile> = new BABYLON.Observable<Projectile>();
	public wound(projectile: Projectile): void {
		if (this.isAlive) {
			this.hitPoint -= projectile.power;
			this.onWoundObservable.notifyObservers(projectile);
			if (this.hitPoint <= 0) {
				Main.Loger.log(projectile.shooter.name + " killed " + this.name);
				this.hitPoint = 0;
				this.isAlive = false;
				this.destroy();
			}
		}
	}
}