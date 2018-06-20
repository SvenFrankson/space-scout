class SpaceShipInputs extends SpaceShipControler {

	public static SSIInstances: SpaceShipInputs[] = [];
	private _active: boolean = false;
	private _forwardPow: number = Config.tmpPlayerSpeed;
	private _forward: boolean;
	private _backwardPow: number = 10;
	private _backward: boolean;
	private _right: boolean;
	private _left: boolean;
	private _shoot: boolean;
	private _scene: BABYLON.Scene;
	private _canvas: HTMLCanvasElement;

	public wingMen: WingManAI[] = [];
	private _pointerCursor: BABYLON.Mesh;
	private _pointerDisc: BABYLON.Mesh;
	private _spaceShipCamera: SpaceShipCamera;
	private get spaceShipCamera(): SpaceShipCamera {
		if (!this._spaceShipCamera) {
			this._spaceShipCamera = this._scene.getCameraByName("SpaceShipCamera") as SpaceShipCamera;
		}
		return this._spaceShipCamera;
	}

	private _hud: HUD;
	private get hud(): HUD {
		if (!this._hud) {
			this._hud = new HUD(this, this.spaceShip.getScene());
		}
		return this._hud;
	}

	constructor(spaceShip: SpaceShip, scene: BABYLON.Scene) {
		super(spaceShip, ISquadRole.Leader, 0);
		SpaceShipInputs.SSIInstances.push(this);
		this._spaceShip = spaceShip;
		this._scene = scene;
		this._loadPointer();
	}

	private _loadPointer(): void {
		BABYLON.SceneLoader.ImportMesh(
			"",
			"./datas/target.babylon",
			"",
			Main.Scene,
			(
				meshes: Array<BABYLON.AbstractMesh>,
				particleSystems: Array<BABYLON.ParticleSystem>,
				skeletons: Array<BABYLON.Skeleton>
			) => {
				for (let i: number = 0; i < meshes.length; i++) {
					meshes[i].rotationQuaternion = BABYLON.Quaternion.Identity();
					meshes[i].material.alpha = 0;
					meshes[i].enableEdgesRendering();
					meshes[i].edgesColor.copyFromFloats(1, 1, 1, 1);
					meshes[i].edgesWidth = 2;
					if (meshes[i].name.indexOf("Cursor") !== -1) {
						this._pointerCursor = meshes[i] as BABYLON.Mesh;
						let anim: BABYLON.Animation = new BABYLON.Animation(
							"popoff",
							"scaling",
							60,
							BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
							BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
						);

						let keys: Array<{ frame: number, value: BABYLON.Vector3 }> = new Array<{ frame: number, value: BABYLON.Vector3 }>();
						keys.push({
							frame: 0,
							value: new BABYLON.Vector3(10, 10, 10)
						});
						keys.push({
							frame: 60,
							value: new BABYLON.Vector3(0.1, 0.1, 0.1)
						});
						anim.setKeys(keys);
						anim.addEvent(
							new BABYLON.AnimationEvent(
								60,
								() => {
									this._pointerCursor.isVisible = false;
								}
							)
						);
						this._pointerCursor.animations.push(anim);
					}
					if (meshes[i].name.indexOf("Disc") !== -1) {
						this._pointerDisc = meshes[i] as BABYLON.Mesh;
						let anim: BABYLON.Animation = new BABYLON.Animation(
							"popon",
							"scaling",
							60,
							BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
							BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
						);

						let keys: Array<{ frame: number, value: BABYLON.Vector3 }> = new Array<{ frame: number, value: BABYLON.Vector3 }>();
						keys.push({
							frame: 0,
							value: new BABYLON.Vector3(0.1, 0.1, 0.1)
						});
						keys.push({
							frame: 60,
							value: new BABYLON.Vector3(10, 10, 10)
						});
						anim.setKeys(keys);
						anim.addEvent(
							new BABYLON.AnimationEvent(
								60,
								() => {
									this._pointerDisc.isVisible = false;
								}
							)
						);
						this._pointerDisc.animations.push(anim);
					}
					meshes[i].isVisible = false;
				}
			}
		);
	}

	public attachControl(canvas: HTMLCanvasElement): void {
		this._canvas = canvas;
		canvas.addEventListener(
			"keydown",
			(e: KeyboardEvent) => {
				if (e.key === "z") {
					this._forward = true;
				}
				if (e.key === "s") {
					this._backward = true;
				}
				if (e.key === "d") {
					this._right = true;
				}
				if (e.key === "q") {
					this._left = true;
				}
			}
		);
		canvas.addEventListener(
			"keyup",
			(e: KeyboardEvent) => {
				if (e.key === "z") {
					this._forward = false;
				}
				if (e.key === "s") {
					this._backward = false;
				}
				if (e.key === "d") {
					this._right = false;
				}
				if (e.key === "q") {
					this._left = false;
				}
				if (e.key === "e") {
					this.lockTarget();
				}
				if (e.key === "a") {
					this.commandWingManGoTo();
				}
			}
		);
		canvas.addEventListener(
			"pointerdown",
			(e: PointerEvent) => {
				this._shoot = true;
			}
		)
		canvas.addEventListener(
			"pointerup",
			(e: PointerEvent) => {
				this._shoot = false;
			}
		)
		canvas.addEventListener(
			"mouseover",
			(e: MouseEvent) => {
				this._active = true;
			}
		);
		canvas.addEventListener(
			"mouseout",
			(e: MouseEvent) => {
				this._active = false;
			}
		);
	}

	public commandWingManGoTo(): void {
		this._findWingMen();
		if (this.wingMen[0]) {
			let pick: BABYLON.PickingInfo = this._scene.pick(
				this._scene.pointerX,
				this._scene.pointerY,
				(m: BABYLON.Mesh) => {
					return m === this._spaceShip.focalPlane;
				}
			);
			if (!pick.hit) {
				return;
			}
			this.wingMen[0].commandPosition(
				pick.pickedPoint
			);
			this._pointerDisc.isVisible = true;
			this._pointerCursor.isVisible = true;
			this._pointerDisc.position.copyFrom(pick.pickedPoint);
			this._pointerCursor.position.copyFrom(pick.pickedPoint);
			this._pointerDisc.rotationQuaternion.copyFrom(this._spaceShip.rotationQuaternion);
			this._pointerCursor.rotationQuaternion.copyFrom(this._spaceShip.rotationQuaternion);
			this._scene.beginAnimation(this._pointerDisc, 0, 60);
			this._scene.beginAnimation(this._pointerCursor, 0, 60);
		}
	}

	public lockTarget(): void {
		let ray = this.spaceShip.getScene().createPickingRay(Main.Scene.pointerX, Main.Scene.pointerY, BABYLON.Matrix.Identity(), Main.GameCamera);
		let target: SpaceShip = undefined;
		let minSqrDist: number = Infinity;
		for (let i = 0; i < SpaceShipControler.Instances.length; i++) {
			if (SpaceShipControler.Instances[i] !== this) {
				let sqrDist: number = BABYLON.Vector3.Cross(ray.direction, SpaceShipControler.Instances[i].spaceShip.position.subtract(ray.origin)).length();
				console.log(sqrDist);
				if (sqrDist < minSqrDist) {
					target = SpaceShipControler.Instances[i].spaceShip;
					minSqrDist = sqrDist;
				} 
			}
		}
		if (target) {
			console.log(target.name);
			this.hud.lockedTarget = target;
		}
	}

	public checkInputs(dt: number): void {
		if (!this._canvas) {
			return;
		}
		if (!this._active) {
			this.updateUI(new BABYLON.Vector2(0, 0));
			return;
		}
		this.spaceShip.forwardInput = 0;
		if (this._forward) {
			this._spaceShip.forwardInput = 1;
		}
		if (this._backward) {
			this._spaceShip.forwardInput = -1;
		}
		this._spaceShip.rollInput = 0;
		if (this._right) {
			this._spaceShip.rollInput = 1;
		}
		if (this._left) {
			this._spaceShip.rollInput = -1;
		}
		if (this._shoot) {
			console.log("shoot");
			let pick: BABYLON.PickingInfo = this._scene.pick(
				this._scene.pointerX,
				this._scene.pointerY,
				(m: BABYLON.Mesh) => {
					return m === this._spaceShip.focalPlane;
				}
			);
			if (pick.pickedPoint) {
				let dir = pick.pickedPoint.subtract(this.spaceShip.position).normalize();
				this.spaceShip.shoot(dir);
			}
		}
		let w: number = this._canvas.width;
		let h: number = this._canvas.height;
		let r: number = Math.min(w, h);
		r = r / 2;
		let x: number = (this._scene.pointerX - w / 2) / r;
		let y: number = (this._scene.pointerY - h / 2) / r;
		let mouseInput: BABYLON.Vector2 = new BABYLON.Vector2(x, y);
		let power: number = mouseInput.length();
		if (power > 1) {
			mouseInput.x = mouseInput.x / power;
			mouseInput.y = mouseInput.y / power;
		}
		this.updateUI(mouseInput);
		this._spaceShip.yawInput = mouseInput.x;
		this._spaceShip.pitchInput = mouseInput.y;
	}

	public updateUI(mouseInput: BABYLON.Vector2): void {
		let w: number = this._canvas.width;
		let h: number = this._canvas.height;
		let r: number = Math.min(w, h);

		let size: number = r / 2;
		this.hud.target1.left = (r * mouseInput.x / 4) + "px";
		this.hud.target1.top = (r * mouseInput.y / 4) + "px";
		$("#target2").css("width", size + "px");
		$("#target2").css("height", size + "px");
		$("#target2").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 4);
		$("#target2").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 4);

		size = size / 2;
		this.hud.target2.left = (r * mouseInput.x / 2) + "px";
		this.hud.target2.top = (r * mouseInput.y / 2) + "px";
		$("#target3").css("width", size + "px");
		$("#target3").css("height", size + "px");
		$("#target3").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 2);
		$("#target3").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 2);

		let wSDisplay: number = parseInt($("#speed-display").css("width"), 10);
		let hSDisplay: number = parseInt($("#speed-display").css("height"), 10);
		let clip: number = 0.72 * hSDisplay - (this._spaceShip.shootSpeed) / 40 * 0.38 * hSDisplay;
		clip = Math.floor(clip);
		$("#speed-display").css("clip", "rect(" + clip + "px, " + wSDisplay + "px, " + hSDisplay + "px, 0px)");
	}

	private _findWingMen(): void {
		for (let i: number = 0; i < SpaceShipControler.Instances.length; i++) {
			if (SpaceShipControler.Instances[i].team === this.team) {
				if (SpaceShipControler.Instances[i] instanceof WingManAI) {
					if (this.wingMen.indexOf(SpaceShipControler.Instances[i] as WingManAI) === -1) {
						this.wingMen.push(SpaceShipControler.Instances[i] as WingManAI);
					}
				}
			}
		}
	}
}
