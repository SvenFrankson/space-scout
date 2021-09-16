class FlashParticle extends BABYLON.Mesh {
    constructor(name, scene, size, lifespan) {
        super(name, scene);
        this.scene = scene;
        this.size = size;
        this.lifespan = lifespan;
        this._timer = 0;
        this._update = () => {
            this._timer += this.getScene().getEngine().getDeltaTime() / 1000;
            let s = this.size * this._timer / (this.lifespan / 2);
            let target;
            if (this.scene.activeCameras && this.scene.activeCameras[0]) {
                target = this.scene.activeCameras[0].position;
            }
            else {
                target = this.scene.activeCamera.position;
            }
            if (this.parent) {
                target = target.clone();
                let invParentWorld = this.parent.getWorldMatrix().clone().invert();
                BABYLON.Vector3.TransformCoordinatesToRef(target, invParentWorld, target);
            }
            this.lookAt(target);
            if (this._timer < this.lifespan / 2) {
                this.scaling.copyFromFloats(s, s, s);
                return;
            }
            else {
                this.scaling.copyFromFloats(this.size, this.size, this.size);
                if (this._timer > this.lifespan) {
                    this._timer = 0;
                    this.scaling.copyFromFloats(0, 0, 0);
                    this.getScene().onBeforeRenderObservable.removeCallback(this._update);
                }
            }
        };
        let template = BABYLON.MeshBuilder.CreatePlane("template", { size: 1 }, scene);
        let data = BABYLON.VertexData.ExtractFromMesh(template);
        data.applyToMesh(this);
        template.dispose();
        let material = new BABYLON.StandardMaterial(name + "-material", scene);
        material.diffuseTexture = new BABYLON.Texture("./datas/textures/" + name + ".png", scene);
        material.diffuseTexture.hasAlpha = true;
        material.specularColor.copyFromFloats(0, 0, 0);
        material.emissiveTexture = material.diffuseTexture;
        this.material = material;
        this.scaling.copyFromFloats(0, 0, 0);
        this.layerMask = 1;
    }
    destroy() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
    flash(position) {
        if (this._timer > 0) {
            return;
        }
        this.position.copyFrom(position);
        this.scaling.copyFromFloats(0, 0, 0);
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
}
class IWoundableUtils {
    static IsIWoundable(o) {
        if (o instanceof Spaceship) {
            return true;
        }
        return false;
    }
}
class Intersection {
    static SphereSphere(sphere0, sphere1) {
        let distance = BABYLON.Vector3.Distance(sphere0.centerWorld, sphere1.centerWorld);
        return sphere0.radiusWorld + sphere1.radiusWorld - distance;
    }
    static BoxSphere(box, sphere, directionFromBox) {
        let vector = BABYLON.Vector3.Clamp(sphere.centerWorld, box.minimumWorld, box.maximumWorld);
        let num = BABYLON.Vector3.Distance(sphere.centerWorld, vector);
        directionFromBox.copyFrom(sphere.centerWorld);
        directionFromBox.subtractInPlace(vector);
        return (sphere.radiusWorld - num);
    }
    static MeshSphere(mesh, sphere) {
        // quick check mesh boundingSphere.
        if (!BABYLON.BoundingSphere.Intersects(mesh.getBoundingInfo().boundingSphere, sphere)) {
            return {
                intersect: false,
                depth: 0
            };
        }
        let intersection = {
            intersect: false,
            depth: 0
        };
        let depth = 0;
        let vertex = Intersection._v;
        let world = mesh.getWorldMatrix();
        let vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        let normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        for (let i = 0; i < vertices.length / 3; i++) {
            vertex.copyFromFloats(vertices[3 * i], vertices[3 * i + 1], vertices[3 * i + 2]);
            BABYLON.Vector3.TransformCoordinatesToRef(vertex, world, vertex);
            depth = sphere.radiusWorld - BABYLON.Vector3.Distance(sphere.centerWorld, vertex);
            if (depth > intersection.depth) {
                intersection.intersect = true;
                intersection.depth = depth;
                if (!intersection.point) {
                    intersection.point = BABYLON.Vector3.Zero();
                }
                if (!intersection.direction) {
                    intersection.direction = BABYLON.Vector3.Zero();
                }
                intersection.point.copyFrom(vertex);
                intersection.direction.copyFromFloats(normals[3 * i], normals[3 * i + 1], normals[3 * i + 2]);
                BABYLON.Vector3.TransformNormalToRef(intersection.direction, world, intersection.direction);
            }
        }
        return intersection;
    }
}
Intersection._v = BABYLON.Vector3.Zero();
/// <reference path="../../lib/babylon.d.ts"/>
class Main {
    async initialize(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new BABYLON.Scene(this.engine);
        let light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(1, 3, 2), this.scene);
        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, this.scene);
        skybox.rotation.y = Math.PI / 2;
        skybox.infiniteDistance = true;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyboxTexture = new BABYLON.CubeTexture("./assets/skyboxes/sky", this.scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture = skyboxTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        let hud = new Hud();
        hud.initialize();
        hud.resize(0.8);
        let playerControler = new PlayerControler();
        playerControler.initialize(hud, this.scene, this.canvas);
        new SpaceShipFactory(this.scene);
        new SpaceshipLoader(this.scene);
        new VertexDataLoader(this.scene);
        let spaceshipData = await SpaceshipLoader.instance.get("arrow-1");
        let _demoSpaceship = new Spaceship(spaceshipData, this.scene);
        _demoSpaceship.setControler(playerControler);
        _demoSpaceship.name = "Demo";
        await _demoSpaceship.initialize({
            type: "root",
            name: "body-1",
            children: [
                {
                    type: "wingL",
                    name: "wing-1",
                    children: [
                        {
                            type: "weapon",
                            name: "canon-1"
                        }
                    ]
                },
                {
                    type: "wingR",
                    name: "wing-1",
                    children: [
                        {
                            type: "weapon",
                            name: "canon-1"
                        }
                    ]
                },
                {
                    type: "engine",
                    name: "engine-1"
                },
                {
                    type: "drone",
                    name: "repair-drone"
                }
            ]
        }, "#FFFFFF", "#FF0000");
        let camera = new SpaceshipCamera(this.scene);
        camera.spaceship = _demoSpaceship;
        for (let i = 0; i < 100; i++) {
            let r = Math.random() * 5 + 1;
            let asteroid = BABYLON.MeshBuilder.CreateSphere("asteroid-" + i, { diameter: 2 * r }, this.scene);
            asteroid.position.x = Math.random() * 1000 - 500;
            asteroid.position.y = Math.random() * 200 - 100;
            asteroid.position.z = Math.random() * 1000 - 500;
        }
    }
    animate() {
        let fpsInfoElement = document.getElementById("fps-info");
        let meshesInfoTotalElement = document.getElementById("meshes-info-total");
        let meshesInfoNonStaticUniqueElement = document.getElementById("meshes-info-nonstatic-unique");
        let meshesInfoStaticUniqueElement = document.getElementById("meshes-info-static-unique");
        let meshesInfoNonStaticInstanceElement = document.getElementById("meshes-info-nonstatic-instance");
        let meshesInfoStaticInstanceElement = document.getElementById("meshes-info-static-instance");
        this.engine.runRenderLoop(() => {
            this.scene.render();
            fpsInfoElement.innerText = this.engine.getFps().toFixed(0) + " fps";
            let uniques = this.scene.meshes.filter(m => { return !(m instanceof BABYLON.InstancedMesh); });
            let uniquesNonStatic = uniques.filter(m => { return !m.isWorldMatrixFrozen; });
            let uniquesStatic = uniques.filter(m => { return m.isWorldMatrixFrozen; });
            let instances = this.scene.meshes.filter(m => { return m instanceof BABYLON.InstancedMesh; });
            let instancesNonStatic = instances.filter(m => { return !m.isWorldMatrixFrozen; });
            let instancesStatic = instances.filter(m => { return m.isWorldMatrixFrozen; });
            meshesInfoTotalElement.innerText = this.scene.meshes.length.toFixed(0).padStart(4, "0");
            meshesInfoNonStaticUniqueElement.innerText = uniquesNonStatic.length.toFixed(0).padStart(4, "0");
            meshesInfoStaticUniqueElement.innerText = uniquesStatic.length.toFixed(0).padStart(4, "0");
            meshesInfoNonStaticInstanceElement.innerText = instancesNonStatic.length.toFixed(0).padStart(4, "0");
            meshesInfoStaticInstanceElement.innerText = instancesStatic.length.toFixed(0).padStart(4, "0");
        });
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}
window.addEventListener("load", async () => {
    let main = new Main();
    await main.initialize("render-canvas");
    main.animate();
});
class MaterialLoader {
    constructor(scene) {
        this.scene = scene;
        this._materials = new Map();
        MaterialLoader.instance = this;
    }
    async get(name) {
        if (this._materials.get(name)) {
            return this._materials.get(name);
        }
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // Typical action to be performed when the document is ready:
                    let rawData = JSON.parse(xhr.responseText);
                    let material = new BABYLON.PBRSpecularGlossinessMaterial(name, this.scene);
                    if (rawData.diffuseColor) {
                        material.diffuseColor = BABYLON.Color3.FromHexString(rawData.diffuseColor);
                    }
                    if (rawData.specularColor) {
                        material.specularColor = BABYLON.Color3.FromHexString(rawData.specularColor);
                    }
                    if (rawData.emissiveColor) {
                        material.emissiveColor = BABYLON.Color3.FromHexString(rawData.emissiveColor);
                    }
                    if (rawData.diffuseTexture) {
                        material.diffuseTexture = new BABYLON.Texture("./datas/textures/" + rawData.diffuseTexture, this.scene);
                        material.diffuseTexture.hasAlpha = true;
                    }
                    if (rawData.emissiveTexture) {
                        material.emissiveTexture = new BABYLON.Texture("./datas/textures/" + rawData.emissiveTexture, this.scene);
                    }
                    this._materials.set(name, material);
                    resolve(this._materials.get(name));
                }
            };
            xhr.open("get", "./datas/materials/" + name + ".json", true);
            xhr.send();
        });
    }
}
class MeshUtils {
    static getXMinVertex(mesh) {
        let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        if (positions && positions.length > 3) {
            let tip = new BABYLON.Vector3(positions[0], positions[1], positions[2]);
            for (let i = 3; i < positions.length; i += 3) {
                if (positions[i] < tip.x) {
                    tip.copyFromFloats(positions[i], positions[i + 1], positions[i + 2]);
                }
            }
            return tip;
        }
        return BABYLON.Vector3.Zero();
    }
    static getZMaxVertex(mesh) {
        let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        if (positions && positions.length > 3) {
            let tip = new BABYLON.Vector3(positions[0], positions[1], positions[2]);
            for (let i = 3; i < positions.length; i += 3) {
                if (positions[i + 2] > tip.z) {
                    tip.copyFromFloats(positions[i], positions[i + 1], positions[i + 2]);
                }
            }
            return tip;
        }
        return BABYLON.Vector3.Zero();
    }
}
class Obstacle {
    static SphereInstancesFromPosition(position) {
        let xChunck = Math.floor(position.x / Obstacle.ChunckSize);
        let yChunck = Math.floor(position.y / Obstacle.ChunckSize);
        let zChunck = Math.floor(position.z / Obstacle.ChunckSize);
        let spheres = [];
        for (let x = xChunck - 1; x <= xChunck + 1; x++) {
            for (let y = yChunck - 1; y <= yChunck + 1; y++) {
                for (let z = zChunck - 1; z <= zChunck + 1; z++) {
                    if (Obstacle.SphereInstances[x]) {
                        if (Obstacle.SphereInstances[x][y]) {
                            if (Obstacle.SphereInstances[x][y][z]) {
                                spheres.push(...Obstacle.SphereInstances[x][y][z]);
                            }
                        }
                    }
                }
            }
        }
        return spheres;
    }
    static PushSphere(sphere) {
        let xChunck = Math.floor(sphere.centerWorld.x / Obstacle.ChunckSize);
        let yChunck = Math.floor(sphere.centerWorld.y / Obstacle.ChunckSize);
        let zChunck = Math.floor(sphere.centerWorld.z / Obstacle.ChunckSize);
        if (!Obstacle.SphereInstances[xChunck]) {
            Obstacle.SphereInstances[xChunck] = [];
        }
        if (!Obstacle.SphereInstances[xChunck][yChunck]) {
            Obstacle.SphereInstances[xChunck][yChunck] = [];
        }
        if (!Obstacle.SphereInstances[xChunck][yChunck][zChunck]) {
            Obstacle.SphereInstances[xChunck][yChunck][zChunck] = [];
        }
        Obstacle.SphereInstances[xChunck][yChunck][zChunck].push(sphere);
    }
}
Obstacle.ChunckSize = 20;
Obstacle.SphereInstances = [];
Obstacle.BoxInstances = [];
class Projectile extends BABYLON.Mesh {
    constructor(direction, shooter) {
        super("projectile", shooter.getScene());
        this.shotSpeed = 150;
        this._lifeSpan = 3;
        this.power = 2;
        this._update = () => {
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
            let yAxis;
            if (this.shooter.scene.activeCameras && this.shooter.scene.activeCameras[0]) {
                yAxis = this.shooter.scene.activeCameras[0].position.subtract(this.position);
            }
            else {
                yAxis = this.shooter.scene.activeCamera.position.subtract(this.position);
            }
            let xAxis = BABYLON.Vector3.Cross(yAxis, zAxis).normalize();
            BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, this.rotationQuaternion);
        };
        this._direction = direction;
        this.shooter = shooter;
        this.shotSpeed = this.shooter.shootSpeed;
        this.power = this.shooter.shootPower;
        this.position.copyFrom(shooter.position);
        this.rotationQuaternion = shooter.rotationQuaternion.clone();
        this._displacementRay = new BABYLON.Ray(this.position, this._direction.clone());
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    async instantiate() {
        let vertexData = await VertexDataLoader.instance.get("blaster-trail");
        if (vertexData && !this.isDisposed()) {
            vertexData.applyToMesh(this);
        }
        let material = await MaterialLoader.instance.get("red");
        if (material && !this.isDisposed()) {
            this.material = material;
        }
    }
    destroy() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
    _collide(dt) {
        this._displacementRay.length = this.shotSpeed * dt;
        /*
        for (let i = 0; i < SpaceShipControler.Instances.length; i++) {
            let spaceship = SpaceShipControler.Instances[i].spaceShip;
            if (spaceship.controler.team !== this.shooter.controler.team) {
                let hitInfo = this._displacementRay.intersectsMesh(spaceship.shield, false);
                if (hitInfo.hit) {
                    return spaceship;
                }
            }
        }
        for (let i = 0; i < Spawner.Instances.length; i++) {
            let spawner = Spawner.Instances[i];
            if (spawner.team !== this.shooter.controler.team) {
                let hitInfo = this._displacementRay.intersectsMesh(spawner, false);
                if (hitInfo.hit) {
                    ScreenLoger.instance.log("!!!");
                    return spawner;
                }
            }
        }
        */
        return undefined;
    }
}
class RepairDrone extends BABYLON.TransformNode {
    constructor(spaceship) {
        super("Repair-Drone", spaceship.getScene());
        this.spaceship = spaceship;
        this.basePosition = new BABYLON.Vector3(0, 1, 0);
        this._speed = 0;
        this.cooldown = 10;
        this._basedTime = 5;
        this.repairStepsMax = 4;
        this.healPower = 3;
        this._kFold = 0;
        this._fold = () => {
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
        };
        this._kUnFold = 0;
        this._unFold = () => {
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
        };
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        spaceship.onDestroyObservable.add(() => {
            this.destroy();
        });
    }
    static easeOutElastic(t) {
        let p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
    destroy() {
        this.dispose();
        //this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }
    async initialize(baseColor, detailColor) {
        this.container = new BABYLON.TransformNode("container", this.getScene());
        this.container.parent = this;
        return new Promise((resolve) => {
            BABYLON.SceneLoader.ImportMesh("", "./datas/models/repair-drone.babylon", "", this.getScene(), (meshes) => {
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
                        //ScreenLoger.instance.log(mesh.name);
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
                //this._isBased = true;
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
                plane.dispose(); // free memory
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
                    particle.velocity.y += gravity; // apply gravity to y
                    (particle.position).addInPlace(particle.velocity); // update particle new position
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
                //this.getScene().onBeforeRenderObservable.add(this._update);
                //this.repairCycle();
                //ScreenLoger.instance.log("RepairDrone initialized.");
                resolve();
            });
        });
    }
    /*
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
    */
    fold() {
        this._kFold = 0;
        this.getScene().onBeforeRenderObservable.add(this._fold);
    }
    unFold() {
        this._kUnFold = 0;
        this.getScene().onBeforeRenderObservable.add(this._unFold);
    }
}
RepairDrone.BodyBottomFoldPosition = new BABYLON.Vector3(0, 0.095, 0);
RepairDrone.AntennaFoldScaling = new BABYLON.Vector3(0, 0, 0);
RepairDrone.ArmLFoldScaling = new BABYLON.Vector3(0, 0, 0);
RepairDrone.ArmRFoldScaling = new BABYLON.Vector3(0, 0, 0);
RepairDrone.WingLFoldRotation = new BABYLON.Vector3(0, -1.22, 0);
RepairDrone.WingRFoldRotation = new BABYLON.Vector3(0, 1.22, 0);
RepairDrone.BodyBottomUnFoldPosition = new BABYLON.Vector3(0, 0, 0);
RepairDrone.AntennaUnFoldScaling = new BABYLON.Vector3(1, 1, 1);
RepairDrone.ArmLUnFoldScaling = new BABYLON.Vector3(1, 1, 1);
RepairDrone.ArmRUnFoldScaling = new BABYLON.Vector3(1, 1, 1);
RepairDrone.WingLUnFoldRotation = new BABYLON.Vector3(0, 0, 0);
RepairDrone.WingRUnFoldRotation = new BABYLON.Vector3(0, 0, 0);
class Shield extends BABYLON.Mesh {
    constructor(spaceShip) {
        super(spaceShip.name + "-Shield", spaceShip.getScene());
        this._spaceShip = spaceShip;
        this.layerMask = 1;
    }
    initialize() {
        let template = BABYLON.MeshBuilder.CreateSphere("template", {
            diameterX: 6,
            diameterY: 3,
            diameterZ: 6,
            segments: 12
        }, this._spaceShip.scene);
        let data = BABYLON.VertexData.ExtractFromMesh(template);
        data.applyToMesh(this);
        template.dispose();
        let shieldMaterial = new ShieldMaterial(this.name, this.getScene());
        shieldMaterial.color = new BABYLON.Color4(0.13, 0.52, 0.80, 1);
        shieldMaterial.tex = new BABYLON.Texture("./datas/white-front-gradient.png", this._spaceShip.scene);
        shieldMaterial.noiseAmplitude = 0.05;
        shieldMaterial.noiseFrequency = 16;
        this.material = shieldMaterial;
    }
    flashAt(position, space = BABYLON.Space.LOCAL, speed = 0.2) {
        if (this.material instanceof ShieldMaterial) {
            if (space === BABYLON.Space.WORLD) {
                let worldToLocal = BABYLON.Matrix.Invert(this.getWorldMatrix());
                BABYLON.Vector3.TransformCoordinatesToRef(position, worldToLocal, position);
            }
            this.material.flashAt(position, speed);
        }
    }
}
class Flash {
    constructor() {
        this.source = BABYLON.Vector3.Zero();
        this.distance = 100;
        this.speed = 0.01;
        this.resetLimit = 10;
    }
}
class ShieldMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, "shield", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection"],
            needAlphaBlending: true
        });
        this._flash1 = new Flash();
        this.backFaceCulling = false;
        this.color = new BABYLON.Color4(1, 1, 1, 1);
        this.tex = new BABYLON.Texture("./datas/shield.png", this.getScene());
        this.length = 0.5;
        this.noiseFrequency = 1;
        this.noiseAmplitude = 0;
        this.fresnelBias = 2;
        this.fresnelPower = 64;
        this.fadingDistance = 0;
        this.getScene().registerBeforeRender(() => {
            this._flash1.distance += this._flash1.speed;
            this.setVector3("source1", this._flash1.source);
            this.setFloat("sourceDist1", this._flash1.distance);
            this.setVector3("cameraPosition", scene.activeCamera.position);
        });
    }
    get color() {
        return this._color;
    }
    set color(v) {
        this._color = v;
        this.setColor4("color", this._color);
    }
    get length() {
        return this._length;
    }
    set length(v) {
        this._length = v;
        this.setFloat("length", this._length);
    }
    get tex() {
        return this._tex;
    }
    set tex(v) {
        this._tex = v;
        this.setTexture("tex", this._tex);
    }
    get noiseAmplitude() {
        return this._noiseAmplitude;
    }
    set noiseAmplitude(v) {
        this._noiseAmplitude = v;
        this.setFloat("noiseAmplitude", this._noiseAmplitude);
    }
    get noiseFrequency() {
        return this._noiseFrequency;
    }
    set noiseFrequency(v) {
        this._noiseFrequency = v;
        this.setFloat("noiseFrequency", this._noiseFrequency);
    }
    get fresnelBias() {
        return this._fresnelBias;
    }
    set fresnelBias(v) {
        this._fresnelBias = v;
        this.setFloat("fresnelBias", this._fresnelBias);
    }
    get fresnelPower() {
        return this._fresnelPower;
    }
    set fresnelPower(v) {
        this._fresnelPower = v;
        this.setFloat("fresnelPower", this._fresnelPower);
    }
    get fadingDistance() {
        return this._fadingDistance;
    }
    set fadingDistance(v) {
        this._fadingDistance = v;
        this.setFloat("fadingDistance", this._fadingDistance);
    }
    flashAt(position, speed) {
        if (this._flash1.distance > this._flash1.resetLimit) {
            this._flash1.distance = 0.01;
            this._flash1.source.copyFrom(position);
            this._flash1.speed = speed;
        }
    }
}
class SpaceMath {
    static ProjectPerpendicularAt(v, at) {
        let p = BABYLON.Vector3.Zero();
        let k = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    }
    static Angle(from, to) {
        let pFrom = BABYLON.Vector3.Normalize(from);
        let pTo = BABYLON.Vector3.Normalize(to);
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }
    static AngleFromToAround(from, to, around) {
        let pFrom = SpaceMath.ProjectPerpendicularAt(from, around).normalize();
        let pTo = SpaceMath.ProjectPerpendicularAt(to, around).normalize();
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
        }
        return angle;
    }
    static CatmullRomPath(path) {
        let interpolatedPoints = [];
        for (let i = 0; i < path.length; i++) {
            let p0 = path[(i - 1 + path.length) % path.length];
            let p1 = path[i];
            let p2 = path[(i + 1) % path.length];
            let p3 = path[(i + 2) % path.length];
            interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
        }
        for (let i = 0; i < interpolatedPoints.length; i++) {
            path.splice(2 * i + 1, 0, interpolatedPoints[i]);
        }
    }
}
class SvgUtils {
    static lineFromToPolar(a1, r1, a2, r2) {
        a1 *= Math.PI / 180;
        a2 *= Math.PI / 180;
        let x1 = (Math.cos(a1) * r1).toFixed(0);
        let y1 = (-Math.sin(a1) * r1).toFixed(0);
        let x2 = (Math.cos(a2) * r2).toFixed(0);
        let y2 = (-Math.sin(a2) * r2).toFixed(0);
        return "M " + x1 + " " + y1 + " L " + x2 + " " + y2 + " ";
    }
    static lineToPolar(a, r) {
        a *= Math.PI / 180;
        let x = (Math.cos(a) * r).toFixed(0);
        let y = (-Math.sin(a) * r).toFixed(0);
        return "L " + x + " " + y + " ";
    }
    static drawArc(fromA, toA, r, insertFirstPoint = true, clockwise = false) {
        fromA *= Math.PI / 180;
        toA *= Math.PI / 180;
        while (fromA < 0) {
            fromA += 2 * Math.PI;
        }
        while (fromA >= 2 * Math.PI) {
            fromA -= 2 * Math.PI;
        }
        while (toA < 0) {
            toA += 2 * Math.PI;
        }
        while (toA >= 2 * Math.PI) {
            toA -= 2 * Math.PI;
        }
        let largeCircle = "0";
        if (!clockwise) {
            if (toA > fromA) {
                if (toA - fromA > Math.PI) {
                    largeCircle = "1";
                }
            }
            else if (toA < fromA) {
                if (fromA - toA < Math.PI) {
                    largeCircle = "1";
                }
            }
        }
        let x0 = (Math.cos(fromA) * r).toFixed(0);
        let y0 = (-Math.sin(fromA) * r).toFixed(0);
        let x1 = (Math.cos(toA) * r).toFixed(0);
        let y1 = (-Math.sin(toA) * r).toFixed(0);
        let arc = "";
        if (insertFirstPoint) {
            arc += "M " + x0 + " " + y0 + " ";
        }
        arc += "A " + r.toFixed(0) + " " + r.toFixed(0) + " 0 " + largeCircle + " " + (clockwise ? "1" : "0") + " " + x1 + " " + y1 + " ";
        return arc;
    }
}
class TrailMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, "trail", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["projection", "view", "world", "worldView", "worldViewProjection"],
            needAlphaBlending: true
        });
        this._diffuseColor1 = new BABYLON.Color4(1, 1, 1, 1);
        this._diffuseColor2 = new BABYLON.Color4(1, 1, 1, 1);
        this.getScene().registerBeforeRender(() => {
            this.setFloat("alpha", this.alpha);
            this.setVector3("cameraPosition", scene.activeCamera.position);
        });
    }
    get diffuseColor1() {
        return this._diffuseColor1;
    }
    set diffuseColor1(v) {
        this._diffuseColor1 = v;
        this.setColor4("diffuseColor1", this._diffuseColor1);
    }
    get diffuseColor2() {
        return this._diffuseColor2;
    }
    set diffuseColor2(v) {
        this._diffuseColor2 = v;
        this.setColor4("diffuseColor2", this._diffuseColor2);
    }
}
class TrailMesh extends BABYLON.Mesh {
    constructor(name, generator, scene, diameter = 1, length = 60) {
        super(name, scene);
        this._sectionPolygonPointsCount = 4;
        this._update = () => {
            let positions = this.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            let normals = this.getVerticesData(BABYLON.VertexBuffer.NormalKind);
            for (let i = 3 * this._sectionPolygonPointsCount; i < positions.length; i++) {
                positions[i - 3 * this._sectionPolygonPointsCount] = positions[i] - normals[i] / this._length * this._diameter;
            }
            for (let i = 3 * this._sectionPolygonPointsCount; i < normals.length; i++) {
                normals[i - 3 * this._sectionPolygonPointsCount] = normals[i];
            }
            let l = positions.length - 3 * this._sectionPolygonPointsCount;
            let alpha = 2 * Math.PI / this._sectionPolygonPointsCount;
            for (let i = 0; i < this._sectionPolygonPointsCount; i++) {
                this._sectionVectors[i].copyFromFloats(Math.cos(i * alpha) * this._diameter, Math.sin(i * alpha) * this._diameter, 0);
                this._sectionNormalVectors[i].copyFromFloats(Math.cos(i * alpha), Math.sin(i * alpha), 0);
                BABYLON.Vector3.TransformCoordinatesToRef(this._sectionVectors[i], this._generator.getWorldMatrix(), this._sectionVectors[i]);
                BABYLON.Vector3.TransformNormalToRef(this._sectionNormalVectors[i], this._generator.getWorldMatrix(), this._sectionNormalVectors[i]);
            }
            for (let i = 0; i < this._sectionPolygonPointsCount; i++) {
                positions[l + 3 * i] = this._sectionVectors[i].x;
                positions[l + 3 * i + 1] = this._sectionVectors[i].y;
                positions[l + 3 * i + 2] = this._sectionVectors[i].z;
                normals[l + 3 * i] = this._sectionNormalVectors[i].x;
                normals[l + 3 * i + 1] = this._sectionNormalVectors[i].y;
                normals[l + 3 * i + 2] = this._sectionNormalVectors[i].z;
            }
            this.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true, false);
            this.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true, false);
        };
        this.layerMask = 1;
        this._generator = generator;
        this._diameter = diameter;
        this._length = length;
        this._sectionVectors = [];
        this._sectionNormalVectors = [];
        for (let i = 0; i < this._sectionPolygonPointsCount; i++) {
            this._sectionVectors[i] = BABYLON.Vector3.Zero();
            this._sectionNormalVectors[i] = BABYLON.Vector3.Zero();
        }
        this._createMesh();
        scene.onBeforeRenderObservable.add(this._update);
    }
    destroy() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
    foldToGenerator() {
        let positions = this.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        let generatorWorldPosition = this._generator.absolutePosition;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = generatorWorldPosition.x;
            positions[i + 1] = generatorWorldPosition.y;
            positions[i + 2] = generatorWorldPosition.z;
        }
    }
    _createMesh() {
        let data = new BABYLON.VertexData();
        let positions = [];
        let normals = [];
        let indices = [];
        let alpha = 2 * Math.PI / this._sectionPolygonPointsCount;
        for (let i = 0; i < this._sectionPolygonPointsCount; i++) {
            positions.push(Math.cos(i * alpha) * this._diameter, Math.sin(i * alpha) * this._diameter, -this._length);
            normals.push(Math.cos(i * alpha), Math.sin(i * alpha), 0);
        }
        for (let i = 1; i <= this._length; i++) {
            for (let j = 0; j < this._sectionPolygonPointsCount; j++) {
                positions.push(Math.cos(j * alpha) * this._diameter, Math.sin(j * alpha) * this._diameter, -this._length + i);
                normals.push(Math.cos(j * alpha), Math.sin(j * alpha), 0);
            }
            let l = positions.length / 3 - 2 * this._sectionPolygonPointsCount;
            for (let j = 0; j < this._sectionPolygonPointsCount - 1; j++) {
                indices.push(l + j, l + j + this._sectionPolygonPointsCount, l + j + this._sectionPolygonPointsCount + 1);
                indices.push(l + j, l + j + this._sectionPolygonPointsCount + 1, l + j + 1);
            }
            indices.push(l + this._sectionPolygonPointsCount - 1, l + this._sectionPolygonPointsCount - 1 + this._sectionPolygonPointsCount, l + this._sectionPolygonPointsCount);
            indices.push(l + this._sectionPolygonPointsCount - 1, l + this._sectionPolygonPointsCount, l);
        }
        data.positions = positions;
        data.normals = normals;
        data.indices = indices;
        data.applyToMesh(this, true);
        let trailMaterial = new BABYLON.StandardMaterial("white", this.getScene());
        trailMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        trailMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        trailMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.material = trailMaterial;
    }
}
class VertexDataLoader {
    constructor(scene) {
        this.scene = scene;
        this._vertexDatas = new Map();
        VertexDataLoader.instance = this;
    }
    static clone(data) {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }
    async get(name) {
        if (this._vertexDatas.get(name)) {
            return this._vertexDatas.get(name);
        }
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // Typical action to be performed when the document is ready:
                    let rawData = JSON.parse(xhr.responseText);
                    let data = new BABYLON.VertexData();
                    data.positions = rawData.meshes[0].positions;
                    data.indices = rawData.meshes[0].indices;
                    data.normals = rawData.meshes[0].normals;
                    data.uvs = rawData.meshes[0].uvs;
                    data.colors = rawData.meshes[0].colors;
                    this._vertexDatas.set(name, data);
                    resolve(this._vertexDatas.get(name));
                }
            };
            xhr.open("get", "./datas/vertexData/" + name + ".babylon", true);
            xhr.send();
        });
    }
    async getColorized(name, baseColor, detailColor) {
        let baseColor3 = BABYLON.Color3.FromHexString(baseColor);
        let detailColor3 = BABYLON.Color3.FromHexString(detailColor);
        let data = VertexDataLoader.clone(await VertexDataLoader.instance.get(name));
        if (data.colors) {
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
        else {
            let colors = [];
            for (let i = 0; i < data.positions.length / 3; i++) {
                colors[4 * i] = baseColor3.r;
                colors[4 * i + 1] = baseColor3.g;
                colors[4 * i + 2] = baseColor3.b;
                colors[4 * i + 3] = 1;
            }
            data.colors = colors;
        }
        return data;
    }
}
class Hud {
    constructor() {
        this.initialized = false;
        this.clientWidth = 0;
        this.clientHeight = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.size = 0;
        this.reticleMaxRange = 0.65;
        this.svgPerPixel = 1;
        this.strokeWidthLite = "2";
        this.strokeWidth = "4";
        this.strokeWidthHeavy = "6";
    }
    resize(sizeInPercent) {
        if (!this.initialized) {
            return;
        }
        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.size = Math.floor(Math.min(this.clientWidth, this.clientHeight) * sizeInPercent);
        this.centerX = this.clientWidth * 0.5;
        this.centerY = this.clientHeight * 0.5;
        this.svgPerPixel = 2000 / this.size;
        [this.root, this.reticleRoot].forEach(e => {
            e.setAttribute("width", this.size.toFixed(0));
            e.setAttribute("height", this.size.toFixed(0));
            e.style.position = "fixed";
            e.style.left = ((this.clientWidth - this.size) * 0.5).toFixed(1) + "px";
            e.style.top = ((this.clientHeight - this.size) * 0.5).toFixed(1) + "px";
            e.style.width = this.size.toFixed(1) + "px";
            e.style.height = this.size.toFixed(1) + "px";
        });
    }
    initialize() {
        this.root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.root.setAttribute("id", "hud-root");
        this.root.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.root.style.overflow = "visible";
        this.root.style.pointerEvents = "none";
        document.body.appendChild(this.root);
        /*
        let debugSquare = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        debugSquare.setAttribute("x", "-1000");
        debugSquare.setAttribute("y", "-1000");
        debugSquare.setAttribute("width", "2000");
        debugSquare.setAttribute("height", "2000");
        debugSquare.setAttribute("fill", "rgba(0, 0, 0, 50%)");
        debugSquare.setAttribute("stroke", "magenta");
        debugSquare.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(debugSquare);
        */
        let outterRing = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let outterRingD = SvgUtils.drawArc(30, 60, 820, true);
        outterRingD += SvgUtils.drawArc(30, 100, 850, true);
        outterRingD += SvgUtils.lineToPolar(100, 820);
        outterRingD += SvgUtils.drawArc(100, 135, 820, false);
        outterRingD += SvgUtils.drawArc(45, 110, 880, true);
        outterRingD += SvgUtils.lineToPolar(110, 850);
        outterRingD += SvgUtils.drawArc(110, 150, 850, false);
        outterRingD += SvgUtils.drawArc(80, 120, 910, true);
        outterRingD += SvgUtils.lineToPolar(120, 880);
        outterRingD += SvgUtils.drawArc(120, 150, 880, false);
        outterRingD += SvgUtils.drawArc(210, 240, 820, true);
        outterRingD += SvgUtils.drawArc(210, 280, 850, true);
        outterRingD += SvgUtils.lineToPolar(280, 820);
        outterRingD += SvgUtils.drawArc(280, 315, 820, false);
        outterRingD += SvgUtils.drawArc(225, 290, 880, true);
        outterRingD += SvgUtils.lineToPolar(290, 850);
        outterRingD += SvgUtils.drawArc(290, 330, 850, false);
        outterRingD += SvgUtils.drawArc(260, 300, 910, true);
        outterRingD += SvgUtils.lineToPolar(300, 880);
        outterRingD += SvgUtils.drawArc(300, 330, 880, false);
        outterRing.setAttribute("d", outterRingD);
        outterRing.setAttribute("fill", "none");
        outterRing.setAttribute("stroke", "white");
        outterRing.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(outterRing);
        this.rightGaugeForwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeForwardValueD = SvgUtils.drawArc(340, 30, 770, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(30, 930);
        rightGaugeForwardValueD += SvgUtils.drawArc(30, 340, 930, false, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
        this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
        this.rightGaugeForwardValue.setAttribute("fill", "rgba(255, 127, 0, 50%)");
        this.rightGaugeForwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeForwardValue);
        this.rightGaugeBackwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeBackwardValueD = SvgUtils.drawArc(330, 340, 770, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 930);
        rightGaugeBackwardValueD += SvgUtils.drawArc(340, 330, 930, false, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(330, 770);
        this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
        this.rightGaugeBackwardValue.setAttribute("fill", "rgba(0, 127, 255, 50%)");
        this.rightGaugeBackwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeBackwardValue);
        let rightGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeD = SvgUtils.drawArc(330, 30, 770, true);
        rightGaugeD += SvgUtils.lineToPolar(30, 930);
        rightGaugeD += SvgUtils.drawArc(30, 330, 930, false, true);
        rightGaugeD += SvgUtils.lineToPolar(330, 770);
        rightGaugeD += SvgUtils.lineFromToPolar(340, 770, 340, 930);
        rightGauge.setAttribute("d", rightGaugeD);
        rightGauge.setAttribute("fill", "none");
        rightGauge.setAttribute("stroke", "white");
        rightGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(rightGauge);
        let rightGaugeGraduations = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeGraduationsD = "";
        for (let i = 1; i < 12; i++) {
            let a = 330 + i * 5;
            rightGaugeGraduationsD += SvgUtils.lineFromToPolar(a, 880, a, 930);
        }
        rightGaugeGraduations.setAttribute("d", rightGaugeGraduationsD);
        rightGaugeGraduations.setAttribute("fill", "none");
        rightGaugeGraduations.setAttribute("stroke", "white");
        rightGaugeGraduations.setAttribute("stroke-width", this.strokeWidthLite);
        this.root.appendChild(rightGaugeGraduations);
        this.rightGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeCursorD = SvgUtils.drawArc(1, 359, 970, true, true);
        rightGaugeCursorD += SvgUtils.lineToPolar(0, 940);
        rightGaugeCursorD += SvgUtils.lineToPolar(1, 970);
        this.rightGaugeCursor.setAttribute("d", rightGaugeCursorD);
        this.rightGaugeCursor.setAttribute("fill", "none");
        this.rightGaugeCursor.setAttribute("stroke", "white");
        this.rightGaugeCursor.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(this.rightGaugeCursor);
        let leftGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let leftGaugeD = SvgUtils.drawArc(150, 210, 770, true);
        leftGaugeD += SvgUtils.lineToPolar(210, 930);
        leftGaugeD += SvgUtils.drawArc(210, 150, 930, false, true);
        leftGaugeD += SvgUtils.lineToPolar(150, 770);
        leftGauge.setAttribute("d", leftGaugeD);
        leftGauge.setAttribute("fill", "none");
        leftGauge.setAttribute("stroke", "white");
        leftGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(leftGauge);
        this.reticleRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.reticleRoot.setAttribute("id", "hud-target-root");
        this.reticleRoot.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.reticleRoot.style.overflow = "visible";
        this.reticleRoot.style.pointerEvents = "none";
        document.body.appendChild(this.reticleRoot);
        /*
        let debugSquare2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        debugSquare2.setAttribute("x", "-1000");
        debugSquare2.setAttribute("y", "-1000");
        debugSquare2.setAttribute("width", "2000");
        debugSquare2.setAttribute("height", "2000");
        debugSquare2.setAttribute("fill", "rgba(255, 0, 255, 50%)");
        this.reticleRoot.appendChild(debugSquare2);
        */
        let reticle = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let reticleD = SvgUtils.drawArc(300, 60, 100, true) + SvgUtils.drawArc(120, 240, 100, true);
        reticle.setAttribute("d", reticleD);
        reticle.setAttribute("fill", "none");
        reticle.setAttribute("stroke", "white");
        reticle.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticle);
        let reticleArmLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmLeft.setAttribute("x1", "0");
        reticleArmLeft.setAttribute("y1", "0");
        reticleArmLeft.setAttribute("x2", "-300");
        reticleArmLeft.setAttribute("y2", "0");
        reticleArmLeft.setAttribute("fill", "none");
        reticleArmLeft.setAttribute("stroke", "white");
        reticleArmLeft.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleArmLeft);
        let reticleArmRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmRight.setAttribute("x1", "0");
        reticleArmRight.setAttribute("y1", "0");
        reticleArmRight.setAttribute("x2", "300");
        reticleArmRight.setAttribute("y2", "0");
        reticleArmRight.setAttribute("fill", "none");
        reticleArmRight.setAttribute("stroke", "white");
        reticleArmRight.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleArmRight);
        let reticleArmBottom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmBottom.setAttribute("x1", "0");
        reticleArmBottom.setAttribute("y1", "0");
        reticleArmBottom.setAttribute("x2", "0");
        reticleArmBottom.setAttribute("y2", "200");
        reticleArmBottom.setAttribute("fill", "none");
        reticleArmBottom.setAttribute("stroke", "white");
        reticleArmBottom.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleArmBottom);
        let reticleEnd = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let reticleEndD = SvgUtils.drawArc(350, 10, 300, true);
        reticleEndD += SvgUtils.drawArc(355, 5, 200, true);
        reticleEndD += SvgUtils.drawArc(170, 190, 300, true);
        reticleEndD += SvgUtils.drawArc(175, 185, 200, true);
        reticleEndD += SvgUtils.drawArc(265, 275, 200, true);
        reticleEndD += SvgUtils.drawArc(265, 275, 100, true);
        reticleEnd.setAttribute("d", reticleEndD);
        reticleEnd.setAttribute("fill", "none");
        reticleEnd.setAttribute("stroke", "white");
        reticleEnd.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleEnd);
        this.initialized = true;
    }
    setReticlePos(x, y) {
        let dx = x * this.size * 0.5 * this.reticleMaxRange;
        let dy = y * this.size * 0.5 * this.reticleMaxRange;
        this.reticleRoot.style.left = ((this.clientWidth - this.size) * 0.5 + dx).toFixed(1) + "px";
        this.reticleRoot.style.top = ((this.clientHeight - this.size) * 0.5 + dy).toFixed(1) + "px";
        this.reticleRoot.style.clipPath = "circle(" + (this.size * 0.5 * this.reticleMaxRange + (100 + 4) / this.svgPerPixel).toFixed(0) + "px at " + (-dx + this.size * 0.5).toFixed(1) + "px " + (-dy + this.size * 0.5).toFixed(1) + "px)";
    }
    setTargetSpeed(s) {
        if (s > 0) {
            this.rightGaugeForwardValue.setAttribute("visibility", "visible");
            let a = 340 * (1 - s) + 390 * s;
            let rightGaugeForwardValueD = SvgUtils.drawArc(340, a, 770, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(a, 930);
            rightGaugeForwardValueD += SvgUtils.drawArc(a, 340, 930, false, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
            this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeForwardValue.setAttribute("visibility", "hidden");
        }
        if (s < 0) {
            this.rightGaugeBackwardValue.setAttribute("visibility", "visible");
            s = -s;
            let a = 340 * (1 - s) + 330 * s;
            let rightGaugeBackwardValueD = SvgUtils.drawArc(a, 340, 770, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 930);
            rightGaugeBackwardValueD += SvgUtils.drawArc(340, a, 930, false, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(a, 770);
            this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeBackwardValue.setAttribute("visibility", "hidden");
        }
        if (s === 0) {
            this.rightGaugeCursor.setAttribute("transform", "rotate(-340 0 0)");
        }
    }
}
class PlayerControler {
    constructor() {
        this._throttleSensitivity = 2;
        this._throttleInput = false;
        this._brakeInput = false;
        this._rollLeftInput = false;
        this._rollRightInput = false;
        this._shootInput = false;
        this._freezeInput = 0;
        this._targetSpeed = 0;
        this._update = () => {
            let dt = this.engine.getDeltaTime() / 1000;
            let needThrottleUpdate = false;
            let previousTargetSpeed = this._targetSpeed;
            if (this._freezeInput > 0) {
                this._freezeInput -= dt;
            }
            if (this._freezeInput <= 0) {
                if (this._throttleInput) {
                    if (this._targetSpeed >= 0) {
                        this._targetSpeed += dt / this._throttleSensitivity;
                    }
                    else {
                        this._targetSpeed += dt / this._throttleSensitivity * 2;
                    }
                    needThrottleUpdate = true;
                }
                else if (this._brakeInput) {
                    if (this._targetSpeed > 0) {
                        this._targetSpeed -= dt / this._throttleSensitivity;
                    }
                    else {
                        this._targetSpeed -= dt / this._throttleSensitivity * 2;
                    }
                    needThrottleUpdate = true;
                }
            }
            let rollInput = 0;
            if (this._rollLeftInput) {
                rollInput--;
            }
            if (this._rollRightInput) {
                rollInput++;
            }
            this.spaceship.rollInput = rollInput;
            if (this._shootInput) {
                this.spaceship.shoot(BABYLON.Vector3.Forward());
            }
            if (needThrottleUpdate) {
                if (previousTargetSpeed * this._targetSpeed < 0) {
                    this._freezeInput = 0;
                    this._targetSpeed = 0;
                    this._freezeInput = 0.3;
                }
                this._targetSpeed = Math.min(1, Math.max(-1, this._targetSpeed));
                this.hud.setTargetSpeed(this._targetSpeed);
                this.spaceship.forwardInput = this._targetSpeed;
            }
        };
        this._onKeyDown = (e) => {
            if (e.code === "KeyW") {
                this._throttleInput = true;
            }
            if (e.code === "KeyS") {
                this._brakeInput = true;
            }
            if (e.code === "KeyA") {
                this._rollLeftInput = true;
            }
            if (e.code === "KeyD") {
                this._rollRightInput = true;
            }
        };
        this._onKeyUp = (e) => {
            if (e.code === "KeyW") {
                this._throttleInput = false;
            }
            if (e.code === "KeyS") {
                this._brakeInput = false;
            }
            if (e.code === "KeyA") {
                this._rollLeftInput = false;
            }
            if (e.code === "KeyD") {
                this._rollRightInput = false;
            }
        };
        this._onPointerDown = (e) => {
            if (e.button === 0) {
                this._shootInput = true;
            }
        };
        this._onPointerUp = (e) => {
            if (e.button === 0) {
                this._shootInput = false;
            }
        };
        this._onPointerMove = (e) => {
            let x = (e.clientX - this.hud.centerX) / (this.hud.size * 0.5 * this.hud.reticleMaxRange);
            let y = (e.clientY - this.hud.centerY) / (this.hud.size * 0.5 * this.hud.reticleMaxRange);
            let l = Math.sqrt(x * x + y * y);
            if (l > 1) {
                x /= l;
                y /= l;
            }
            this.hud.setReticlePos(x, y);
            this.spaceship.pitchInput = y;
            this.spaceship.yawInput = x;
        };
    }
    get spaceship() {
        return this._spaceship;
    }
    initialize(hud, scene, canvas) {
        this.hud = hud;
        this.scene = scene;
        this.engine = this.scene.getEngine();
        this.canvas = canvas;
        this.canvas.addEventListener("pointerdown", this._onPointerDown);
        this.canvas.addEventListener("pointerup", this._onPointerUp);
        this.canvas.addEventListener("pointermove", this._onPointerMove);
        this.canvas.addEventListener("keydown", this._onKeyDown);
        this.canvas.addEventListener("keyup", this._onKeyUp);
        this.scene.onBeforeRenderObservable.add(this._update);
        this.hud.setTargetSpeed(this._targetSpeed);
        this.hud.setReticlePos(0, 0);
    }
    setSpaceship(spaceship) {
        if (spaceship != this._spaceship) {
            if (this._spaceship) {
                this._spaceship.setControler(undefined);
            }
            this._spaceship = spaceship;
            if (spaceship) {
                this._spaceship.setControler(this);
            }
        }
    }
}
class SpaceshipCamera extends BABYLON.FreeCamera {
    constructor(scene) {
        super("spaceship-camera", BABYLON.Vector3.Zero(), scene);
        this._targetCameraPosition = BABYLON.Vector3.Zero();
        this._update = () => {
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
        };
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    get engine() {
        return this.scene.getEngine();
    }
    get scene() {
        return this._scene;
    }
}
/// <reference path="../../lib/babylon.material.d.ts"/>
var ISquadRole;
(function (ISquadRole) {
    ISquadRole[ISquadRole["Leader"] = 0] = "Leader";
    ISquadRole[ISquadRole["WingMan"] = 1] = "WingMan";
    ISquadRole[ISquadRole["Default"] = 2] = "Default";
})(ISquadRole || (ISquadRole = {}));
class SpaceShipFactory {
    constructor(scene) {
        SpaceShipFactory.Scene = scene;
    }
    static get cellShadingMaterial() {
        if (!SpaceShipFactory._cellShadingMaterial) {
            SpaceShipFactory._cellShadingMaterial = new BABYLON.CellMaterial("CellMaterial", SpaceShipFactory.Scene);
            SpaceShipFactory._cellShadingMaterial.computeHighLevel = true;
        }
        return SpaceShipFactory._cellShadingMaterial;
    }
    static baseColorFromTeam(team) {
        return "#ffffff";
    }
    static detailColorFromTeam(team) {
        if (team === 0) {
            return "#0000ff";
        }
        if (team === 1) {
            return "#ff0000";
        }
        return "#00ff00";
    }
    static async AddSpaceShipToScene(data, scene) {
        let spaceshipData = await SpaceshipLoader.instance.get(data.url);
        let spaceShip = new Spaceship(spaceshipData, scene);
        spaceShip.name = data.name;
        await spaceShip.initialize(spaceshipData.model, SpaceShipFactory.baseColorFromTeam(data.team), SpaceShipFactory.detailColorFromTeam(data.team));
        if (isFinite(data.x) && isFinite(data.y) && isFinite(data.z)) {
            spaceShip.position.copyFromFloats(data.x, data.y, data.z);
        }
        if (isFinite(data.rx) && isFinite(data.ry) && isFinite(data.rz) && isFinite(data.rw)) {
            spaceShip.rotationQuaternion.copyFromFloats(data.rx, data.ry, data.rz, data.rw);
        }
        requestAnimationFrame(() => {
            spaceShip.trailMeshes.forEach((t) => {
                t.foldToGenerator();
            });
        });
        return spaceShip;
    }
    static async LoadSpaceshipPart(part, scene, baseColor, detailColor) {
        let baseColor3 = BABYLON.Color3.FromHexString(baseColor);
        let detailColor3 = BABYLON.Color3.FromHexString(detailColor);
        let data = VertexDataLoader.clone(await VertexDataLoader.instance.get(part));
        if (data.colors) {
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
        let m = new BABYLON.Mesh(part, SpaceShipFactory.Scene);
        m.layerMask = 1;
        data.applyToMesh(m);
        m.material = SpaceShipFactory.cellShadingMaterial;
        return m;
    }
}
class SpaceShipSlot {
    constructor(name, pos, rot, mirror = false) {
        this.name = name;
        this.pos = pos;
        this.rot = rot;
        this.mirror = mirror;
    }
}
class SpaceShipSlots {
    constructor() {
        this._slots = new Map();
        this._slots.set("body-1", [
            new SpaceShipSlot("engine", new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, 0)),
            new SpaceShipSlot("wingL", new BABYLON.Vector3(-0.55, 0, -0.4), new BABYLON.Vector3(0, 0, 0)),
            new SpaceShipSlot("wingR", new BABYLON.Vector3(0.55, 0, -0.4), new BABYLON.Vector3(0, 0, 0), true),
            new SpaceShipSlot("drone", new BABYLON.Vector3(0, 0.7, -0.4), new BABYLON.Vector3(0, 0, 0))
        ]);
        this._slots.set("body-2", [
            new SpaceShipSlot("engine", new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, 0)),
            new SpaceShipSlot("wingL", new BABYLON.Vector3(-0.48, 0, -0.27), new BABYLON.Vector3(0, 0, 0)),
            new SpaceShipSlot("wingR", new BABYLON.Vector3(0.48, 0, -0.27), new BABYLON.Vector3(0, 0, 0), true),
            new SpaceShipSlot("drone", new BABYLON.Vector3(0, 0.6, -0.6), new BABYLON.Vector3(0, 0, 0))
        ]);
        this._slots.set("body-3", [
            new SpaceShipSlot("engine", new BABYLON.Vector3(0, 0, -0.7), new BABYLON.Vector3(0, 0, 0)),
            new SpaceShipSlot("wingL", new BABYLON.Vector3(-0.55, 0, -0.37), new BABYLON.Vector3(0, 0, 0)),
            new SpaceShipSlot("wingR", new BABYLON.Vector3(0.55, 0, -0.37), new BABYLON.Vector3(0, 0, 0), true),
            new SpaceShipSlot("drone", new BABYLON.Vector3(0, 0.9, -0.34), new BABYLON.Vector3(0, 0, 0))
        ]);
        this._slots.set("wing-1", [
            new SpaceShipSlot("weapon", new BABYLON.Vector3(-1.23, 0.06, -0.15), new BABYLON.Vector3(0, 0, 0))
        ]);
        this._slots.set("wing-2", [
            new SpaceShipSlot("weapon", new BABYLON.Vector3(-0.6, 0.12, 0), new BABYLON.Vector3(0, 0, 0.12))
        ]);
        this._slots.set("wing-3", [
            new SpaceShipSlot("weapon", new BABYLON.Vector3(-0.9, 0.05, 0.2), new BABYLON.Vector3(0, 0, Math.PI / 2))
        ]);
        this._slots.set("wing-4", [
            new SpaceShipSlot("weapon", new BABYLON.Vector3(-1.31, 0.1, 0.24), new BABYLON.Vector3(0, 0, Math.PI / 4))
        ]);
    }
    static get instance() {
        if (!SpaceShipSlots._instance) {
            SpaceShipSlots._instance = new SpaceShipSlots();
        }
        return SpaceShipSlots._instance;
    }
    static getSlot(elementName, slotName) {
        let slots = SpaceShipSlots.instance._slots.get(elementName);
        if (slots) {
            return slots.find((s) => { return s.name === slotName; });
        }
    }
}
class Spaceship extends BABYLON.Mesh {
    constructor(data, scene) {
        super("spaceship", scene);
        this.scene = scene;
        this._forwardInput = 0;
        this._enginePower = 25;
        this._frontDrag = 0.01;
        this._backDrag = 1;
        this._speed = 0;
        this._rollInput = 0;
        this._rollPower = 10;
        this._rollDrag = 0;
        this._roll = 0;
        this._yawInput = 0;
        this._yawPower = 4;
        this._yawDrag = 0.9;
        this._yaw = 0;
        this._pitchInput = 0;
        this._pitchPower = 4;
        this._pitchDrag = 0.9;
        this._pitch = 0;
        this._dt = 0;
        this._colliders = [];
        this.trailMeshes = [];
        this.isAlive = true;
        this.stamina = 50;
        this.canons = [];
        this.shootPower = 1;
        this.shootSpeed = 100;
        this.shootCoolDown = 0.3;
        this._shootCool = 0;
        this.onDestroyObservable = new BABYLON.Observable();
        this._canonNodes = [];
        this._move = () => {
            this._dt = this.getEngine().getDeltaTime() / 1000;
            BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.X, this.getWorldMatrix(), this._localX);
            BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Y, this.getWorldMatrix(), this._localY);
            BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Z, this.getWorldMatrix(), this._localZ);
            this._shootCool -= this._dt;
            this._shootCool = Math.max(0, this._shootCool);
            if (this.isAlive) {
                this._speed += this.forwardInput * this._enginePower * this._dt;
                this._yaw += this.yawInput * this._yawPower * this._dt;
                this._pitch += this.pitchInput * this._pitchPower * this._dt;
                this._roll += this.rollInput * this._rollPower * this._dt;
            }
            this._drag();
            let dZ = BABYLON.Vector3.Zero();
            dZ.copyFromFloats(this._localZ.x * this._speed * this._dt, this._localZ.y * this._speed * this._dt, this._localZ.z * this._speed * this._dt);
            this.position.addInPlace(dZ);
            BABYLON.Quaternion.RotationAxisToRef(this._localZ, -this.roll * this._dt, this._rZ);
            this._rZ.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
            BABYLON.Quaternion.RotationAxisToRef(this._localY, this.yaw * this._dt, this._rY);
            this._rY.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
            BABYLON.Quaternion.RotationAxisToRef(this._localX, this.pitch * this._dt, this._rX);
            this._rX.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
            if (this.mesh) {
                this.mesh.rotation.z = (-this.yaw + this.mesh.rotation.z) / 2;
            }
            this._collide();
        };
        this._lastCanonIndex = 0;
        this.onWoundObservable = new BABYLON.Observable();
        this.stamina = data.stamina * (0.95 + 0.1 * Math.random());
        this._enginePower = data.enginePower * (0.95 + 0.1 * Math.random());
        this._rollPower = data.rollPower * (0.95 + 0.1 * Math.random());
        this._yawPower = data.yawPower * (0.95 + 0.1 * Math.random());
        this._pitchPower = data.pitchPower * (0.95 + 0.1 * Math.random());
        this._frontDrag = data.frontDrag * (0.95 + 0.1 * Math.random());
        this._backDrag = data.backDrag * (0.95 + 0.1 * Math.random());
        this._rollDrag = data.rollDrag * (0.95 + 0.1 * Math.random());
        this._yawDrag = data.yawDrag * (0.95 + 0.1 * Math.random());
        this._pitchDrag = data.pitchDrag * (0.95 + 0.1 * Math.random());
        this.shootPower = data.shootPower * (0.95 + 0.1 * Math.random());
        this.shootCoolDown = data.shootCooldown * (0.95 + 0.1 * Math.random());
        this.shootSpeed = data.shootSpeed * (0.95 + 0.1 * Math.random());
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
            new TrailMesh("Test", this.wingTipLeft, this.scene, 0.07, 60),
            new TrailMesh("Test", this.wingTipRight, this.scene, 0.07, 60)
        ];
        this.hitPoint = this.stamina;
        this.createColliders();
        scene.onBeforeRenderObservable.add(this._move);
    }
    get forwardInput() {
        return this._forwardInput;
    }
    set forwardInput(v) {
        if (isFinite(v)) {
            this._forwardInput = BABYLON.Scalar.Clamp(v, -1, 1);
        }
    }
    get speed() {
        return this._speed;
    }
    get rollInput() {
        return this._rollInput;
    }
    set rollInput(v) {
        if (isFinite(v)) {
            this._rollInput = BABYLON.Scalar.Clamp(v, -1, 1);
        }
    }
    get roll() {
        return this._roll;
    }
    get yawInput() {
        return this._yawInput;
    }
    set yawInput(v) {
        if (isFinite(v)) {
            this._yawInput = BABYLON.Scalar.Clamp(v, -1, 1);
        }
    }
    get yaw() {
        return this._yaw;
    }
    get pitchInput() {
        return this._pitchInput;
    }
    set pitchInput(v) {
        if (isFinite(v)) {
            this._pitchInput = BABYLON.Scalar.Clamp(v, -1, 1);
        }
    }
    get pitch() {
        return this._pitch;
    }
    get localX() {
        return this._localX;
    }
    get localY() {
        return this._localY;
    }
    get localZ() {
        return this._localZ;
    }
    get controler() {
        return this._controler;
    }
    setControler(controler) {
        if (controler != this._controler) {
            if (this._controler) {
                this._controler.setSpaceship(undefined);
            }
            this._controler = controler;
            if (controler) {
                this._controler.setSpaceship(this);
            }
        }
    }
    destroy() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._move);
        this.dispose();
        for (let i = 0; i < this.trailMeshes.length; i++) {
            this.trailMeshes[i].destroy();
        }
        this.shootFlashParticle.destroy();
        this.onDestroyObservable.notifyObservers(undefined);
    }
    async initialize(model, baseColor, detailColor) {
        let meshes = [];
        await Spaceship._InitializeRecursively(this.scene, model, baseColor, detailColor, this, meshes);
        let invWorldMatrix = this.computeWorldMatrix(true).clone().invert();
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].computeWorldMatrix(true);
        }
        for (let i = 0; i < this._canonNodes.length; i++) {
            let canonPoint = BABYLON.Vector3.Zero();
            this._canonNodes[i].computeWorldMatrix(true);
            BABYLON.Vector3.TransformCoordinatesToRef(this._canonNodes[i].absolutePosition, invWorldMatrix, canonPoint);
            this.canons.push(canonPoint);
        }
        this.mesh = BABYLON.Mesh.MergeMeshes(meshes, true);
        this.mesh.layerMask = 1;
        this.mesh.parent = this;
        this.wingTipLeft.parent = this.mesh;
        this.wingTipRight.parent = this.mesh;
        this.shield.parent = this.mesh;
        return this.mesh;
    }
    static async _InitializeRecursively(scene, elementData, baseColor, detailColor, spaceship, meshes) {
        let e = await SpaceShipFactory.LoadSpaceshipPart(elementData.name, scene, baseColor, detailColor);
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
                        let child = await Spaceship._InitializeRecursively(scene, childData, baseColor, detailColor, spaceship, meshes);
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
    createColliders() {
        this._colliders.push(Spaceship.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0.22, -0.59), 1.06));
        this._colliders.push(Spaceship.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0, 2.43), 0.75));
    }
    attachControler() {
    }
    static CenterRadiusBoundingSphere(center, radius) {
        return new BABYLON.BoundingSphere(new BABYLON.Vector3(center.x, center.y - radius, center.z), new BABYLON.Vector3(center.x, center.y + radius, center.z));
    }
    _drag() {
        this._roll = this.roll * (1 - this._rollDrag * this._dt);
        this._yaw = this.yaw * (1 - this._yawDrag * this._dt);
        this._pitch = this.pitch * (1 - this._pitchDrag * this._dt);
        let sqrForward = this.speed * this.speed;
        if (this.speed > 0) {
            this._speed -= this._frontDrag * sqrForward * this._dt;
        }
        else if (this.speed < 0) {
            this._speed += this._backDrag * sqrForward * this._dt;
        }
    }
    _updateColliders() {
        for (let i = 0; i < this._colliders.length; i++) {
            this._colliders[i]._update(this.getWorldMatrix());
        }
    }
    _collide() {
        if (this.mesh) {
            let tmpAxis = BABYLON.Vector3.Zero();
            let thisSphere = this.mesh.getBoundingInfo().boundingSphere;
            let spheres = Obstacle.SphereInstancesFromPosition(this.position);
            for (let i = 0; i < spheres.length; i++) {
                let sphere = spheres[i];
                let intersection = Intersection.MeshSphere(this.shield, sphere);
                if (intersection.intersect) {
                    let forcedDisplacement = intersection.direction.multiplyByFloats(-1, -1, -1);
                    forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(intersection.depth, intersection.depth, intersection.depth));
                    this.position.addInPlace(forcedDisplacement);
                    this.shield.flashAt(intersection.point, BABYLON.Space.WORLD);
                    return;
                }
            }
            for (let i = 0; i < Obstacle.BoxInstances.length; i++) {
                let box = Obstacle.BoxInstances[i][0][0][0];
                if (Intersection.BoxSphere(box, thisSphere, tmpAxis) > 0) {
                    for (let j = 0; j < this._colliders.length; j++) {
                        this._updateColliders();
                        let collisionDepth = Intersection.BoxSphere(box, this._colliders[j], tmpAxis);
                        if (collisionDepth > 0) {
                            let forcedDisplacement = tmpAxis.normalize();
                            forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(collisionDepth, collisionDepth, collisionDepth));
                            this.position.addInPlace(forcedDisplacement);
                            return;
                        }
                    }
                }
            }
        }
    }
    shoot(direction) {
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
    projectileDurationTo(target) {
        let dist = BABYLON.Vector3.Distance(this.position, target.position);
        return dist / this.shootSpeed;
    }
    wound(projectile) {
        if (this.isAlive) {
            this.hitPoint -= projectile.power;
            this.impactParticle.emitter = projectile.position.clone();
            this.impactParticle.manualEmitCount = 100;
            this.impactParticle.start();
            this.shield.flashAt(projectile.position, BABYLON.Space.WORLD);
            this.onWoundObservable.notifyObservers(projectile);
            if (this.hitPoint <= 0) {
                //Main.Loger.log(projectile.shooter.name + " killed " + this.name);
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
class SpaceshipLoader {
    constructor(scene) {
        this.scene = scene;
        this._spaceshipDatas = new Map();
        SpaceshipLoader.instance = this;
    }
    async get(name) {
        if (this._spaceshipDatas.get(name)) {
            return this._spaceshipDatas.get(name);
        }
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // Typical action to be performed when the document is ready:
                    let data = JSON.parse(xhr.responseText);
                    this._spaceshipDatas.set(name, data);
                    resolve(this._spaceshipDatas.get(name));
                }
            };
            xhr.open("get", "./datas/spaceships/" + name + ".json", true);
            xhr.send();
        });
    }
}
