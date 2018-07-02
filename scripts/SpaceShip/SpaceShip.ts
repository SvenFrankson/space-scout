class SpaceShip extends BABYLON.Mesh {

	private _forwardInput: number = 0;
	public get forwardInput(): number {
		return this._forwardInput;
	}
	public set forwardInput(v: number) {
		if (isFinite(v)) {
			this._forwardInput = BABYLON.Scalar.Clamp(v, -1, 1);
		}
	}
	private _enginePower: number = 15;
	private _frontDrag: number = 0.01;
	private _backDrag: number = 1;
	private _speed: number = 0;
	public get speed(): number {
		return this._speed;
	}
	
	private _rollInput: number = 0;
	public get rollInput(): number {
		return this._rollInput;
	}
	public set rollInput(v: number) {
		if (isFinite(v)) {
			this._rollInput = BABYLON.Scalar.Clamp(v, -1, 1);
		}
	}
	private _rollPower: number = 2
	private _rollDrag: number = 0.9;
	private _roll: number = 0;
	public get roll(): number {
		return this._roll;
	}

	private _yawInput: number = 0;
	public get yawInput(): number {
		return this._yawInput;
	}
	public set yawInput(v: number) {
		if (isFinite(v)) {
			this._yawInput = BABYLON.Scalar.Clamp(v, -1, 1);
		}
	}
	private _yawPower: number = 2
	private _yawDrag: number = 0.9;
	private _yaw: number = 0;
	public get yaw(): number {
		return this._yaw;
	}

	private _pitchInput: number = 0;
	public get pitchInput(): number {
		return this._pitchInput;
	}
	public set pitchInput(v: number) {
		if (isFinite(v)) {
			this._pitchInput = BABYLON.Scalar.Clamp(v, -1, 1);
		}
	}
	private _pitchPower: number = 2
	private _pitchDrag: number = 0.9;
	private _pitch: number = 0;
	public get pitch(): number {
		return this._pitch;
	}

	public mesh: BABYLON.Mesh;
	private _dt: number = 0;
	private _rX: BABYLON.Quaternion;
	private _rY: BABYLON.Quaternion;
	private _rZ: BABYLON.Quaternion;
	private _localX: BABYLON.Vector3;
	public get localX(): BABYLON.Vector3 {
		return this._localX;
	}
	private _localY: BABYLON.Vector3;
	public get localY(): BABYLON.Vector3 {
		return this._localY;
	}
	private _localZ: BABYLON.Vector3;
	public get localZ(): BABYLON.Vector3 {
		return this._localZ;
	}
	public controler: SpaceShipControler;
	private _colliders: Array<BABYLON.BoundingSphere> = [];
	public shield: Shield;
	public impactParticle: BABYLON.ParticleSystem;
	public shootFlashParticle: FlashParticle;
	public wingTipRight: BABYLON.Mesh;
	public wingTipLeft: BABYLON.Mesh;
	public trailMeshes: TrailMesh[] = [];
	public focalPlane: BABYLON.Mesh;
	
	public isAlive: boolean = true;
	public hitPoint: number;
	public stamina: number = 50;

	public canons: BABYLON.Vector3[] = [];
	public shootPower: number = 1;
	public shootSpeed: number = 100;
	public shootCoolDown: number = 0.3;
	public _shootCool: number = 0;

	constructor(data: ISpaceshipData, scene: BABYLON.Scene) {
		super("spaceship", scene);
		
		this.stamina = data.stamina;
		this._enginePower = data.enginePower;
		this._rollPower = data.rollPower;
		this._yawPower = data.yawPower;
		this._pitchPower = data.pitchPower;
		this._frontDrag = data.frontDrag;
		this._backDrag = data.backDrag;
		this._rollDrag = data.rollDrag;
		this._yawDrag = data.yawDrag;
		this._pitchDrag = data.pitchDrag;
		this.shootPower = data.shootPower;
		this.shootCoolDown = data.shootCooldown;
		this.shootSpeed = data.shootSpeed;

		this._localX = new BABYLON.Vector3(1, 0, 0);
		this._localY = new BABYLON.Vector3(0, 1, 0);
		this._localZ = new BABYLON.Vector3(0, 0, 1);
		this.rotation.copyFromFloats(0, 0, 0);
		this.rotationQuaternion = BABYLON.Quaternion.Identity();
		this._rX = BABYLON.Quaternion.Identity();
		this._rY = BABYLON.Quaternion.Identity();
		this._rZ = BABYLON.Quaternion.Identity();

		this.shield = new Shield(this);
		this.shield.initialize();
		this.shield.parent = this;
		this.impactParticle = new BABYLON.ParticleSystem("particles", 2000, scene);
		this.impactParticle.particleTexture = new BABYLON.Texture("./datas/textures/impact.png", scene);
		this.impactParticle.emitter = this.position;
		this.impactParticle.direction1.copyFromFloats(50, 50, 50);
		this.impactParticle.direction2.copyFromFloats(-50, -50, -50);
		this.impactParticle.emitRate = 800;
		this.impactParticle.minLifeTime = 0.02;
		this.impactParticle.maxLifeTime = 0.05;
		this.impactParticle.manualEmitCount = 100;
		this.impactParticle.minSize = 0.05;
		this.impactParticle.maxSize = 0.3;
		this.shootFlashParticle = new FlashParticle("bang-red", scene, 0.8, 0.15);

		this.wingTipLeft = new BABYLON.Mesh("WingTipLeft", scene);
		this.wingTipLeft.parent = this;
		this.wingTipLeft.position.copyFromFloats(-2.91, 0, -1.24);
		this.wingTipRight = new BABYLON.Mesh("WingTipRight", scene);
		this.wingTipRight.parent = this;
		this.wingTipRight.position.copyFromFloats(2.91, 0, -1.24);
		this.trailMeshes = [
			new TrailMesh("Test", this.wingTipLeft, Main.Scene, 0.07, 120),
			new TrailMesh("Test", this.wingTipRight, Main.Scene, 0.07, 120)
		];
		this.hitPoint = this.stamina;
		this.createColliders();
		scene.onBeforeRenderObservable.add(this._move);
	}

	public onDestroyObservable: BABYLON.Observable<void> = new BABYLON.Observable<void>();

	public destroy(): void {
		this.getScene().onBeforeRenderObservable.removeCallback(this._move);
		this.dispose();
		for (let i = 0; i < this.trailMeshes.length; i++) {
			this.trailMeshes[i].destroy();
		}
		this.shootFlashParticle.destroy();
		this.onDestroyObservable.notifyObservers(undefined);
	}

	public async initialize(
		model: SpaceShipElement,
		baseColor: string,
		detailColor: string
	): Promise<BABYLON.Mesh> {
		let meshes: BABYLON.Mesh[] = [];
		await SpaceShip._InitializeRecursively(model, baseColor, detailColor, this, meshes);
		let invWorldMatrix = this.computeWorldMatrix(true).clone().invert();
		for (let i = 0; i < meshes.length; i++) {
			meshes[i].computeWorldMatrix(true);
		}
		for (let i = 0; i < this._canonNodes.length; i++) {
			let canonPoint = BABYLON.Vector3.Zero();
			this._canonNodes[i].computeWorldMatrix(true);
			BABYLON.Vector3.TransformCoordinatesToRef(this._canonNodes[i].absolutePosition, invWorldMatrix, canonPoint);
			this.canons.push(canonPoint);
			ScreenLoger.instance.log("Canon Point " + canonPoint);
		}
		this.mesh = BABYLON.Mesh.MergeMeshes(meshes, true);
		this.mesh.layerMask = 1;
		this.mesh.parent = this;
		this.wingTipLeft.parent = this.mesh;
		this.wingTipRight.parent = this.mesh;
		this.shield.parent = this.mesh;
		return this.mesh;
	}

	private _canonNodes: BABYLON.TransformNode[] = [];
	private static async _InitializeRecursively(
		elementData: SpaceShipElement,
		baseColor: string,
		detailColor: string,
		spaceship: SpaceShip,
		meshes?: BABYLON.Mesh[]
	): Promise<BABYLON.TransformNode> {
		let e = await SpaceShipFactory.LoadSpaceshipPart(elementData.name, Main.Scene, baseColor, detailColor);
		if (meshes) {
			meshes.push(e);
		}
		if (elementData.children) {
			for (let i = 0; i < elementData.children.length; i++) {
				let childData = elementData.children[i];
				let slot = SpaceShipSlots.getSlot(elementData.name, childData.type);
				if (slot) {
					if (childData.type === "drone") {
						if (childData.name === "repair-drone") {
							let drone = new RepairDrone(spaceship);
							drone.basePosition = slot.pos;
							drone.initialize(baseColor, detailColor);
							return drone;
						}
					}
					else {
						let child = await SpaceShip._InitializeRecursively(childData, baseColor, detailColor, spaceship, meshes);
						child.parent = e;
						child.position = slot.pos;
						child.rotation = slot.rot;
						if (slot.mirror) {
							child.scaling.x = -1;
						}
						if (child instanceof BABYLON.Mesh) {
							if (childData.type === "weapon") {
								let canonTip = MeshUtils.getZMaxVertex(child);
								let canonTipNode = new BABYLON.TransformNode("_tmpCanonTipNode", spaceship.getScene());
								canonTipNode.parent = child;
								canonTipNode.position.copyFrom(canonTip);
								canonTipNode.computeWorldMatrix(true);
								spaceship._canonNodes.push(canonTipNode);
							}
							if (childData.type.startsWith("wing")) {
								let wingTip = MeshUtils.getXMinVertex(child);
								BABYLON.Vector3.TransformCoordinatesToRef(wingTip, child.computeWorldMatrix(true), wingTip);
								if (childData.type === "wingL") {
									spaceship.wingTipLeft.position.copyFrom(wingTip);
								}
								else if (childData.type === "wingR") {
									spaceship.wingTipRight.position.copyFrom(wingTip);
								}
							}
						}
					}
				}
			}
		}
		return e;
	}

	private createColliders(): void {
		this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0.22, -0.59), 1.06));
		this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0, 2.43), 0.75));
	}

	public attachControler(controler: SpaceShipControler): void {
		this.controler = controler;
	}

	public static CenterRadiusBoundingSphere(center: BABYLON.Vector3, radius: number): BABYLON.BoundingSphere {
		return new BABYLON.BoundingSphere(
			new BABYLON.Vector3(center.x, center.y - radius, center.z),
			new BABYLON.Vector3(center.x, center.y + radius, center.z)
		);
	}

	private _move = () => {
		this._dt = this.getEngine().getDeltaTime() / 1000;
		BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.X, this.getWorldMatrix(), this._localX);
		BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Y, this.getWorldMatrix(), this._localY);
		BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Z, this.getWorldMatrix(), this._localZ);

		this._shootCool -= this._dt;
		this._shootCool = Math.max(0, this._shootCool);

		if (!(Main.State === State.Game)) {
			return;
		}

		if (this.controler) {
			this.controler.checkInputs(this._dt);
		}
		if (this.isAlive) {
			this._speed += this.forwardInput * this._enginePower * this._dt;
			this._yaw += this.yawInput * this._yawPower * this._dt;
			this._pitch += this.pitchInput * this._pitchPower * this._dt;
			this._roll += this.rollInput * this._rollPower * this._dt;
		}
		this._drag();

		let dZ: BABYLON.Vector3 = BABYLON.Vector3.Zero();
		dZ.copyFromFloats(
			this._localZ.x * this._speed * this._dt,
			this._localZ.y * this._speed * this._dt,
			this._localZ.z * this._speed * this._dt
		);
		this.position.addInPlace(dZ);

		BABYLON.Quaternion.RotationAxisToRef(this._localZ, - this.roll * this._dt, this._rZ);
		this._rZ.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);

		BABYLON.Quaternion.RotationAxisToRef(this._localY, this.yaw * this._dt, this._rY);
		this._rY.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);

		BABYLON.Quaternion.RotationAxisToRef(this._localX, this.pitch * this._dt, this._rX);
		this._rX.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);

		if (this.mesh) {
			this.mesh.rotation.z = (-this.yaw + this.mesh.rotation.z) / 2;
		}

		this._collide();
	}

	private _drag(): void {
		this._roll = this.roll * (1 - this._rollDrag * this._dt);
		this._yaw = this.yaw * (1 - this._yawDrag * this._dt);
		this._pitch = this.pitch * (1 - this._pitchDrag * this._dt);

		let sqrForward: number = this.speed * this.speed;
		if (this.speed > 0) {
			this._speed -= this._frontDrag * sqrForward * this._dt;
		} else if (this.speed < 0) {
			this._speed += this._backDrag * sqrForward * this._dt;
		}
	}

	private _updateColliders(): void {
		for (let i: number = 0; i < this._colliders.length; i++) {
			this._colliders[i]._update(this.getWorldMatrix());
		}
	}

	private _collide(): void {
		if (this.mesh) {
			let tmpAxis: BABYLON.Vector3 = BABYLON.Vector3.Zero();
			let thisSphere: BABYLON.BoundingSphere = this.mesh.getBoundingInfo().boundingSphere;
			let spheres: BABYLON.BoundingSphere[] = Obstacle.SphereInstancesFromPosition(this.position);
			for (let i: number = 0; i < spheres.length; i++) {
				let sphere: BABYLON.BoundingSphere = spheres[i];
				let intersection: IIntersectionInfo = Intersection.MeshSphere(this.shield, sphere);
				if (intersection.intersect) {
					let forcedDisplacement: BABYLON.Vector3 = intersection.direction.multiplyByFloats(-1, -1, -1);
					forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(intersection.depth, intersection.depth, intersection.depth));
					this.position.addInPlace(forcedDisplacement);
					this.shield.flashAt(intersection.point, BABYLON.Space.WORLD);
					return;
				}
			}
			for (let i: number = 0; i < Obstacle.BoxInstances.length; i++) {
				let box: BABYLON.BoundingBox = Obstacle.BoxInstances[i][0][0][0];
				if (Intersection.BoxSphere(box, thisSphere, tmpAxis) > 0) {
					for (let j: number = 0; j < this._colliders.length; j++) {
						this._updateColliders();
						let collisionDepth: number = Intersection.BoxSphere(box, this._colliders[j], tmpAxis);
						if (collisionDepth > 0) {
							let forcedDisplacement: BABYLON.Vector3 = tmpAxis.normalize();
							forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(collisionDepth, collisionDepth, collisionDepth));
							this.position.addInPlace(forcedDisplacement);
							return;
						}
					}
				}
			}
		}
	}

	private _lastCanonIndex = 0;
	public shoot(direction: BABYLON.Vector3): void {
		if (this.isAlive) {
			if (this._shootCool > 0) {
				return;
			}
			this._shootCool = this.shootCoolDown;
			let dir = direction.clone();
			if (SpaceMath.Angle(dir, this.localZ) > Math.PI / 16) {
				let n = BABYLON.Vector3.Cross(this.localZ, dir);
				let m = BABYLON.Matrix.RotationAxis(n, Math.PI / 16);
				BABYLON.Vector3.TransformNormalToRef(this.localZ, m, dir);
			}
			let bullet = new Projectile(dir, this);
			this._lastCanonIndex = (this._lastCanonIndex + 1) % this.canons.length;
			let canon = this.canons[this._lastCanonIndex];
			this.shootFlashParticle.parent = this.mesh;
			this.shootFlashParticle.flash(canon);
			let canonWorld = BABYLON.Vector3.TransformCoordinates(canon, this.mesh.getWorldMatrix());
			bullet.position.copyFrom(canonWorld);
			bullet.instantiate();
		}
	}

    public projectileDurationTo(spaceship: SpaceShip): number {
        let dist = BABYLON.Vector3.Distance(this.position, spaceship.position);
        return dist / this.shootSpeed;
    }

	public onWoundObservable: BABYLON.Observable<Projectile> = new BABYLON.Observable<Projectile>();
	public wound(projectile: Projectile): void {
		if (this.isAlive) {
			this.hitPoint -= projectile.power;
			
			this.impactParticle.emitter = projectile.position.clone();
			this.impactParticle.manualEmitCount = 100;
			this.impactParticle.start();
	
			this.shield.flashAt(projectile.position, BABYLON.Space.WORLD);
	
			this.onWoundObservable.notifyObservers(projectile);
			if (this.hitPoint <= 0) {
				Main.Loger.log(projectile.shooter.name + " killed " + this.name);
				this.hitPoint = 0;
				this.isAlive = false;
				this.impactParticle.emitter = this.position;
				this.impactParticle.minLifeTime = 0.1;
				this.impactParticle.maxLifeTime = 0.5;
				this.impactParticle.manualEmitCount = 100;
				this.impactParticle.minSize = 0.3;
				this.impactParticle.maxSize = 0.6;
				this.impactParticle.manualEmitCount = 4000;
				this.impactParticle.start();
				this.destroy();
			}
		}
	}
}
