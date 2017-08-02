class SpaceShip extends BABYLON.Mesh {

  private _forwardDrag: number = 0.01;
  private _backwardDrag: number = 1;
  private _forward: number = 0;
  public get forward(): number {
    return this._forward;
  }
  public set forward(v: number) {
    this._forward = v;
  }
  private _rollDrag: number = 0.9;
  private _roll: number = 0;
  public get roll(): number {
    return this._roll;
  }
  public set roll(v: number) {
    if (!isNaN(v)) {
      this._roll = v;
    }
  }
  private _yawDrag: number = 0.9;
  private _yaw: number = 0;
  public get yaw(): number {
    return this._yaw;
  }
  public set yaw(v: number) {
    if (!isNaN(v)) {
      this._yaw = v;
    }
  }
  private _pitchDrag: number = 0.9;
  private _pitch: number = 0;
  public get pitch(): number {
    return this._pitch;
  }
  public set pitch(v: number) {
    if (!isNaN(v)) {
      this._pitch = v;
    }
  }
  private _mesh: BABYLON.Mesh;
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
  private _controler: SpaceShipControler;
  private _colliders: Array<BABYLON.BoundingSphere> = [];
  private _shield: Shield;
  public wingTipRight: BABYLON.Mesh;
  public wingTipLeft: BABYLON.Mesh;
  public focalPlane: BABYLON.Mesh;

  constructor(name: string, scene: BABYLON.Scene) {
    super(name, scene);
    this._localX = new BABYLON.Vector3(1, 0, 0);
    this._localY = new BABYLON.Vector3(0, 1, 0);
    this._localZ = new BABYLON.Vector3(0, 0, 1);
    this.rotation.copyFromFloats(0, 0, 0);
    this.rotationQuaternion = BABYLON.Quaternion.Identity();
    this._rX = BABYLON.Quaternion.Identity();
    this._rY = BABYLON.Quaternion.Identity();
    this._rZ = BABYLON.Quaternion.Identity();
    this._shield = new Shield(this);
    this._shield.initialize();
    this.wingTipLeft = new BABYLON.Mesh("WingTipLeft", scene);
    this.wingTipLeft.parent = this;
    this.wingTipLeft.position.copyFromFloats(-2.91, 0, -1.24);
    this.wingTipRight = new BABYLON.Mesh("WingTipRight", scene);
    this.wingTipRight.parent = this;
    this.wingTipRight.position.copyFromFloats(2.91, 0, -1.24);
    new TrailMesh("Test", this.wingTipLeft, Main.Scene, 0.1, 120);
    new TrailMesh("Test", this.wingTipRight, Main.Scene, 0.1, 120);
    this.createColliders();
    scene.registerBeforeRender(
      () => {
        this._move();
      }
    );
  }

  public initialize(
    url: string,
    callback?: () => void
  ): void {
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./datas/" + url + ".babylon",
      "",
      Main.Scene,
      (
        meshes: Array<BABYLON.AbstractMesh>,
        particleSystems: Array<BABYLON.ParticleSystem>,
        skeletons: Array<BABYLON.Skeleton>
      ) => {
        let spaceship: BABYLON.AbstractMesh = meshes[0];
        if (spaceship instanceof BABYLON.Mesh) {
          spaceship.parent = this;
          this._mesh = spaceship;
          this._shield.parent = this._mesh;
          this.wingTipLeft.parent = this._mesh;
          this.wingTipRight.parent = this._mesh;
          let spaceshipMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("SpaceShipMaterial", this.getScene());
          spaceshipMaterial.diffuseTexture = new BABYLON.Texture("./datas/" + url + "-diffuse.png", Main.Scene);
          spaceshipMaterial.bumpTexture = new BABYLON.Texture("./datas/" + url + "-bump.png", Main.Scene);
          spaceshipMaterial.ambientTexture = new BABYLON.Texture("./datas/" + url + "-ao.png", Main.Scene);
          spaceshipMaterial.ambientTexture.level = 2;
          spaceship.material = spaceshipMaterial;
          if (callback) {
            callback();
          }
        }
      }
    );
  }

  private createColliders(): void {
    this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0.22, -0.59), 1.06));
    this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0, 2.43), 0.75));
  }

  public attachControler(controler: SpaceShipControler): void {
    this._controler = controler;
  }

  public static CenterRadiusBoundingSphere(center: BABYLON.Vector3, radius: number): BABYLON.BoundingSphere {
    return new BABYLON.BoundingSphere(
      new BABYLON.Vector3(center.x, center.y - radius, center.z),
      new BABYLON.Vector3(center.x, center.y + radius, center.z)
    );
  }

  private _move(): void {
    this._dt = this.getEngine().getDeltaTime() / 1000;
    BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.X, this.getWorldMatrix(), this._localX);
    BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Y, this.getWorldMatrix(), this._localY);
    BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Z, this.getWorldMatrix(), this._localZ);

    if (!(Main.State === State.Game)) {
      return;
    }

    if (this._controler) {
      this._controler.checkInputs(this._dt);
    }
    this._drag();

    let dZ: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    dZ.copyFromFloats(
      this._localZ.x * this._forward * this._dt,
      this._localZ.y * this._forward * this._dt,
      this._localZ.z * this._forward * this._dt
    );
    this.position.addInPlace(dZ);

    BABYLON.Quaternion.RotationAxisToRef(this._localZ, - this.roll * this._dt, this._rZ);
    this._rZ.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);

    BABYLON.Quaternion.RotationAxisToRef(this._localY, this.yaw * this._dt, this._rY);
    this._rY.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);

    BABYLON.Quaternion.RotationAxisToRef(this._localX, this.pitch * this._dt, this._rX);
    this._rX.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);

    if (this._mesh) {
      this._mesh.rotation.z = (-this.yaw + this._mesh.rotation.z) / 2;
    }

    this._collide();
  }

  private _drag(): void {
    this.roll = this.roll * (1 - this._rollDrag * this._dt);
    this.yaw = this.yaw * (1 - this._yawDrag * this._dt);
    this.pitch = this.pitch * (1 - this._pitchDrag * this._dt);

    let sqrForward: number = this.forward * this.forward;
    if (this.forward > 0) {
      this.forward -= this._forwardDrag * sqrForward * this._dt;
    } else if (this.forward < 0) {
      this.forward += this._backwardDrag * sqrForward * this._dt;
    }
  }

  private _updateColliders(): void {
    for (let i: number = 0; i < this._colliders.length; i++) {
      this._colliders[i]._update(this.getWorldMatrix());
    }
  }

  private _collide(): void {
    if (this._mesh) {
      let tmpAxis: BABYLON.Vector3 = BABYLON.Vector3.Zero();
      let thisSphere: BABYLON.BoundingSphere = this._mesh.getBoundingInfo().boundingSphere;
      let spheres: BABYLON.BoundingSphere[] = Obstacle.SphereInstancesFromPosition(this.position);
      for (let i: number = 0; i < spheres.length; i++) {
        let sphere: BABYLON.BoundingSphere = spheres[i];
        let intersection: IIntersectionInfo = Intersection.MeshSphere(this._shield, sphere);
        if (intersection.intersect) {
          let forcedDisplacement: BABYLON.Vector3 = intersection.direction.multiplyByFloats(-1, -1, -1);
          forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(intersection.depth, intersection.depth, intersection.depth));
          this.position.addInPlace(forcedDisplacement);
          this._shield.flashAt(intersection.point, BABYLON.Space.WORLD);
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
}
