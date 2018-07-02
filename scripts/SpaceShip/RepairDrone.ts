class RepairDrone extends BABYLON.TransformNode {

    public static easeOutElastic(t) {
        let p = 0.3;
        return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
    }
    
    public basePosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);

    public container: BABYLON.TransformNode;
    public bodyTop: BABYLON.Mesh;
    public bodyBottom: BABYLON.Mesh;
    public wingL: BABYLON.Mesh;
    public wingR: BABYLON.Mesh;
    public antenna: BABYLON.Mesh;
    public armL: BABYLON.Mesh;
    public armR: BABYLON.Mesh;
    public armRTip: BABYLON.TransformNode;
    public laser: BABYLON.Mesh;
    public repairParticle: BABYLON.SolidParticleSystem;

    private _speed: number = 0;

    public cooldown: number = 10;
    private _basedTime: number = 5;
    public repairStepsMax: number = 4;
    public healPower: number = 3;

    constructor(public spaceship: SpaceShip) {
        super("Repair-Drone", spaceship.getScene());
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        spaceship.onDestroyObservable.add(
            () => {
                this.destroy();
            }
        )
    }

    public destroy(): void {
        this.dispose();
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }

    public async initialize(
		baseColor: string,
        detailColor: string
    ): Promise<void> {
        this.container = new BABYLON.TransformNode("container", this.getScene());
        this.container.parent = this;
        return new Promise<void>(
            (resolve) => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/models/repair-drone.babylon",
                    "",
                    this.getScene(),
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                let data = BABYLON.VertexData.ExtractFromMesh(mesh);
                                if (data.colors) {
                                    let baseColor3 = BABYLON.Color3.FromHexString(baseColor);
                                    let detailColor3 = BABYLON.Color3.FromHexString(detailColor);
                                    for (let i = 0; i < data.colors.length / 4; i++) {
                                        let r = data.colors[4 * i];
                                        let g = data.colors[4 * i + 1];
                                        let b = data.colors[4 * i + 2];
                                        if (r === 1 && g === 0 && b === 0) {
                                            data.colors[4 * i] = detailColor3.r;
                                            data.colors[4 * i + 1] = detailColor3.g;
                                            data.colors[4 * i + 2] = detailColor3.b;
                                        }
                                        else if (r === 1 && g === 1 && b === 1) {
                                            data.colors[4 * i] = baseColor3.r;
                                            data.colors[4 * i + 1] = baseColor3.g;
                                            data.colors[4 * i + 2] = baseColor3.b;
                                        }
                                        else if (r === 0.502 && g === 0.502 && b === 0.502) {
                                            data.colors[4 * i] = baseColor3.r * 0.5;
                                            data.colors[4 * i + 1] = baseColor3.g * 0.5;
                                            data.colors[4 * i + 2] = baseColor3.b * 0.5;
                                        }
                                    }
                                }
                                data.applyToMesh(mesh);
                                if (mesh.name === "antenna") {
                                    this.antenna = mesh;
                                }
                                else if (mesh.name === "body-top") {
                                    this.bodyTop = mesh;
                                }
                                else if (mesh.name === "body-bottom") {
                                    this.bodyBottom = mesh;
                                }
                                else if (mesh.name === "arm-L") {
                                    this.armL = mesh;
                                }
                                else if (mesh.name === "arm-R") {
                                    this.armR = mesh;
                                }
                                else if (mesh.name === "wing-L") {
                                    this.wingL = mesh;
                                }
                                else if (mesh.name === "wing-R") {
                                    this.wingR = mesh;
                                }
                                else if (mesh.name === "laser") {
                                    this.laser = mesh;
                                }
                                mesh.material = SpaceShipFactory.cellShadingMaterial;
                                mesh.layerMask = 1;
                                ScreenLoger.instance.log(mesh.name);
                                mesh.parent = this.container;
                            }
                        }
                        this.armL.parent = this.bodyBottom;
                        this.armR.parent = this.bodyBottom;
                        this.armRTip = new BABYLON.TransformNode("armRTip", this.getScene());
                        this.armRTip.parent = this.armR;
                        this.armRTip.position.copyFromFloats(0, 0, 0.65);
                        this.laser.parent = this.spaceship.mesh;
                        this.laser.isVisible = false;
                        
                        this.bodyBottom.position.copyFrom(RepairDrone.BodyBottomFoldPosition);
                        this.antenna.scaling.copyFrom(RepairDrone.AntennaFoldScaling);
                        this.armR.scaling.copyFrom(RepairDrone.ArmLFoldScaling);
                        this.armL.scaling.copyFrom(RepairDrone.ArmRFoldScaling);
                        this.wingL.rotation.copyFrom(RepairDrone.WingLFoldRotation);
                        this.wingR.rotation.copyFrom(RepairDrone.WingRFoldRotation);
                        this._isBased = true;
                        
                        let particleMaterial = new BABYLON.StandardMaterial(name + "-material", this.getScene());
                        particleMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/impact-white.png", this.getScene());
                        particleMaterial.diffuseTexture.hasAlpha = true;
                        particleMaterial.specularColor.copyFromFloats(0, 0, 0);
                        particleMaterial.emissiveTexture = particleMaterial.diffuseTexture;
                         // SPS creation
                        var plane = BABYLON.Mesh.CreatePlane("plane", 5, this.getScene());
                        this.repairParticle = new BABYLON.SolidParticleSystem('SPS', this.getScene());
                        this.repairParticle.addShape(plane, 20);
                        var mesh = this.repairParticle.buildMesh();
                        mesh.material = particleMaterial;
                        mesh.position.y = -50;
                        plane.dispose();  // free memory
                        

                        // SPS behavior definition
                        var speed = 0.08;
                        var gravity = -0.005;

                        // init
                        this.repairParticle.initParticles = () => {
                            // just recycle everything
                            for (var p = 0; p < this.repairParticle.nbParticles; p++) {
                                this.repairParticle.recycleParticle(this.repairParticle.particles[p]);
                            }
                        };

                        // recycle
                        this.repairParticle.recycleParticle = (particle) => {
                            // Set particle new velocity, scale and rotation
                            // As this function is called for each particle, we don't allocate new
                            // memory by using "new BABYLON.Vector3()" but we set directly the
                            // x, y, z particle properties instead
                            particle.position.x = 0;
                            particle.position.y = 0;
                            particle.position.z = 0;
                            particle.velocity.x = (Math.random() - 0.5) * speed;
                            particle.velocity.y = Math.random() * speed;
                            particle.velocity.z = (Math.random() - 0.5) * speed;
                            var scale = 0.015 + Math.random() * 0.055;
                            particle.scale.x = scale;
                            particle.scale.y = scale;
                            particle.scale.z = scale;
                            particle.rotation.x = Math.random() * 3.5;
                            particle.rotation.y = Math.random() * 3.5;
                            particle.rotation.z = Math.random() * 3.5;
                            particle.color.r = Math.random() * 0.4 + 0.3;
                            particle.color.g = 1;
                            particle.color.b = particle.color.r;
                            particle.color.a = 1;
                            return particle;
                        };

                        // update : will be called by setParticles()
                        this.repairParticle.updateParticle = (particle) => {  
                            // some physics here 
                            if (particle.position.y < 0) {
                                this.repairParticle.recycleParticle(particle);
                            }
                            particle.velocity.y += gravity;                         // apply gravity to y
                            (particle.position).addInPlace(particle.velocity);      // update particle new position
                            particle.position.y += speed / 2;
                            particle.scale.scaleInPlace(0.9);
                            return particle;
                        };


                        // init all particle values and set them once to apply textures, colors, etc
                        this.repairParticle.initParticles();
                        this.repairParticle.setParticles();
                        
                        // Tuning : plane particles facing, so billboard and no rotation computation
                        // colors not changing then, neither textures
                        this.repairParticle.billboard = true;
                        this.repairParticle.computeParticleRotation = false;
                        this.repairParticle.computeParticleColor = false;
                        this.repairParticle.computeParticleTexture = false;
                            
                        //scene.debugLayer.show();
                        // animation

                        this.parent = this.spaceship.mesh;
                        this.position.copyFrom(this.basePosition);
                        this.getScene().onBeforeRenderObservable.add(this._update);
                        this.repairCycle();

                        ScreenLoger.instance.log("RepairDrone initialized.");
                        resolve();
                    }
                )
            }
        )
    }

    private async repairCycle() {
        while (!this.isDisposed()) {
            if (this._isBased) {
                await RuntimeUtils.RunCoroutine(this._sleep(3));
                this._basedTime += 3;
            }
            if (this._basedTime > this.cooldown) {
                if (this.spaceship.hitPoint < this.spaceship.stamina) {
                    ScreenLoger.instance.log("SpaceShip is wounded, start repair routine.");
                    for (let i = 0; i < this.repairStepsMax; i++) {
                        if (this.spaceship.hitPoint < this.spaceship.stamina) {
                            ScreenLoger.instance.log("New Repair Step.");
                            let A = this.position.clone();
                            let B = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
                            B.normalize().scaleInPlace(10);
                            let ray = new BABYLON.Ray(B, B.scale(-1).normalize());
                            ray = BABYLON.Ray.Transform(ray, this.spaceship.mesh.getWorldMatrix());
                            let hit = ray.intersectsMesh(this.spaceship.mesh)
                            if (hit.hit) {
                                let p = hit.pickedPoint;
                                B = BABYLON.Vector3.TransformCoordinates(
                                    p,
                                    this.spaceship.mesh.getWorldMatrix().clone().invert()
                                );
                                B = B.addInPlace(BABYLON.Vector3.Normalize(B));
                            }
                            await RuntimeUtils.RunCoroutine(this._repairStep(A, B));
                        }
                        ScreenLoger.instance.log("Repair Step Done.");
                    }
                    ScreenLoger.instance.log("Back To Base Step.");
                    let A = this.position.clone();
                    let B = this.basePosition.clone();
                    await RuntimeUtils.RunCoroutine(this._baseStep(A, B));
                    ScreenLoger.instance.log("Back To Base Step done.");
                }
                else {
                    await RuntimeUtils.RunCoroutine(this._sleep(3));
                }
            }
        }
    }

    private * _sleep(t: number): IterableIterator<any> {
        let timer = 0;
        while (timer < t) {
            timer += this.getScene().getEngine().getDeltaTime() / 1000;
            yield;
        }
    }

    private * _baseStep(A: BABYLON.Vector3, B: BABYLON.Vector3): IterableIterator<any> {
        ScreenLoger.instance.log("New Step.");
        // Build a path for the step.
        let n = BABYLON.Vector3.Cross(A, B).normalize();
        let alpha = Math.acos(BABYLON.Vector3.Dot(A.clone().normalize(), B.clone().normalize()));
        let length = Math.ceil(alpha / (Math.PI / 32));
        let step = alpha / length;
        let dA = A.length();
        let dB = B.length();

        this._targetPositions = [A];
        for (let i = 1; i < length; i++) {
            let matrix = BABYLON.Matrix.RotationAxis(n, step * i);
            let p = BABYLON.Vector3.TransformCoordinates(A, matrix);
            let mult = 1.5 - 0.5 * (1 - i / (length / 2)) * (1 - i / (length / 2));
            let r = i / length;
            p.normalize();
            p.scaleInPlace(dA * mult * (1 - r) + dB * mult * r);
            this._targetPositions.push(p);
        }
        this._targetPositions.push(B);

        let l = this._targetPositions.length;
        this.laser.isVisible = false;
        this.fold();
        let startSPS = () => {
            this.repairParticle.setParticles();
        }
        while (this._targetPositions.length > 1) {
            let targetPosition = this._targetPositions[0];
            let d = BABYLON.Vector3.Distance(targetPosition, this.position);
            let ll = this._targetPositions.length;
            this._speed = 1.5 - 0.5 * (1 - ll / (l / 2)) * (1 - ll / (l / 2));
            if (d < 0.5) {
                this._targetPositions.splice(0, 1);
            }
            yield;
        }

        this._isBased = true;
        this._basedTime = 0;
    }

    private * _repairStep(A: BABYLON.Vector3, B: BABYLON.Vector3): IterableIterator<any> {
        // Build a path for the step.
        let n = BABYLON.Vector3.Cross(A, B).normalize();
        let alpha = Math.acos(BABYLON.Vector3.Dot(A.clone().normalize(), B.clone().normalize()));
        let length = Math.ceil(alpha / (Math.PI / 32));
        let step = alpha / length;
        let dA = A.length();
        let dB = B.length();

        this._targetPositions = [A];
        for (let i = 1; i < length; i++) {
            let matrix = BABYLON.Matrix.RotationAxis(n, step * i);
            let p = BABYLON.Vector3.TransformCoordinates(A, matrix);
            let mult = 1.5 - 0.5 * (1 - i / (length / 2)) * (1 - i / (length / 2));
            let r = i / length;
            p.normalize();
            p.scaleInPlace(dA * mult * (1 - r) + dB * mult * r);
            this._targetPositions.push(p);
        }
        this._targetPositions.push(B);

        let l = this._targetPositions.length;
        this.laser.isVisible = false;
        this.fold();
        let startSPS = () => {
            this.repairParticle.setParticles();
        }
        this._isBased = false;
        while (this._targetPositions.length > 1) {
            let targetPosition = this._targetPositions[0];
            let d = BABYLON.Vector3.Distance(targetPosition, this.position);
            let ll = this._targetPositions.length;
            this._speed = 1.5 - 0.5 * (1 - ll / (l / 2)) * (1 - ll / (l / 2));
            if (d < 0.5) {
                this._targetPositions.splice(0, 1);
            }
            yield;
        }

        let timer = 0;
        this.laser.isVisible = true;
        this.laser.scaling.x = 0;
        this.laser.scaling.y = 0;
        this.unFold();
        this.repairParticle.mesh.isVisible = true;
        this.getScene().registerBeforeRender(startSPS);
        this.repairParticle.mesh.parent = this.spaceship.mesh;
        this.repairParticle.mesh.position = this._targetPositions[0].subtract(this._targetPositions[0].clone().normalize());
        while (timer < 5) {
            this.laser.scaling.x = BABYLON.Scalar.Clamp(1 + 0.25 * Math.cos(timer * 2 * Math.PI), this.laser.scaling.x - 0.1, this.laser.scaling.x + 0.1);
            this.laser.scaling.y = BABYLON.Scalar.Clamp(1 + 0.25 * Math.cos(timer * 2 * Math.PI), this.laser.scaling.y - 0.1, this.laser.scaling.y + 0.1);
            timer += this.getScene().getEngine().getDeltaTime() / 1000;
            this.spaceship.hitPoint += (this.getScene().getEngine().getDeltaTime() / 1000) / 5 * this.healPower;
            yield;
        }
        this.getScene().unregisterBeforeRender(startSPS);
        this.repairParticle.mesh.isVisible = false;
        ScreenLoger.instance.log("Step Done.");
    }

    private _targetPositions: BABYLON.Vector3[] = [];

    private _kIdle: number = 0;
    private _m: BABYLON.Mesh;
    private _isBased: boolean = false;
    private _update = () => {
        if (this._isBased) {
           BABYLON.Vector3.LerpToRef(this.position, this.basePosition, 0.05, this.position);
           BABYLON.Vector3.LerpToRef(this.container.position, BABYLON.Vector3.Zero(), 0.05, this.container.position);
           BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, BABYLON.Quaternion.Identity(), 0.05, this.rotationQuaternion);
        }
        else {
            this.container.position.x = 0.25 * Math.sin(this._kIdle / 200 * Math.PI * 2);
            this.container.position.y = 0.25 * Math.sin(this._kIdle / 100 * Math.PI * 2);
            this.container.position.z = 0.25 * Math.sin(this._kIdle / 400 * Math.PI * 2);
            this._kIdle++;
            let deltaTime = this.getScene().getEngine().getDeltaTime() / 1000;
            let targetPosition = this._targetPositions[0];
            if (targetPosition) {
                
                if (!this._m) {
                    //this._m = BABYLON.MeshBuilder.CreateBox("m", {size: 0.2}, Main.Scene);
                    //this._m.parent = this.spaceship;
                }
                
                let dir = targetPosition.subtract(this.position);
                let dist = dir.length();
                dir.scaleInPlace(1 / dist);
                if (dist > 0) {
                    this.position.addInPlace(dir.scale(Math.min(dist, this._speed * deltaTime)));
                }
                
                let zAxis = this.position.scale(-1).normalize();
                let xAxis = BABYLON.Vector3.Cross(BABYLON.Axis.Y, zAxis);
                let yAxis = BABYLON.Vector3.Cross(zAxis, xAxis);
                BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, BABYLON.Quaternion.RotationQuaternionFromAxis(xAxis, yAxis, zAxis), 0.05, this.rotationQuaternion)
                
                this.laser.position.copyFrom(targetPosition.subtract(BABYLON.Vector3.Normalize(targetPosition)));
                let invWorld = this.spaceship.mesh.getWorldMatrix().clone().invert();
                this.armRTip.computeWorldMatrix(true);
                let armTipWorldPosition = BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.Zero(), this.armRTip.getWorldMatrix());
                let armTipPos = BABYLON.Vector3.TransformCoordinates(armTipWorldPosition, invWorld);
                //this._m.position.copyFrom(armTipWorldPosition);
                this.laser.scaling.z =BABYLON.Vector3.Distance(armTipPos, this.laser.position);
                this.laser.lookAt(armTipPos, 0, Math.PI, Math.PI, BABYLON.Space.LOCAL);
                this.repairParticle.mesh.lookAt(armTipPos, 0, Math.PI / 2, Math.PI, BABYLON.Space.LOCAL);
            }
        }
    }

    public fold(): void {
        this._kFold = 0;
        this.getScene().onBeforeRenderObservable.add(this._fold);
    }

    private static BodyBottomFoldPosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0.095, 0);
    private static AntennaFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static ArmLFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static ArmRFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static WingLFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, - 1.22, 0);
    private static WingRFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, 1.22, 0);
    private _kFold: number = 0;
    private _fold = () => {
        this._kFold++;
        let ratio = this._kFold / 60;
        BABYLON.Vector3.LerpToRef(RepairDrone.BodyBottomUnFoldPosition, RepairDrone.BodyBottomFoldPosition, ratio, this.bodyBottom.position);
        BABYLON.Vector3.LerpToRef(RepairDrone.AntennaUnFoldScaling, RepairDrone.AntennaFoldScaling, ratio, this.antenna.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmLUnFoldScaling, RepairDrone.ArmLFoldScaling, ratio, this.armL.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmRUnFoldScaling, RepairDrone.ArmRFoldScaling, ratio, this.armR.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingLUnFoldRotation, RepairDrone.WingLFoldRotation, ratio, this.wingL.rotation);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingRUnFoldRotation, RepairDrone.WingRFoldRotation, ratio, this.wingR.rotation);
        if (this._kFold > 60) {
            this.bodyBottom.position.copyFrom(RepairDrone.BodyBottomFoldPosition);
            this.antenna.scaling.copyFrom(RepairDrone.AntennaFoldScaling);
            this.armR.scaling.copyFrom(RepairDrone.ArmLFoldScaling);
            this.armL.scaling.copyFrom(RepairDrone.ArmRFoldScaling);
            this.wingL.rotation.copyFrom(RepairDrone.WingLFoldRotation);
            this.wingR.rotation.copyFrom(RepairDrone.WingRFoldRotation);
            this.getScene().onBeforeRenderObservable.removeCallback(this._fold);
        }
    }

    public unFold(): void {
        this._kUnFold = 0;
        this.getScene().onBeforeRenderObservable.add(this._unFold);
    }

    private static BodyBottomUnFoldPosition: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static AntennaUnFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);
    private static ArmLUnFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);
    private static ArmRUnFoldScaling: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);
    private static WingLUnFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private static WingRUnFoldRotation: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private _kUnFold: number = 0;
    private _unFold = () => {
        this._kUnFold++;
        let ratio = RepairDrone.easeOutElastic(this._kUnFold / 60);
        BABYLON.Vector3.LerpToRef(RepairDrone.BodyBottomFoldPosition, RepairDrone.BodyBottomUnFoldPosition, ratio, this.bodyBottom.position);
        BABYLON.Vector3.LerpToRef(RepairDrone.AntennaFoldScaling, RepairDrone.AntennaUnFoldScaling, ratio, this.antenna.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmLFoldScaling, RepairDrone.ArmLUnFoldScaling, ratio, this.armL.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.ArmRFoldScaling, RepairDrone.ArmRUnFoldScaling, ratio, this.armR.scaling);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingLFoldRotation, RepairDrone.WingLUnFoldRotation, ratio, this.wingL.rotation);
        BABYLON.Vector3.LerpToRef(RepairDrone.WingRFoldRotation, RepairDrone.WingRUnFoldRotation, ratio, this.wingR.rotation);
        if (this._kUnFold > 60) {
            this.bodyBottom.position.copyFrom(RepairDrone.BodyBottomUnFoldPosition);
            this.antenna.scaling.copyFrom(RepairDrone.AntennaUnFoldScaling);
            this.armR.scaling.copyFrom(RepairDrone.ArmLUnFoldScaling);
            this.armL.scaling.copyFrom(RepairDrone.ArmRUnFoldScaling);
            this.wingL.rotation.copyFrom(RepairDrone.WingLUnFoldRotation);
            this.wingR.rotation.copyFrom(RepairDrone.WingRUnFoldRotation);
            this.getScene().onBeforeRenderObservable.removeCallback(this._unFold);
        }
    }
}