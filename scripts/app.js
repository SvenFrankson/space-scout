var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BeaconEmiter extends BABYLON.Mesh {
    constructor(name, scene) {
        super(name, scene);
        this.activated = false;
        BeaconEmiter.Instances.push(this);
        this.mapIconId = "map-icon-" + BeaconEmiter.Instances.length;
        $("body").append("<img id='" + this.mapIconId + "' class='map-icon' src='./datas/objective-blue.png' hidden></img>");
        this.mapIcon = $("#" + this.mapIconId);
    }
    get shieldMaterial() {
        if (this.material instanceof ShieldMaterial) {
            return this.material;
        }
        return undefined;
    }
    Dispose() {
        this.mapIcon.remove();
        this.dispose();
    }
    static DisposeAll() {
        for (let i = 0; i < BeaconEmiter.Instances.length; i++) {
            let b = BeaconEmiter.Instances[i];
            b.Dispose();
        }
        BeaconEmiter.Instances = [];
        BeaconEmiter.activatedCount = 0;
    }
    initialize() {
        BABYLON.SceneLoader.ImportMesh("", "./datas/beacon-emit.babylon", "", this.getScene(), (meshes, particleSystems, skeletons) => {
            if (meshes[0] instanceof BABYLON.Mesh) {
                let data = BABYLON.VertexData.ExtractFromMesh(meshes[0]);
                data.applyToMesh(this);
                meshes[0].dispose();
                let emitMat = new ShieldMaterial(this.name + ("-mat"), this.getScene());
                emitMat.length = 2;
                emitMat.tex = new BABYLON.Texture("./datas/fading-white-stripes.png", this.getScene());
                emitMat.color.copyFromFloats(0.5, 0.5, 0.8, 1);
                emitMat.fadingDistance = 10;
                this.material = emitMat;
            }
        });
    }
    activate() {
        if (this.activated) {
            return;
        }
        this.activated = true;
        $("#" + this.mapIconId).attr("src", "./datas/objective-green.png");
        BeaconEmiter.activatedCount++;
        if (this.shieldMaterial) {
            this.shieldMaterial.flashAt(BABYLON.Vector3.Zero(), 0.1);
        }
        setInterval(() => {
            if (this.shieldMaterial) {
                this.shieldMaterial.flashAt(BABYLON.Vector3.Zero(), 0.1);
            }
        }, 3000);
    }
    static UpdateAllMapIcons() {
        BeaconEmiter.Instances.forEach((v) => {
            v.updateMapIcon(SpaceShipInputs.SSIInstances[0].spaceShip);
        });
    }
    updateMapIcon(spaceShip) {
        let w = Main.Canvas.width;
        let h = Main.Canvas.height;
        let size = Math.min(w, h);
        let relPos = this.position.subtract(spaceShip.position);
        let angularPos = SpaceMath.Angle(relPos, spaceShip.localZ) / Math.PI;
        let rollPos = SpaceMath.AngleFromToAround(spaceShip.localY, relPos, spaceShip.localZ);
        let iconPos = new BABYLON.Vector2(-Math.sin(rollPos) * angularPos, -Math.cos(rollPos) * angularPos);
        let center = size / 2 * 0.1 + size / 2 * 0.4;
        $("#" + this.mapIconId).css("width", 32);
        $("#" + this.mapIconId).css("height", 32);
        $("#" + this.mapIconId).css("top", center + size / 2 * 0.4 * iconPos.y - 16);
        $("#" + this.mapIconId).css("left", center + size / 2 * 0.4 * iconPos.x - 16);
    }
}
BeaconEmiter.Instances = [];
BeaconEmiter.activatedCount = 0;
class Comlink {
    static Display(sender, line, hexColor = "ffffff", delay = 10000) {
        let id = "com-link-line-" + Comlink._lineCount;
        Comlink._lineCount++;
        $("#com-link").append("<div id='" + id + "' class='row'>" +
            "<div class='col-xs-2 no-click'>[" + sender + "]</div>" +
            "<div class='col-xs-10 no-click'>" + line + "</div>" +
            "</div>");
        $("#" + id).css("color", "#" + hexColor);
        setTimeout(() => {
            $("#" + id).remove();
        }, delay);
        while ($("#com-link").children().length > 4) {
            $("#com-link").children().get(0).remove();
        }
    }
}
Comlink._lineCount = 0;
class Config {
    static ProdConfig() {
        Config.tmpPlayerSpeed = 10;
        Config.activationSqrRange = 100;
        Config.sceneLoaderDelay = 10;
    }
    static DevConfig() {
        Config.tmpPlayerSpeed = 20;
        Config.activationSqrRange = 100;
        Config.sceneLoaderDelay = 0;
    }
}
Config.DevConfig();
class Dialogs {
    static randomNeutralCommand() {
        let index = Math.floor(Math.random() * Dialogs.neutralCommands.length);
        return Dialogs.neutralCommands[index];
    }
}
Dialogs.neutralCommands = [
    "- Copy that.",
    "- Loud and clear, I'm on it.",
    "- I'll check it for you captain.",
    "- Affirmative.",
    "- Roger. Wilco."
];
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
/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/jquery.d.ts"/>
var State;
(function (State) {
    State[State["Menu"] = 0] = "Menu";
    State[State["Ready"] = 1] = "Ready";
    State[State["Game"] = 2] = "Game";
    State[State["GameOver"] = 3] = "GameOver";
})(State || (State = {}));
;
class Main {
    constructor(canvasElement) {
        Main.Canvas = document.getElementById(canvasElement);
        Main.Canvas.addEventListener("click", () => {
            Main.OnClick();
        });
        Main.Engine = new BABYLON.Engine(Main.Canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    static get State() {
        return Main._state;
    }
    static set State(v) {
        Main._state = v;
    }
    createScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        this.resize();
        Main.GuiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("hud");
        let sun = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.36, 0.06, -0.96), Main.Scene);
        sun.intensity = 0.8;
        let cloud = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(0.07, 0.66, 0.75), Main.Scene);
        cloud.intensity = 0.3;
        cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
        cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);
        Main.MenuCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
        Main.Scene.activeCamera = Main.MenuCamera;
        Main.MenuCamera.setPosition(new BABYLON.Vector3(-160, 80, -160));
        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, Main.Scene);
        skybox.rotation.y = Math.PI / 2;
        skybox.infiniteDistance = true;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./datas/skyboxes/green-nebulae", Main.Scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        new VertexDataLoader(Main.Scene);
        new MaterialLoader(Main.Scene);
        new SpaceshipLoader(Main.Scene);
    }
    animate() {
        Main.Engine.runRenderLoop(() => {
            BeaconEmiter.UpdateAllMapIcons();
            Main.Scene.render();
        });
        window.addEventListener("resize", () => {
            this.resize();
        });
    }
    resize() {
        Main.Engine.resize();
        Layout.Resize();
    }
    static OnClick() {
        if (Main.State === State.Ready) {
            Main.Play();
        }
    }
    static Menu() {
        Main.State = State.Menu;
        Loader.UnloadScene();
        if (Main.Level) {
            Main.Level.UnLoadLevel();
        }
        Main.TMPResetPlayer();
        Main.TMPResetWingMan();
        Main.Scene.activeCamera = Main.MenuCamera;
        Main.GameCamera.ResetPosition();
        Layout.MenuLayout();
    }
    static Play() {
        Main.State = State.Game;
        Layout.GameLayout();
        Main.Scene.activeCamera = Main.GameCamera;
        Main.Level.OnGameStart();
        Main.playStart = (new Date()).getTime();
    }
    static GameOver() {
        Main.State = State.GameOver;
        Layout.GameOverLayout();
    }
    static TMPCreatePlayer() {
        return __awaiter(this, void 0, void 0, function* () {
            let spaceshipData = yield SpaceshipLoader.instance.get("scout-2");
            Main._tmpPlayer = new SpaceShip(spaceshipData, Main.Scene);
            Main.GameCamera = new SpaceShipCamera(BABYLON.Vector3.Zero(), Main.Scene, Main._tmpPlayer);
            Main.GameCamera.attachSpaceShipControl(Main.Canvas);
            Main.GameCamera.setEnabled(false);
            Main._tmpPlayer.initialize("spaceship", () => {
                let playerControl = new SpaceShipInputs(Main._tmpPlayer, Main.Scene);
                Main._tmpPlayer.attachControler(playerControl);
                playerControl.attachControl(Main.Canvas);
            });
            new HUD(Main.Scene);
        });
    }
    static TMPResetPlayer() {
        Main._tmpPlayer.position.copyFromFloats(0, 0, 0);
        Main._tmpPlayer.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
    static TMPCreateWingMan() {
        return __awaiter(this, void 0, void 0, function* () {
            return SpaceShipFactory.AddSpaceShipToScene({
                name: "Voyoslov",
                url: "scout-1",
                x: -100 + 200 * Math.random(), y: -50 + 100 * Math.random(), z: 200,
                team: 0,
                role: ISquadRole.Default
            }, Main.Scene);
        });
    }
    static TMPResetWingMan() {
        Main._tmpWingMan.position.copyFromFloats(0, 0, 30);
        Main._tmpWingMan.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
    static TMPCreateRogue() {
        return __awaiter(this, void 0, void 0, function* () {
            return SpaceShipFactory.AddSpaceShipToScene({
                name: "Rogue",
                url: "arrow-1",
                x: -100 + 200 * Math.random(), y: -50 + 100 * Math.random(), z: 200,
                team: 1,
                role: ISquadRole.Default
            }, Main.Scene);
        });
    }
    static TMPResetRogue() {
        Main._tmpRogue.position.copyFromFloats(0, 0, 100);
        Main._tmpRogue.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
}
Main._state = State.Menu;
Main.playStart = 0;
window.addEventListener("DOMContentLoaded", () => __awaiter(this, void 0, void 0, function* () {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
    Menu.RegisterToUI();
    //Intro.RunIntro();
    yield Main.TMPCreatePlayer();
    yield Main.TMPCreateWingMan();
    yield Main.TMPCreateWingMan();
    yield Main.TMPCreateWingMan();
    yield Main.TMPCreateWingMan();
    yield Main.TMPCreateRogue();
    yield Main.TMPCreateRogue();
    yield Main.TMPCreateRogue();
    yield Main.TMPCreateRogue();
    Loader.LoadScene("level-0", Main.Scene);
}));
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
class Shield extends BABYLON.Mesh {
    constructor(spaceShip) {
        super(spaceShip.name + "-Shield", spaceShip.getScene());
        this._spaceShip = spaceShip;
    }
    initialize() {
        BABYLON.SceneLoader.ImportMesh("", "./datas/shield.babylon", "", Main.Scene, (meshes, particleSystems, skeletons) => {
            let shield = meshes[0];
            if (shield instanceof BABYLON.Mesh) {
                let data = BABYLON.VertexData.ExtractFromMesh(shield);
                data.applyToMesh(this);
                shield.dispose();
                let shieldMaterial = new ShieldMaterial(this.name, this.getScene());
                shieldMaterial.color = new BABYLON.Color4(0.13, 0.52, 0.80, 1);
                shieldMaterial.tex = new BABYLON.Texture("./datas/white-front-gradient.png", Main.Scene);
                shieldMaterial.noiseAmplitude = 0.25;
                shieldMaterial.noiseFrequency = 16;
                this.material = shieldMaterial;
            }
        });
    }
    flashAt(position, space = BABYLON.Space.LOCAL, speed = 0.1) {
        if (this.material instanceof ShieldMaterial) {
            if (space === BABYLON.Space.WORLD) {
                let worldToLocal = BABYLON.Matrix.Invert(this.getWorldMatrix());
                BABYLON.Vector3.TransformCoordinatesToRef(position, worldToLocal, position);
            }
            this.material.flashAt(position, speed);
        }
    }
}
class SpaceShipCamera extends BABYLON.FreeCamera {
    constructor(position, scene, spaceShip, smoothness, smoothnessRotation) {
        super("SpaceShipCamera", position, scene);
        this._smoothness = 16;
        this._smoothnessRotation = 8;
        this._focalLength = 100;
        this._targetPosition = BABYLON.Vector3.Zero();
        this._targetRotation = BABYLON.Quaternion.Identity();
        this._offset = new BABYLON.Vector3(0, 4, -15);
        this._offsetRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, 4 / this._focalLength);
        this.rotation.copyFromFloats(0, 0, 0);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._spaceShip = spaceShip;
        this.maxZ = 2000;
        this._spaceShip.focalPlane = BABYLON.MeshBuilder.CreatePlane("FocalPlane", { width: 1000, height: 1000 }, scene);
        this._spaceShip.focalPlane.parent = this._spaceShip;
        this._spaceShip.focalPlane.isVisible = false;
        this.focalLength = 100;
        if (!isNaN(smoothness)) {
            this._smoothness = smoothness;
        }
        if (!isNaN(smoothnessRotation)) {
            this._smoothnessRotation = smoothnessRotation;
        }
    }
    get focalLength() {
        return this._focalLength;
    }
    set focalLength(v) {
        this._focalLength = BABYLON.Scalar.Clamp(v, 10, 1000);
        if (this._spaceShip.focalPlane) {
            this._spaceShip.focalPlane.position.z = this._focalLength;
        }
        this._offsetRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, 4 / (Math.round(this._focalLength / 5) * 5));
        $("#focal-length").text((Math.round(this._focalLength / 5) * 5).toFixed(0) + " m");
    }
    ResetPosition() {
        this.position.copyFromFloats(0, 0, 0);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
    _checkInputs() {
        if (!this._spaceShip.getWorldMatrix()) {
            return;
        }
        BABYLON.Vector3.TransformNormalToRef(this._offset, this._spaceShip.getWorldMatrix(), this._targetPosition);
        this._targetPosition.addInPlace(this._spaceShip.position);
        let s = this._smoothness - 1;
        this.position.copyFromFloats((this._targetPosition.x + this.position.x * s) / this._smoothness, (this._targetPosition.y + this.position.y * s) / this._smoothness, (this._targetPosition.z + this.position.z * s) / this._smoothness);
        this._targetRotation.copyFrom(this._spaceShip.rotationQuaternion);
        this._targetRotation.multiplyInPlace(this._offsetRotation);
        BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, this._targetRotation, 1 / this._smoothnessRotation, this.rotationQuaternion);
    }
    attachSpaceShipControl(canvas) {
        canvas.addEventListener("wheel", (event) => {
            this.focalLength *= 1 + BABYLON.Scalar.Sign(event.wheelDeltaY) * 0.05;
        });
    }
}
class TrailMesh extends BABYLON.Mesh {
    constructor(name, generator, scene, diameter = 1, length = 60) {
        super(name, scene);
        this._sectionPolygonPointsCount = 4;
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
        scene.registerBeforeRender(() => {
            this.update();
        });
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
        let trailMaterial = new TrailMaterial(this.name, this.getScene());
        trailMaterial.diffuseColor1 = new BABYLON.Color4(1, 0, 0, 0.2);
        trailMaterial.diffuseColor2 = new BABYLON.Color4(1, 1, 1, 0.4);
        this.material = trailMaterial;
    }
    update() {
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
    }
}
class Character {
    constructor(station) {
        this.position = BABYLON.Vector3.Zero();
        this.rotation = BABYLON.Quaternion.Identity();
        this._localForward = BABYLON.Vector3.One();
        this._localRight = BABYLON.Vector3.One();
        this._localUp = BABYLON.Vector3.One();
        this._tmpQuaternion = BABYLON.Quaternion.Identity();
        this.updateRotation = () => {
            this.instance.rotationQuaternion.copyFrom(this.rotation);
            let currentUp = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.instance.getWorldMatrix()));
            let targetUp = BABYLON.Vector3.Normalize(this.instance.absolutePosition);
            let correctionAxis = BABYLON.Vector3.Cross(currentUp, targetUp);
            let correctionAngle = Math.abs(Math.asin(correctionAxis.length()));
            let rotation = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle);
            this.instance.rotationQuaternion = rotation.multiply(this.instance.rotationQuaternion);
            this.rotation.copyFrom(this.instance.rotationQuaternion);
        };
        this.station = station;
    }
    get scene() {
        return this.station.scene;
    }
    instantiate() {
        this.instance = new CharacterInstance(this);
        this.scene.registerBeforeRender(this.updateRotation);
    }
    get x() {
        return this.position.x;
    }
    set x(v) {
        this.position.x = v;
        this.updatePosition();
    }
    get y() {
        return this.position.z;
    }
    set y(v) {
        this.position.z = v;
        this.updatePosition();
    }
    get h() {
        return this.position.y;
    }
    set h(v) {
        this.position.y = v;
        this.updatePosition();
    }
    get localForward() {
        if (this.instance) {
            this.instance.getDirectionToRef(BABYLON.Axis.Z, this._localForward);
            if (this._section) {
                BABYLON.Vector3.TransformNormalToRef(this._localForward, this._section.invertedWorldMatrix, this._localForward);
            }
        }
        return this._localForward;
    }
    get localRight() {
        if (this.instance) {
            this.instance.getDirectionToRef(BABYLON.Axis.X, this._localRight);
            if (this._section) {
                BABYLON.Vector3.TransformNormalToRef(this._localRight, this._section.invertedWorldMatrix, this._localRight);
            }
        }
        return this._localRight;
    }
    get localUp() {
        if (this.instance) {
            this.instance.getDirectionToRef(BABYLON.Axis.Y, this._localUp);
        }
        return this._localUp;
    }
    setXYH(x, y, h) {
        this.position.copyFromFloats(x, h, y);
        this.updatePosition;
    }
    positionAdd(delta) {
        this.position.addInPlace(delta);
        this.updatePosition();
    }
    rotate(angle) {
        BABYLON.Quaternion.RotationAxisToRef(this.localUp, angle, this._tmpQuaternion);
        this._tmpQuaternion.multiplyInPlace(this.rotation);
        this.rotation.copyFrom(this._tmpQuaternion);
        this.updatePosition();
    }
    updatePosition() {
        if (this._section) {
            let currentSection = this.currentSection();
            if (currentSection) {
                this.setSection(currentSection);
            }
            if (this.instance) {
                this.applyGravity();
                BABYLON.Vector3.TransformCoordinatesToRef(this.position, this._section.worldMatrix, this.instance.position);
            }
        }
    }
    applyGravity() {
        let downRay = this.downRay();
        if (downRay) {
            let pick = this.scene.pickWithRay(downRay, (m) => { return SectionLevel.SectionLevels.get(parseInt(m.id)) !== undefined; });
            if (pick.hit) {
                this.position.y += 0.9 - pick.distance;
            }
        }
    }
    downRay() {
        if (this.instance) {
            if (!this._downRay) {
                this._downRay = new BABYLON.Ray(BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, -1, 0), 6);
            }
            this._downRay.origin.copyFrom(this.instance.absolutePosition);
            this._downRay.origin.addInPlace(this._localUp.scale(0.9));
            this.instance.getDirectionToRef(BABYLON.Axis.Y, this._downRay.direction);
            this._downRay.direction.scaleInPlace(-1);
        }
        else {
            this._downRay = null;
        }
        return this._downRay;
    }
    currentSection() {
        let currentLevel = this.currentLevel();
        if (currentLevel) {
            return currentLevel.section;
        }
        return null;
    }
    setSection(section) {
        if (!this._section) {
            this._section = section;
        }
        else if (this._section !== section) {
            BABYLON.Vector3.TransformCoordinatesToRef(this.position, this._section.worldMatrix, this.position);
            this._section = section;
            BABYLON.Vector3.TransformCoordinatesToRef(this.position, this._section.invertedWorldMatrix, this.position);
            this.updatePosition();
        }
    }
    currentLevel() {
        let downRay = this.downRay();
        if (downRay) {
            let pick = this.scene.pickWithRay(downRay, (m) => { return SectionLevel.SectionLevels.get(parseInt(m.id)) !== undefined; });
            if (pick.hit) {
                if (pick.pickedMesh) {
                    let level = SectionLevel.SectionLevels.get(parseInt(pick.pickedMesh.id));
                    if (this.position.y - Math.floor(this.position.y / 5) > 4) {
                        let above = level.above();
                        if (above) {
                            return above;
                        }
                    }
                    return level;
                }
            }
        }
        return null;
    }
    disposeInstance() {
        this.instance.dispose();
        this.instance = undefined;
    }
}
var AnimationState;
(function (AnimationState) {
    AnimationState[AnimationState["Idle"] = 0] = "Idle";
    AnimationState[AnimationState["Walk"] = 1] = "Walk";
    AnimationState[AnimationState["Run"] = 2] = "Run";
})(AnimationState || (AnimationState = {}));
class CharacterInstance extends BABYLON.Mesh {
    constructor(character) {
        super(character.name, character.scene);
        this._currentAnimationState = AnimationState.Idle;
        this.character = character;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        BABYLON.SceneLoader.ImportMesh("", "./datas/" + character.name + ".babylon", "", character.scene, (meshes) => {
            console.log(meshes.length);
            meshes.forEach((m) => {
                if (m instanceof BABYLON.Mesh) {
                    this.mesh = m;
                    this.mesh.parent = this;
                    this.mesh.skeleton.enableBlending(120);
                    this.idle();
                }
            });
        });
    }
    idle() {
        if (this.character && this.mesh) {
            this._currentAnimationState = AnimationState.Idle;
            this.character.scene.beginAnimation(this.mesh.skeleton, 1, 60, true, 1);
        }
    }
    walk() {
        if (this.character && this.mesh) {
            this._currentAnimationState = AnimationState.Walk;
            this.character.scene.beginAnimation(this.mesh.skeleton, 61, 116, true, 1);
        }
    }
    run() {
        if (this.character && this.mesh) {
            this._currentAnimationState = AnimationState.Run;
            this.character.scene.beginAnimation(this.mesh.skeleton, 117, 141, true, 1);
        }
    }
    updateAnimation(speed) {
        if (this._currentAnimationState === AnimationState.Idle) {
            if (speed > 1) {
                this.walk();
            }
        }
        else if (this._currentAnimationState === AnimationState.Walk) {
            if (speed < 1) {
                this.idle();
            }
            else if (speed > 2) {
                this.run();
            }
        }
        else if (this._currentAnimationState === AnimationState.Run) {
            if (speed < 2) {
                this.walk();
            }
        }
    }
}
class PlayerCamera extends BABYLON.FreeCamera {
    constructor(character, scene) {
        super("PlayerCamera", BABYLON.Vector3.Zero(), scene);
        this.smoothness = 10;
        this.alpha = Math.PI / 4;
        this.distance = 25;
        this._targetPosition = BABYLON.Vector3.Zero();
        this._targetRotation = BABYLON.Quaternion.Identity();
        this._update = () => {
            this._updateTarget();
            this._updatePositionRotation();
        };
        this.character = character;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        scene.registerBeforeRender(this._update);
    }
    _updateTarget() {
        if (this.character && this.character.instance) {
            this._targetPosition.copyFrom(this.character.instance.absolutePosition);
            this._targetPosition.addInPlace(this.character.instance.getDirection(BABYLON.Axis.Z).scale(-this.distance * Math.cos(this.alpha)));
            this._targetPosition.addInPlace(this.character.instance.getDirection(BABYLON.Axis.Y).scale(this.distance * Math.sin(this.alpha)));
            this._targetRotation.copyFrom(BABYLON.Quaternion.RotationAxis(this.character.instance.getDirection(BABYLON.Axis.X), this.alpha));
            this._targetRotation.multiplyInPlace(this.character.instance.rotationQuaternion);
        }
    }
    _updatePositionRotation() {
        BABYLON.Vector3.LerpToRef(this.position, this._targetPosition, 1 / this.smoothness, this.position);
        BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, this._targetRotation, 1 / this.smoothness, this.rotationQuaternion);
    }
}
class PlayerControler {
    constructor(camera) {
        this.horizontalSensibility = 8;
        this.verticalSensibility = 2;
        this.mouseWheelSensibility = 2;
        this._rotating = false;
        this._deltaX = 0;
        this._deltaY = 0;
        this._deltaWheel = 0;
        this._forward = false;
        this._backward = false;
        this._right = false;
        this._left = false;
        this._checkInputs = () => {
            if (this._forward && !this._backward) {
                this.character.positionAdd(this.character.localForward.scale(0.3));
                this.character.instance.updateAnimation(2.5);
            }
            else {
                this.character.instance.updateAnimation(0);
            }
            if (this._backward && !this._forward) {
                this.character.positionAdd(this.character.localForward.scale(-0.1));
            }
            if (this._left && !this._right) {
                this.character.positionAdd(this.character.localRight.scale(0.1));
            }
            if (this._right && !this._left) {
                this.character.positionAdd(this.character.localRight.scale(-0.1));
            }
            this.character.rotate(this._deltaX / this._canvasWidth * this.horizontalSensibility);
            this.camera.alpha += this._deltaY / this._canvasHeight * this.verticalSensibility;
            this._deltaX = 0;
            this._deltaY = 0;
        };
        this._canvasWidth = 1;
        this._canvasHeight = 1;
        this._pointerObserver = (eventData, eventState) => {
            if (eventData.type === BABYLON.PointerEventTypes._POINTERDOWN) {
                this._rotating = true;
            }
            else if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                this._rotating = false;
            }
            else if (eventData.type === BABYLON.PointerEventTypes._POINTERMOVE) {
                if (this._rotating) {
                    this._deltaX += eventData.event.movementX;
                    this._deltaY += eventData.event.movementY;
                }
            }
            else if (eventData.type === BABYLON.PointerEventTypes._POINTERWHEEL) {
            }
        };
        this.camera = camera;
        this.character = camera.character;
        this.character.scene.registerBeforeRender(this._checkInputs);
    }
    attachControl(canvas) {
        this._canvasWidth = canvas.width;
        this._canvasHeight = canvas.height;
        canvas.addEventListener("keydown", (ev) => {
            if (ev.key === "z") {
                this._forward = true;
            }
            if (ev.key === "s") {
                this._backward = true;
            }
            if (ev.key === "d") {
                this._left = true;
            }
            if (ev.key === "q") {
                this._right = true;
            }
        });
        canvas.addEventListener("keyup", (ev) => {
            if (ev.key === "z") {
                this._forward = false;
            }
            if (ev.key === "s") {
                this._backward = false;
            }
            if (ev.key === "d") {
                this._left = false;
            }
            if (ev.key === "q") {
                this._right = false;
            }
        });
        this.character.scene.onPointerObservable.add(this._pointerObserver);
    }
}
class HUD {
    constructor(scene) {
        this.spaceshipInfos = [];
        this._updateSpaceshipInfos = () => {
            SpaceShipControler.Instances.forEach((spaceShipControler) => {
                if (!(spaceShipControler instanceof SpaceShipInputs)) {
                    let spaceship = spaceShipControler.spaceShip;
                    let spaceshipInfo = this.spaceshipInfos.find(ssInfo => { return ssInfo.spaceship === spaceship; });
                    if (!spaceshipInfo) {
                        this.spaceshipInfos.push(new HUDSpaceshipInfo(spaceship));
                    }
                }
            });
            let i = 0;
            while (i < this.spaceshipInfos.length) {
                let spaceshipInfo = this.spaceshipInfos[i];
                if (!spaceshipInfo.spaceship.isAlive) {
                    spaceshipInfo.destroy();
                    this.spaceshipInfos.splice(i, 1);
                }
                else {
                    i++;
                }
            }
        };
        this.scene = scene;
        this.scene.onBeforeRenderObservable.add(this._updateSpaceshipInfos);
    }
    destroy() {
        this.scene.onBeforeRenderObservable.removeCallback(this._updateSpaceshipInfos);
        while (this.spaceshipInfos.length > 0) {
            let spaceshipInfo = this.spaceshipInfos[0];
            spaceshipInfo.destroy();
            this.spaceshipInfos.splice(0, 1);
        }
    }
}
class HUDSpaceshipInfo extends BABYLON.TransformNode {
    constructor(spaceship) {
        super("hudSpaceshipInfo", spaceship.getScene());
        this._update = () => {
            this.lookAt(this.getScene().activeCamera.position);
            this.distanceInfo.text = BABYLON.Vector3.Distance(this.spaceship.position, this.getScene().activeCamera.position).toFixed(0) + " m";
        };
        this.onWound = () => {
            this.hitpointInfo.dispose();
            let color = new BABYLON.Color4(0, 1, 0, 1);
            let ratio = this.spaceship.hitPoint / this.spaceship.stamina;
            if (ratio < 0.25) {
                color.copyFromFloats(1, 0, 0, 1);
            }
            else if (ratio < 0.5) {
                color.copyFromFloats(1, 0.5, 0, 1);
            }
            else if (ratio < 0.75) {
                color.copyFromFloats(1, 1, 0, 1);
            }
            this.hitpointInfo = SSMeshBuilder.CreateZRailMesh(6.5, 7.5, Math.PI / 4 - Math.PI / 2 * ratio, Math.PI / 4, 64, this.getScene(), color);
            this.hitpointInfo.parent = this;
        };
        this.spaceship = spaceship;
        this.position = spaceship.position;
        this.circle = SSMeshBuilder.CreateZCircleMesh(6, spaceship.getScene());
        this.circle.parent = this;
        this.hitpointInfo = SSMeshBuilder.CreateZRailMesh(6.5, 7.5, -Math.PI / 4, Math.PI / 4, 64, this.getScene(), new BABYLON.Color4(0, 1, 0, 1));
        this.hitpointInfo.parent = this;
        let distanceInfoPosition = new BABYLON.Mesh("distanceInfoPosition", this.getScene());
        distanceInfoPosition.parent = this;
        distanceInfoPosition.position.y = -6;
        this.distanceInfo = new BABYLON.GUI.TextBlock("distanceInfo", "42 m");
        this.distanceInfo.fontFamily = "consolas";
        this.distanceInfo.fontSize = "12px";
        this.distanceInfo.color = "white";
        Main.GuiTexture.addControl(this.distanceInfo);
        this.distanceInfo.linkWithMesh(distanceInfoPosition);
        this.distanceInfo.linkOffsetY = "9px";
        this.getScene().onBeforeRenderObservable.add(this._update);
        this.spaceship.onWoundObservable.add(this.onWound);
    }
    destroy() {
        this.dispose();
        this.distanceInfo.dispose();
        this.spaceship.onWoundObservable.removeCallback(this.onWound);
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }
}
class Layout {
    static get focalLength() {
        if (!Layout._focalLength) {
            Layout._focalLength = $("#focal-length");
        }
        return Layout._focalLength;
    }
    static get targets() {
        if (!Layout._targets) {
            Layout._targets = $(".target");
        }
        return Layout._targets;
    }
    static get target1() {
        if (!Layout._target1) {
            Layout._target1 = $("#target1");
        }
        return Layout._target1;
    }
    static get mapIcons() {
        Layout._mapIcons = $(".map-icon");
        return Layout._mapIcons;
    }
    static get panelRight() {
        if (!Layout._panelRight) {
            Layout._panelRight = $("#panel-right");
        }
        return Layout._panelRight;
    }
    static get speedDisplay() {
        if (!Layout._speedDisplay) {
            Layout._speedDisplay = $("speed-display");
        }
        return Layout._speedDisplay;
    }
    static get objectiveRadar() {
        if (!Layout._objectiveRadar) {
            Layout._objectiveRadar = $("#objective-radar");
        }
        return Layout._objectiveRadar;
    }
    static get comLink() {
        if (!Layout._comLink) {
            Layout._comLink = $("#com-link");
        }
        return Layout._comLink;
    }
    static get teamPanel() {
        if (!Layout._teamPanel) {
            Layout._teamPanel = $("#team-panel");
        }
        return Layout._teamPanel;
    }
    static get frames() {
        if (!Layout._frames) {
            Layout._frames = $(".frame");
        }
        return Layout._frames;
    }
    static get cinematicFrame() {
        if (!Layout._cinematicFrame) {
            Layout._cinematicFrame = $("#cinematic-frame");
        }
        return Layout._cinematicFrame;
    }
    static get cinematicFrameTitle() {
        if (!Layout._cinematicFrameTitle) {
            Layout._cinematicFrameTitle = $("#cinematic-frame-title");
        }
        return Layout._cinematicFrameTitle;
    }
    static get cinematicFrameLocationDate() {
        if (!Layout._cinematicFrameLocationDate) {
            Layout._cinematicFrameLocationDate = $("#cinematic-frame-location-date");
        }
        return Layout._cinematicFrameLocationDate;
    }
    static get gameOverFrame() {
        if (!Layout._gameOverFrame) {
            Layout._gameOverFrame = $("#game-over-frame");
        }
        return Layout._gameOverFrame;
    }
    static get mainMenu() {
        if (!Layout._mainMenu) {
            Layout._mainMenu = $("#main-menu");
        }
        return Layout._mainMenu;
    }
    static get playButton() {
        if (!Layout._playButton) {
            Layout._playButton = $("#play-button");
        }
        return Layout._playButton;
    }
    static get skipButton() {
        if (!Layout._skipButton) {
            Layout._skipButton = $("#skip-button");
        }
        return Layout._skipButton;
    }
    static HideAll() {
        Layout.focalLength.hide();
        Layout.targets.hide();
        Layout.mapIcons.hide();
        Layout.panelRight.hide();
        Layout.speedDisplay.hide();
        Layout.objectiveRadar.hide();
        Layout.comLink.hide();
        Layout.teamPanel.hide();
        Layout.frames.hide();
        Layout.mainMenu.hide();
        Layout.playButton.hide();
        Layout.skipButton.hide();
    }
    static Resize() {
        let w = Main.Canvas.width;
        let h = Main.Canvas.height;
        let size = Math.min(w, h);
        Layout.frames.css("width", size * 0.8);
        Layout.frames.css("height", size * 0.8);
        Layout.frames.css("bottom", h / 2 - size * 0.8 / 2);
        Layout.frames.css("left", w / 2 - size * 0.8 / 2);
        Layout.target1.css("width", size * 0.9 + "px");
        Layout.target1.css("height", size * 0.9 + "px");
        Layout.target1.css("top", Main.Canvas.height / 2 - size * 0.9 / 2);
        Layout.target1.css("left", Main.Canvas.width / 2 - size * 0.9 / 2);
        Layout.panelRight.css("width", size / 3 + "px");
        Layout.panelRight.css("height", size / 3 + "px");
        Layout.panelRight.css("top", Main.Canvas.height - size / 3);
        Layout.panelRight.css("left", Main.Canvas.width - size / 3);
        Layout.speedDisplay.css("width", size / 3 + "px");
        Layout.speedDisplay.css("height", size / 3 + "px");
        Layout.speedDisplay.css("top", Main.Canvas.height - size / 3);
        Layout.speedDisplay.css("left", Main.Canvas.width - size / 3);
        Layout.objectiveRadar.css("width", size / 2 * 0.8 + "px");
        Layout.objectiveRadar.css("height", size / 2 * 0.8 + "px");
        Layout.objectiveRadar.css("top", size / 2 * 0.1);
        Layout.objectiveRadar.css("left", size / 2 * 0.1);
    }
    static IntroLayout() {
        Layout.HideAll();
        Layout.cinematicFrame.show();
        Layout.skipButton.show();
        Layout.cinematicFrameLocationDate.hide();
        Layout.cinematicFrameTitle.show();
    }
    static MenuLayout() {
        Layout.HideAll();
        Layout.mainMenu.show();
    }
    static CinematicLayout() {
        Layout.HideAll();
        Layout.cinematicFrame.show();
        Layout.skipButton.show();
        Layout.cinematicFrameLocationDate.show();
        Layout.cinematicFrameTitle.hide();
    }
    static ReadyLayout() {
        Layout.HideAll();
        Layout.playButton.show();
    }
    static GameOverLayout() {
        Layout.HideAll();
        Layout.gameOverFrame.show();
    }
    static GameLayout() {
        Layout.HideAll();
        Layout.focalLength.show();
        Layout.targets.show();
        Layout.mapIcons.show();
        Layout.panelRight.show();
        Layout.speedDisplay.show();
        Layout.objectiveRadar.show();
        Layout.comLink.show();
        Layout.teamPanel.show();
    }
}
class Intro {
    static RunIntro() {
        Intro.index = -1;
        Layout.IntroLayout();
        $("#skip-button").on("click", () => {
            Intro.UpdateIntro();
        });
        Intro.UpdateIntro();
    }
    static UpdateIntro() {
        clearTimeout(Intro._timeoutHandle);
        Intro.index = Intro.index + 1;
        if (!Intro.texts[Intro.index]) {
            return Intro.CloseIntro();
        }
        $("#cinematic-frame-text").text(Intro.texts[Intro.index]);
        $("#cinematic-frame-picture-img").attr("src", Intro.pictures[Intro.index]);
        Intro._timeoutHandle = setTimeout(() => {
            Intro.UpdateIntro();
        }, 6000);
    }
    static CloseIntro() {
        $("#skip-button").off();
        Main.Menu();
    }
}
Intro.index = 0;
Intro.texts = [
    "It's been more than a thousand year since the Buenos Aires Conference of May " +
        "4th 2028, when all nations of earth united their space programs in a common quest for the stars.",
    "Mankind boundaries has since been pushed away to extends no one had expected. " +
        "Less than a century after the first Titan's civilian settlement, an inhabited spacecraft revolved around Proxima Centauri in 2242.",
    "Encounters with evolved life forms occurred along the whole millennium, and most " +
        "galactic hubs are populated by several coexisting species.",
    "Unwearied, earthlings keep spreading through the galaxy, a few dozens light-years away from home."
];
Intro.pictures = [
    "./img/conference.png",
    "./img/sun.png",
    "./img/galaxy.png",
    "./img/spaceships.png"
];
Intro._timeoutHandle = 0;
class Level0 {
    constructor() {
        this.introDialogs = [
            "- Jack, your squad should now be reaching the zone.",
            "- Our drones dropped four beacons here.",
            "- Find and activate the beacons, so we can analyze their data.",
            "- The beacons should appear on your radar. Good luck, stay safe !"
        ];
        this.tipDialogs = [
            "- Ok captain. Driving a SpaceShip for dummies.",
            "- Lesson 1 - Use your mouse to rotate the ship.",
            "- Lesson 2 - Press W to accelerate.",
            "- Lesson 3 - Press A or D key to do a barrel-roll.",
            "- Lesson 4 - Press Q or E to assign task to your squad.",
            "- Lesson 5 - Upgrade to Premium Account to unlock blasters.",
            "- And... That's it. Let's find the beacons."
        ];
        this.dialogs = [
            "- First beacon activated. Analysis completed. Non-relevant. Three left. Keep on.",
            "- Second beacon activated. Analysis completed. All clear. Two left. Keep on.",
            "- Third beacon activated. Analysis completed. Corrupted data. One left. Keep on.",
            "- Fourth beacon activated. Analysis completed. Got it ! That's all we needed. Mission accomplished !",
            "- Well done Jack ! Get back to base. Over."
        ];
    }
    LoadLevel(scene) {
        let beaconMasterName = "beacon";
        let beaconMaster = Loader.LoadedStatics.get(beaconMasterName)[0];
        if (beaconMaster instanceof BABYLON.Mesh) {
            let instances = beaconMaster.instances;
            for (let i = 0; i < instances.length; i++) {
                let b = instances[i];
                let emit = new BeaconEmiter("Emiter-" + i, scene);
                emit.initialize();
                emit.position.copyFrom(b.position);
                emit.rotation.copyFrom(b.rotation);
                let beaconCheck = () => {
                    if (!emit.activated) {
                        for (let i = 0; i < SpaceShipControler.Instances.length; i++) {
                            let spaceShip = SpaceShipControler.Instances[i];
                            if (BABYLON.Vector3.DistanceSquared(spaceShip.position, b.position) < Config.activationSqrRange) {
                                emit.activate();
                                scene.unregisterBeforeRender(beaconCheck);
                                Comlink.Display("MotherShip", this.dialogs[BeaconEmiter.activatedCount - 1], "aff9ff");
                                if (BeaconEmiter.activatedCount === 4) {
                                    this.Win();
                                }
                            }
                        }
                    }
                };
                scene.registerBeforeRender(beaconCheck);
            }
        }
        Main.State = State.Ready;
    }
    OnGameStart() {
        let delay = 1000;
        for (let i = 0; i < this.introDialogs.length; i++) {
            setTimeout(() => {
                Comlink.Display("MotherShip", this.introDialogs[i], "aff9ff");
            }, delay);
            delay += 6000;
        }
        for (let i = 0; i < this.tipDialogs.length; i++) {
            setTimeout(() => {
                Comlink.Display("Voyoslov", this.tipDialogs[i], "ffffff");
            }, delay);
            delay += 3000;
        }
    }
    Win() {
        let time = (new Date()).getTime() - Main.playStart;
        setTimeout(() => {
            Comlink.Display("MotherShip", this.dialogs[4], "aff9ff");
            setTimeout(() => {
                $("#game-over-time-value").text((time / 1000).toFixed(0) + " sec");
                Main.GameOver();
            }, 5000);
        }, 5000);
    }
    UnLoadLevel() {
        BeaconEmiter.DisposeAll();
    }
}
class Loader {
    static _sleep(delay) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, delay);
            });
        });
    }
    static LoadScene(name, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            Main.Level = new Level0();
            return new Promise((resolve) => {
                $.ajax({
                    url: "./datas/scenes/" + name + ".json",
                    success: (data) => __awaiter(this, void 0, void 0, function* () {
                        Main.Scene.activeCamera = Main.MenuCamera;
                        Main.MenuCamera.position = new BABYLON.Vector3(data.cinematic.xCam, data.cinematic.yCam, data.cinematic.zCam);
                        Loader.RunCinematic(data.cinematic);
                        yield Loader._loadSceneData(data, scene);
                        yield Main.Level.LoadLevel(scene);
                        resolve();
                    })
                });
            });
        });
    }
    static RunCinematic(data) {
        Loader.index = -1;
        Layout.CinematicLayout();
        $("#cinematic-frame-location").text(data.location);
        $("#cinematic-frame-date").text(data.date);
        $("#skip-button").on("click", () => {
            Loader.UpdateCinematic(data);
        });
        Loader.UpdateCinematic(data);
    }
    static UpdateCinematic(data) {
        clearTimeout(Loader._timeoutHandle);
        Loader.index = Loader.index + 1;
        if (!data.frames[Loader.index]) {
            return Loader.CloseCinematic();
        }
        $("#cinematic-frame-text").text(data.frames[Loader.index].text);
        Loader._timeoutHandle = setTimeout(() => {
            Loader.UpdateCinematic(data);
        }, data.frames[Loader.index].delay);
    }
    static CloseCinematic() {
        // note : This should actually be "Loading Layout", and auto skip once level is fully loaded.
        Layout.ReadyLayout();
    }
    static _loadSceneData(data, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Loader.AddStaticsIntoScene(data.statics, scene, Config.sceneLoaderDelay);
        });
    }
    static _loadStatic(name, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                BABYLON.SceneLoader.ImportMesh("", "./datas/" + name + ".babylon", "", scene, (meshes, particleSystems, skeletons) => {
                    Loader.LoadedStatics.set(name, []);
                    for (let i = 0; i < meshes.length; i++) {
                        if (meshes[i] instanceof BABYLON.Mesh) {
                            let mesh = meshes[i];
                            Loader.LoadedStatics.get(name).push(mesh);
                            Loader._loadMaterial(mesh.material, name, scene);
                            for (let j = 0; j < mesh.instances.length; j++) {
                                Loader.LoadedStatics.get(name).push(mesh.instances[j]);
                                mesh.instances[j].isVisible = false;
                                mesh.instances[j].isPickable = false;
                            }
                            mesh.isVisible = false;
                            mesh.isPickable = false;
                        }
                    }
                    resolve(Loader.LoadedStatics.get(name));
                });
            });
        });
    }
    static _loadMaterial(material, name, scene) {
        if (material instanceof BABYLON.StandardMaterial) {
            material.bumpTexture = new BABYLON.Texture("./datas/" + name + "-bump.png", scene);
            material.ambientTexture = new BABYLON.Texture("./datas/" + name + "-ao.png", scene);
        }
    }
    static _cloneStaticIntoScene(sources, x, y, z, s = 1, rX = 0, rY = 0, rZ = 0, callback) {
        let instance;
        for (let i = 0; i < sources.length; i++) {
            if (sources[i] instanceof BABYLON.Mesh) {
                let source = sources[i];
                instance = source.createInstance(source.name);
                instance.position.copyFromFloats(x, y, z);
                instance.rotation.copyFromFloats(rX, rY, rZ);
                instance.scaling.copyFromFloats(s, s, s);
                instance.computeWorldMatrix();
                instance.freezeWorldMatrix();
                if (source.name[0] === "S") {
                    let radius = source.name.substring(2);
                    instance.getBoundingInfo().boundingSphere.radius = parseFloat(radius);
                    instance.getBoundingInfo().boundingSphere.radiusWorld = parseFloat(radius) * s;
                }
                Obstacle.PushSphere(instance.getBoundingInfo().boundingSphere);
            }
            else if (sources[i] instanceof BABYLON.InstancedMesh) {
                let source = sources[i];
                instance = source.sourceMesh.createInstance(source.name);
                instance.position.copyFromFloats(x, y, z);
                instance.rotation.copyFromFloats(rX, rY, rZ);
                instance.computeWorldMatrix();
                instance.freezeWorldMatrix();
            }
        }
        if (callback) {
            callback();
        }
    }
    static AddStaticsIntoScene(datas, scene, delay = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < datas.length; i++) {
                yield Loader.AddStaticIntoScene(datas[i], scene);
                if (delay > 0) {
                    yield Loader._sleep(delay);
                }
            }
        });
    }
    static AddStaticIntoScene(data, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Loader.LoadedStatics.get(data.name)) {
                Loader._cloneStaticIntoScene(Loader.LoadedStatics.get(data.name), data.x, data.y, data.z, data.s, data.rX, data.rY, data.rZ);
            }
            else {
                let loadedMeshes = yield Loader._loadStatic(data.name, scene);
                Loader._cloneStaticIntoScene(loadedMeshes, data.x, data.y, data.z, data.s, data.rX, data.rY, data.rZ);
            }
        });
    }
    static UnloadScene() {
        Loader.LoadedStatics.forEach((v, index) => {
            for (let i = 0; i < v.length; i++) {
                let m = v[i];
                if (m) {
                    m.dispose();
                }
            }
        });
        Loader.LoadedStatics = new Map();
    }
}
Loader.LoadedStatics = new Map();
Loader.index = 0;
Loader._timeoutHandle = 0;
class Menu {
    static RunLevel1() {
        Loader.LoadScene("level-0", Main.Scene);
    }
    static ShowMenu() {
        //
    }
    static HideMenu() {
        //
    }
    static RegisterToUI() {
        $("#game-over-continue").on("click", (e) => {
            Main.Menu();
        });
        $("#level-0").on("click", (e) => {
            Loader.LoadScene("level-0", Main.Scene);
        });
    }
}
class RandomGenerator {
    static Level1() {
        console.log(".");
        let data = [];
        let arcR = 1000;
        let d = 100;
        let r = 300;
        let count = 1000;
        let l = arcR + d + r;
        let cX = -arcR / Math.sqrt(2);
        let cZ = cX;
        let minSqrRadius = (d + arcR) * (d + arcR);
        let maxSqrRadius = l * l;
        let position = BABYLON.Vector3.Zero();
        while (data.length < 4) {
            position.copyFromFloats(Math.random() * l, Math.random() * r - r / 2, Math.random() * l);
            let sqrRadius = (position.x) * (position.x) + (position.z) * (position.z);
            if ((sqrRadius > minSqrRadius) && (sqrRadius < maxSqrRadius)) {
                data.push({
                    name: "beacon",
                    x: parseFloat((position.x + cX).toFixed(2)),
                    y: parseFloat((position.y).toFixed(2)),
                    z: parseFloat((position.z + cZ).toFixed(2)),
                    s: 1,
                    rX: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
                    rY: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
                    rZ: parseFloat((Math.random() * Math.PI * 2).toFixed(2))
                });
            }
        }
        while (data.length < count) {
            position.copyFromFloats(Math.random() * l, Math.random() * r - r / 2, Math.random() * l);
            let sqrRadius = (position.x) * (position.x) + (position.z) * (position.z);
            if ((sqrRadius > minSqrRadius) && (sqrRadius < maxSqrRadius)) {
                data.push({
                    name: "asteroid-2",
                    x: parseFloat((position.x + cX).toFixed(2)),
                    y: parseFloat((position.y).toFixed(2)),
                    z: parseFloat((position.z + cZ).toFixed(2)),
                    s: parseFloat((Math.random() * 7 + 0.5).toFixed(2)),
                    rX: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
                    rY: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
                    rZ: parseFloat((Math.random() * Math.PI * 2).toFixed(2))
                });
            }
        }
        console.log(JSON.stringify(data));
    }
}
class MaterialLoader {
    constructor(scene) {
        this.scene = scene;
        this._materials = new Map();
        MaterialLoader.instance = this;
    }
    get(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._materials.get(name)) {
                return this._materials.get(name);
            }
            return new Promise((resolve) => {
                $.getJSON("./datas/materials/" + name + ".json", (rawData) => {
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
                });
            });
        });
    }
}
class MeshLoader {
    constructor(scene) {
        this.scene = scene;
        this.lookup = new Map();
        MeshLoader.instance = this;
    }
    get(name, callback) {
        let mesh = this.lookup.get(name);
        if (mesh) {
            callback(mesh.createInstance(mesh.name + "-instance"));
        }
        else {
            BABYLON.SceneLoader.ImportMesh("", "./datas/" + name + ".babylon", "", this.scene, (meshes, particleSystems, skeletons) => {
                let mesh = meshes[0];
                if (mesh instanceof BABYLON.Mesh) {
                    this.lookup.set(name, mesh);
                    mesh.isVisible = false;
                    callback(mesh.createInstance(mesh.name + "-instance"));
                    if (mesh.material instanceof BABYLON.StandardMaterial) {
                        if (mesh.material.name.endsWith("metro")) {
                            console.log("Texture loading for " + mesh.material.name);
                            mesh.material.diffuseTexture = new BABYLON.Texture("./datas/metro.png", this.scene);
                            mesh.material.diffuseColor.copyFromFloats(1, 1, 1);
                            mesh.material.bumpTexture = new BABYLON.Texture("./datas/metro-normal.png", this.scene);
                            mesh.material.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                        }
                    }
                    if (mesh.material && mesh.material instanceof BABYLON.MultiMaterial) {
                        mesh.material.subMaterials.forEach((m) => {
                            if (m instanceof BABYLON.StandardMaterial) {
                                if (m.name.endsWith("Floor")) {
                                    console.log("Texture loading");
                                    m.diffuseTexture = new BABYLON.Texture("./datas/floor.png", this.scene);
                                    m.diffuseColor.copyFromFloats(1, 1, 1);
                                    m.bumpTexture = new BABYLON.Texture("./datas/floor-normal.png", this.scene);
                                    m.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                                }
                                if (m.name.endsWith("Road")) {
                                    console.log("Texture loading");
                                    m.diffuseTexture = new BABYLON.Texture("./datas/road.png", this.scene);
                                    m.diffuseColor.copyFromFloats(1, 1, 1);
                                    m.bumpTexture = new BABYLON.Texture("./datas/road-normal.png", this.scene);
                                    m.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                                }
                                if (m.name.endsWith("Wall")) {
                                    console.log("Texture loading");
                                    m.diffuseTexture = new BABYLON.Texture("./datas/wall.png", this.scene);
                                    m.diffuseColor.copyFromFloats(1, 1, 1);
                                    m.bumpTexture = new BABYLON.Texture("./datas/wall-normal.png", this.scene);
                                    m.specularColor.copyFromFloats(0.6, 0.6, 0.6);
                                }
                            }
                        });
                    }
                }
                else {
                    this.lookup.set(name, null);
                    callback(null);
                }
            });
        }
    }
}
class SpaceshipLoader {
    constructor(scene) {
        this.scene = scene;
        this._spaceshipDatas = new Map();
        SpaceshipLoader.instance = this;
    }
    get(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._spaceshipDatas.get(name)) {
                return this._spaceshipDatas.get(name);
            }
            return new Promise((resolve) => {
                $.getJSON("./datas/spaceships/" + name + ".json", (data) => {
                    this._spaceshipDatas.set(name, data);
                    resolve(this._spaceshipDatas.get(name));
                });
            });
        });
    }
}
class VertexDataLoader {
    constructor(scene) {
        this.scene = scene;
        this._vertexDatas = new Map();
        VertexDataLoader.instance = this;
    }
    get(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._vertexDatas.get(name)) {
                return this._vertexDatas.get(name);
            }
            return new Promise((resolve) => {
                $.getJSON("./datas/vertexData/" + name + ".babylon", (rawData) => {
                    let data = new BABYLON.VertexData();
                    data.positions = rawData.meshes[0].positions;
                    data.indices = rawData.meshes[0].indices;
                    data.uvs = rawData.meshes[0].uvs;
                    this._vertexDatas.set(name, data);
                    resolve(this._vertexDatas.get(name));
                });
            });
        });
    }
}
class Flash {
    constructor() {
        this.source = BABYLON.Vector3.Zero();
        this.distance = 100;
        this.speed = 0.1;
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
        this.length = 1.5;
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
            this.setVector3("cameraPosition", Main.MenuCamera.position);
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
class Metro {
    constructor(line, timerZero = 0) {
        this.position = 0;
        this._timer = 0;
        this.timeStop = 30;
        this.timeTravel = 60;
        this.lengthStep = 4;
        this.easing = new BABYLON.CubicEase();
        this.debugRoll = () => {
            this._timer++;
            let steps = Math.floor(this._timer / this.timeStep);
            let delta = this._timer - steps * this.timeStep;
            let deltaPosition = Math.max(0, Math.min(1, (delta - this.timeStop / 2) / this.timeTravel));
            deltaPosition = this.easing.ease(deltaPosition);
            this.position = this.lengthStep * (steps + deltaPosition);
            if (this.position >= this.line.path.length) {
                this._timer = 0;
                this.position = 0;
            }
        };
        this.line = line;
        this._timer = timerZero;
        this.easing = new BABYLON.CubicEase();
        this.easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    }
    get timeStep() {
        return this.timeStop + this.timeTravel;
    }
    instantiate() {
        MeshLoader.instance.get("metro", (m) => {
            this.instance = m;
            this.instance.rotationQuaternion = BABYLON.Quaternion.Identity();
            this.instance.getScene().registerBeforeRender(() => {
                this.debugRoll();
                this.updatePosition();
            });
        });
    }
    updatePosition() {
        if (this.instance) {
            this.line.evaluatePositionToRef(this.position, this.instance.position);
            let up = this.instance.position.clone().normalize();
            let forward = this.line.evaluateDirection(this.position).scale(-1);
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(BABYLON.Vector3.Cross(up, forward), up, forward, this.instance.rotationQuaternion);
        }
    }
}
class MetroLine {
    constructor() {
        this.path = [];
    }
    load(data) {
        this.name = data.name;
        this.index = data.index;
        this.path = data.path;
    }
    evaluatePosition(t) {
        let v = BABYLON.Vector3.Zero();
        this.evaluatePositionToRef(t, v);
        return v;
    }
    evaluatePositionToRef(t, v) {
        if (t < 0) {
            t += this.path.length;
        }
        let pIndex = Math.floor(t);
        console.log(pIndex);
        let delta = t - pIndex;
        let p0 = this.path[(pIndex - 1 + this.path.length) % this.path.length];
        let p1 = this.path[pIndex % this.path.length];
        let p2 = this.path[(pIndex + 1) % this.path.length];
        let p3 = this.path[(pIndex + 2) % this.path.length];
        v.copyFrom(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, delta));
    }
    evaluateDirection(t) {
        let v = BABYLON.Vector3.Zero();
        this.evaluateDirectionToRef(t, v);
        return v;
    }
    evaluateDirectionToRef(t, v) {
        this.evaluatePositionToRef(t + 0.1, v);
        v.subtractInPlace(this.evaluatePosition(t - 0.1));
        v.normalize();
    }
}
class Projectile extends BABYLON.Mesh {
    constructor(direction, shooter) {
        super("projectile", shooter.getScene());
        this.speed = 150;
        this._lifeSpan = 5;
        this.power = 10;
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
            this.position.addInPlace(this._direction.scale(this.speed * dt));
            let zAxis = this._direction;
            let yAxis = this.getScene().activeCamera.position.subtract(this.position);
            let xAxis = BABYLON.Vector3.Cross(yAxis, zAxis).normalize();
            BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, this.rotationQuaternion);
        };
        this._direction = direction;
        this.shooter = shooter;
        this.position.copyFrom(shooter.position);
        this.rotationQuaternion = shooter.rotationQuaternion.clone();
        this._displacementRay = new BABYLON.Ray(this.position, this._direction.clone());
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    instantiate() {
        return __awaiter(this, void 0, void 0, function* () {
            let vertexData = yield VertexDataLoader.instance.get("laser");
            if (vertexData && !this.isDisposed()) {
                vertexData.applyToMesh(this);
            }
            let material = yield MaterialLoader.instance.get("red-laser");
            if (material && !this.isDisposed()) {
                this.material = material;
            }
        });
    }
    destroy() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
    _collide(dt) {
        this._displacementRay.length = this.speed * dt;
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
class SpaceShip extends BABYLON.Mesh {
    constructor(data, scene) {
        super(name, scene);
        this._forwardInput = 0;
        this._enginePower = 15;
        this._frontDrag = 0.01;
        this._backDrag = 1;
        this._forward = 0;
        this._rollInput = 0;
        this._rollPower = 2;
        this._rollDrag = 0.9;
        this._roll = 0;
        this._yawInput = 0;
        this._yawPower = 2;
        this._yawDrag = 0.9;
        this._yaw = 0;
        this._pitchInput = 0;
        this._pitchPower = 2;
        this._pitchDrag = 0.9;
        this._pitch = 0;
        this._dt = 0;
        this._colliders = [];
        this.isAlive = true;
        this.stamina = 50;
        this.cooldown = 0.3;
        this._cool = 0;
        this.onWoundObservable = new BABYLON.Observable();
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
        this.impactParticle = new BABYLON.ParticleSystem("particles", 2000, scene);
        this.impactParticle.particleTexture = new BABYLON.Texture("./datas/textures/impact.png", scene);
        this.impactParticle.emitter = this;
        this.impactParticle.direction1.copyFromFloats(50, 50, 50);
        this.impactParticle.direction2.copyFromFloats(-50, -50, -50);
        this.impactParticle.emitRate = 800;
        this.impactParticle.minLifeTime = 0.02;
        this.impactParticle.maxLifeTime = 0.05;
        this.impactParticle.manualEmitCount = 100;
        this.impactParticle.minSize = 0.05;
        this.impactParticle.maxSize = 0.3;
        this.wingTipLeft = new BABYLON.Mesh("WingTipLeft", scene);
        this.wingTipLeft.parent = this;
        this.wingTipLeft.position.copyFromFloats(-2.91, 0, -1.24);
        this.wingTipRight = new BABYLON.Mesh("WingTipRight", scene);
        this.wingTipRight.parent = this;
        this.wingTipRight.position.copyFromFloats(2.91, 0, -1.24);
        new TrailMesh("Test", this.wingTipLeft, Main.Scene, 0.1, 120);
        new TrailMesh("Test", this.wingTipRight, Main.Scene, 0.1, 120);
        this.hitPoint = this.stamina;
        this.createColliders();
        scene.registerBeforeRender(() => {
            this._move();
        });
    }
    get forwardInput() {
        return this._forwardInput;
    }
    set forwardInput(v) {
        if (isFinite(v)) {
            this._forwardInput = BABYLON.Scalar.Clamp(v, -1, 1);
        }
    }
    get forward() {
        return this._forward;
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
    initialize(url, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./datas/" + url + ".babylon", "", Main.Scene, (meshes, particleSystems, skeletons) => {
            let spaceship = meshes[0];
            if (spaceship instanceof BABYLON.Mesh) {
                spaceship.parent = this;
                this._mesh = spaceship;
                this.shield.parent = this._mesh;
                this.wingTipLeft.parent = this._mesh;
                this.wingTipRight.parent = this._mesh;
                let spaceshipMaterial = new BABYLON.StandardMaterial("SpaceShipMaterial", this.getScene());
                spaceshipMaterial.diffuseTexture = new BABYLON.Texture("./datas/" + url + "-diffuse.png", Main.Scene);
                spaceshipMaterial.bumpTexture = new BABYLON.Texture("./datas/" + url + "-bump.png", Main.Scene);
                spaceshipMaterial.ambientTexture = new BABYLON.Texture("./datas/" + url + "-ao.png", Main.Scene);
                spaceshipMaterial.ambientTexture.level = 2;
                spaceshipMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
                spaceship.material = spaceshipMaterial;
                if (callback) {
                    callback();
                }
            }
        });
    }
    createColliders() {
        this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0.22, -0.59), 1.06));
        this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0, 2.43), 0.75));
    }
    attachControler(controler) {
        this.controler = controler;
    }
    static CenterRadiusBoundingSphere(center, radius) {
        return new BABYLON.BoundingSphere(new BABYLON.Vector3(center.x, center.y - radius, center.z), new BABYLON.Vector3(center.x, center.y + radius, center.z));
    }
    _move() {
        this._dt = this.getEngine().getDeltaTime() / 1000;
        BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.X, this.getWorldMatrix(), this._localX);
        BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Y, this.getWorldMatrix(), this._localY);
        BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Z, this.getWorldMatrix(), this._localZ);
        this._cool -= this._dt;
        this._cool = Math.max(0, this._cool);
        if (!(Main.State === State.Game)) {
            return;
        }
        if (this.controler) {
            this.controler.checkInputs(this._dt);
        }
        if (this.isAlive) {
            this._forward += this.forwardInput * this._enginePower * this._dt;
            this._yaw += this.yawInput * this._yawPower * this._dt;
            this._pitch += this.pitchInput * this._pitchPower * this._dt;
            this._roll += this.rollInput * this._rollPower * this._dt;
        }
        this._drag();
        let dZ = BABYLON.Vector3.Zero();
        dZ.copyFromFloats(this._localZ.x * this._forward * this._dt, this._localZ.y * this._forward * this._dt, this._localZ.z * this._forward * this._dt);
        this.position.addInPlace(dZ);
        BABYLON.Quaternion.RotationAxisToRef(this._localZ, -this.roll * this._dt, this._rZ);
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
    _drag() {
        this._roll = this.roll * (1 - this._rollDrag * this._dt);
        this._yaw = this.yaw * (1 - this._yawDrag * this._dt);
        this._pitch = this.pitch * (1 - this._pitchDrag * this._dt);
        let sqrForward = this.forward * this.forward;
        if (this.forward > 0) {
            this._forward -= this._frontDrag * sqrForward * this._dt;
        }
        else if (this.forward < 0) {
            this._forward += this._backDrag * sqrForward * this._dt;
        }
    }
    _updateColliders() {
        for (let i = 0; i < this._colliders.length; i++) {
            this._colliders[i]._update(this.getWorldMatrix());
        }
    }
    _collide() {
        if (this._mesh) {
            let tmpAxis = BABYLON.Vector3.Zero();
            let thisSphere = this._mesh.getBoundingInfo().boundingSphere;
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
        if (this._cool > 0) {
            return;
        }
        this._cool = this.cooldown;
        let dir = direction.clone();
        if (SpaceMath.Angle(dir, this.localZ) > Math.PI / 16) {
            let n = BABYLON.Vector3.Cross(this.localZ, dir);
            let m = BABYLON.Matrix.RotationAxis(n, Math.PI / 16);
            BABYLON.Vector3.TransformNormalToRef(this.localZ, m, dir);
        }
        let bullet = new Projectile(dir, this);
        bullet.instantiate();
    }
    wound(projectile) {
        this.hitPoint -= projectile.power;
        this.impactParticle.emitter = projectile.position.clone();
        this.impactParticle.manualEmitCount = 100;
        this.impactParticle.start();
        this.shield.flashAt(projectile.position, BABYLON.Space.WORLD);
        this.onWoundObservable.notifyObservers(projectile);
        if (this.hitPoint <= 0) {
            this.hitPoint = 0;
            this.isAlive = false;
        }
    }
}
class SpaceShipControler {
    constructor(spaceShip, role, team) {
        this._spaceShip = spaceShip;
        this._role = role;
        this._team = team;
        SpaceShipControler.Instances.push(this);
    }
    get spaceShip() {
        return this._spaceShip;
    }
    get role() {
        return this._role;
    }
    get team() {
        return this._team;
    }
    get position() {
        return this.spaceShip.position;
    }
}
SpaceShipControler.Instances = [];
var ISquadRole;
(function (ISquadRole) {
    ISquadRole[ISquadRole["Leader"] = 0] = "Leader";
    ISquadRole[ISquadRole["WingMan"] = 1] = "WingMan";
    ISquadRole[ISquadRole["Default"] = 2] = "Default";
})(ISquadRole || (ISquadRole = {}));
class SpaceShipFactory {
    static AddSpaceShipToScene(data, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            let spaceshipData = yield SpaceshipLoader.instance.get(data.url);
            let spaceShip = new SpaceShip(spaceshipData, Main.Scene);
            spaceShip.initialize(spaceshipData.model, () => {
                let spaceshipAI = new DefaultAI(spaceShip, data.role, data.team, scene);
                spaceShip.attachControler(spaceshipAI);
            });
            spaceShip.position.copyFromFloats(data.x, data.y, data.z);
            return spaceShip;
        });
    }
}
class SpaceShipInputs extends SpaceShipControler {
    constructor(spaceShip, scene) {
        super(spaceShip, ISquadRole.Leader, 0);
        this._active = false;
        this._forwardPow = Config.tmpPlayerSpeed;
        this._backwardPow = 10;
        this.wingMen = [];
        SpaceShipInputs.SSIInstances.push(this);
        this._spaceShip = spaceShip;
        this._scene = scene;
        this._loadPointer();
    }
    get spaceShipCamera() {
        if (!this._spaceShipCamera) {
            this._spaceShipCamera = this._scene.getCameraByName("SpaceShipCamera");
        }
        return this._spaceShipCamera;
    }
    _loadPointer() {
        BABYLON.SceneLoader.ImportMesh("", "./datas/target.babylon", "", Main.Scene, (meshes, particleSystems, skeletons) => {
            for (let i = 0; i < meshes.length; i++) {
                meshes[i].rotationQuaternion = BABYLON.Quaternion.Identity();
                meshes[i].material.alpha = 0;
                meshes[i].enableEdgesRendering();
                meshes[i].edgesColor.copyFromFloats(1, 1, 1, 1);
                meshes[i].edgesWidth = 2;
                if (meshes[i].name.indexOf("Cursor") !== -1) {
                    this._pointerCursor = meshes[i];
                    let anim = new BABYLON.Animation("popoff", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                    let keys = new Array();
                    keys.push({
                        frame: 0,
                        value: new BABYLON.Vector3(10, 10, 10)
                    });
                    keys.push({
                        frame: 60,
                        value: new BABYLON.Vector3(0.1, 0.1, 0.1)
                    });
                    anim.setKeys(keys);
                    anim.addEvent(new BABYLON.AnimationEvent(60, () => {
                        this._pointerCursor.isVisible = false;
                    }));
                    this._pointerCursor.animations.push(anim);
                }
                if (meshes[i].name.indexOf("Disc") !== -1) {
                    this._pointerDisc = meshes[i];
                    let anim = new BABYLON.Animation("popon", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                    let keys = new Array();
                    keys.push({
                        frame: 0,
                        value: new BABYLON.Vector3(0.1, 0.1, 0.1)
                    });
                    keys.push({
                        frame: 60,
                        value: new BABYLON.Vector3(10, 10, 10)
                    });
                    anim.setKeys(keys);
                    anim.addEvent(new BABYLON.AnimationEvent(60, () => {
                        this._pointerDisc.isVisible = false;
                    }));
                    this._pointerDisc.animations.push(anim);
                }
                meshes[i].isVisible = false;
            }
        });
    }
    attachControl(canvas) {
        this._canvas = canvas;
        canvas.addEventListener("keydown", (e) => {
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
        });
        canvas.addEventListener("keyup", (e) => {
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
            if (e.keyCode === 69) {
                this.commandWingManGoTo();
            }
        });
        canvas.addEventListener("pointerdown", (e) => {
            this._shoot = true;
        });
        canvas.addEventListener("pointerup", (e) => {
            this._shoot = false;
        });
        canvas.addEventListener("mouseover", (e) => {
            this._active = true;
        });
        canvas.addEventListener("mouseout", (e) => {
            this._active = false;
        });
    }
    commandWingManGoTo() {
        this._findWingMen();
        if (this.wingMen[0]) {
            let pick = this._scene.pick(this._scene.pointerX, this._scene.pointerY, (m) => {
                return m === this._spaceShip.focalPlane;
            });
            if (!pick.hit) {
                return;
            }
            this.wingMen[0].commandPosition(pick.pickedPoint);
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
    checkInputs(dt) {
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
            let pick = this._scene.pick(this._scene.pointerX, this._scene.pointerY, (m) => {
                return m === this._spaceShip.focalPlane;
            });
            if (pick.pickedPoint) {
                let dir = pick.pickedPoint.subtract(this.spaceShip.position).normalize();
                this.spaceShip.shoot(dir);
            }
        }
        let w = this._canvas.width;
        let h = this._canvas.height;
        let r = Math.min(w, h);
        r = r / 2;
        let x = (this._scene.pointerX - w / 2) / r;
        let y = (this._scene.pointerY - h / 2) / r;
        let mouseInput = new BABYLON.Vector2(x, y);
        this.updateUI(mouseInput);
        let power = mouseInput.length();
        if (power > 1) {
            mouseInput.x = mouseInput.x / power;
            mouseInput.y = mouseInput.y / power;
        }
        mouseInput.x = BABYLON.Scalar.Sign(mouseInput.x) * mouseInput.x * mouseInput.x;
        mouseInput.y = BABYLON.Scalar.Sign(mouseInput.y) * mouseInput.y * mouseInput.y;
        this._spaceShip.yawInput = mouseInput.x;
        this._spaceShip.pitchInput = mouseInput.y;
    }
    updateUI(mouseInput) {
        let w = this._canvas.width;
        let h = this._canvas.height;
        let r = Math.min(w, h);
        let size = r / 2;
        $("#target2").css("width", size + "px");
        $("#target2").css("height", size + "px");
        $("#target2").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 4);
        $("#target2").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 4);
        size = size / 2;
        $("#target3").css("width", size + "px");
        $("#target3").css("height", size + "px");
        $("#target3").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 2);
        $("#target3").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 2);
        let wSDisplay = parseInt($("#speed-display").css("width"), 10);
        let hSDisplay = parseInt($("#speed-display").css("height"), 10);
        let clip = 0.72 * hSDisplay - (this._spaceShip.forward) / 40 * 0.38 * hSDisplay;
        clip = Math.floor(clip);
        $("#speed-display").css("clip", "rect(" + clip + "px, " + wSDisplay + "px, " + hSDisplay + "px, 0px)");
    }
    _findWingMen() {
        for (let i = 0; i < SpaceShipControler.Instances.length; i++) {
            if (SpaceShipControler.Instances[i].team === this.team) {
                if (SpaceShipControler.Instances[i] instanceof WingManAI) {
                    if (this.wingMen.indexOf(SpaceShipControler.Instances[i]) === -1) {
                        this.wingMen.push(SpaceShipControler.Instances[i]);
                    }
                }
            }
        }
    }
}
SpaceShipInputs.SSIInstances = [];
/// <reference path="../SpaceShipControler.ts"/>
var IIABehaviour;
(function (IIABehaviour) {
    IIABehaviour[IIABehaviour["Track"] = 0] = "Track";
    IIABehaviour[IIABehaviour["Escape"] = 1] = "Escape";
    IIABehaviour[IIABehaviour["Follow"] = 2] = "Follow";
    IIABehaviour[IIABehaviour["GoTo"] = 3] = "GoTo";
})(IIABehaviour || (IIABehaviour = {}));
class SpaceShipAI extends SpaceShipControler {
    constructor(spaceShip, role, team, scene) {
        super(spaceShip, role, team);
        this._forwardPow = 15;
        this._scene = scene;
    }
    static FuturePosition(spaceship, delay) {
        let futurePosition = spaceship.localZ.clone();
        futurePosition.scaleInPlace(spaceship.forward * delay);
        futurePosition.addInPlace(spaceship.position);
        return futurePosition;
    }
}
/// <reference path="./SpaceShipAI.ts"/>
class AggroTableCell {
    constructor(spaceShipControler, aggro = 0) {
        this.spaceShipControler = spaceShipControler;
        this.aggro = aggro;
    }
}
class AggroTable {
    constructor() {
        this.cells = [];
    }
    get length() {
        return this.cells.length;
    }
    push(spaceShipControler, aggro = 0) {
        this.cells.push(new AggroTableCell(spaceShipControler, aggro));
    }
    get(spaceShipControler) {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].spaceShipControler === spaceShipControler) {
                return this.cells[i];
            }
        }
    }
    getAt(i) {
        return this.cells[i];
    }
    remove(spaceShipControler) {
        let index = this.indexOf(spaceShipControler);
        if (index !== -1) {
            this.removeAt(index);
        }
    }
    removeAt(i) {
        this.cells.splice(i, 1);
    }
    indexOf(spaceShipControler) {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].spaceShipControler === spaceShipControler) {
                return i;
            }
        }
        return -1;
    }
    sortStep() {
        for (let i = 0; i < this.cells.length - 1; i++) {
            let c0 = this.cells[i];
            let c1 = this.cells[i + 1];
            if (c1.aggro > c0.aggro * 1.1) {
                this.cells[i + 1] = c0;
                this.cells[i] = c1;
            }
        }
    }
}
class DefaultAI extends SpaceShipAI {
    constructor(spaceShip, role, team, scene) {
        super(spaceShip, role, team, scene);
        this._updateAggroTable = () => {
            SpaceShipControler.Instances.forEach((spaceShipControler) => {
                if (spaceShipControler.team !== this.team) {
                    if (this._aggroTable.indexOf(spaceShipControler) === -1) {
                        if (spaceShipControler instanceof SpaceShipInputs) {
                            this._aggroTable.push(spaceShipControler, 0);
                        }
                        else {
                            this._aggroTable.push(spaceShipControler, 10);
                        }
                    }
                }
            });
            let i = 0;
            while (i < this._aggroTable.length) {
                if (!this._aggroTable.getAt(i).spaceShipControler.spaceShip.isAlive) {
                    this._aggroTable.removeAt(i);
                }
                else {
                    i++;
                }
            }
            this._aggroTable.sortStep();
        };
        this.escapeDistance = 150;
        this._tmpEscapeDistance = 150;
        this._onWound = (projectile) => {
            let aggroCell = this._aggroTable.get(projectile.shooter.controler);
            if (aggroCell) {
                aggroCell.aggro += projectile.power;
            }
        };
        this._mode = IIABehaviour.Follow;
        this._aggroTable = new AggroTable();
        spaceShip.onWoundObservable.add(this._onWound);
    }
    findTarget() {
        this._updateAggroTable();
        let cell = this._aggroTable.getAt(0);
        if (cell) {
            return cell.spaceShipControler;
        }
    }
    projectileDuration(spaceship) {
        let dist = BABYLON.Vector3.Distance(this.position, spaceship.position);
        return dist / 150;
    }
    checkInputs(dt) {
        let target = this.findTarget();
        if (target) {
            let futureTargetPosition = DefaultAI.FuturePosition(target.spaceShip, this.projectileDuration(target.spaceShip));
            let distanceToTarget = BABYLON.Vector3.Distance(this.spaceShip.position, futureTargetPosition);
            let directionToTarget = futureTargetPosition.subtract(this.spaceShip.position).normalize();
            let angleToTarget = Math.acos(BABYLON.Vector3.Dot(directionToTarget, this.spaceShip.localZ));
            // Cas "Face à la cible"
            if (angleToTarget < Math.PI * 0.5) {
                this._tmpEscapeDistance = this.escapeDistance;
                if (angleToTarget < Math.PI / 16) {
                    this.spaceShip.shoot(directionToTarget);
                }
                if (distanceToTarget > 20) {
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._inputToPosition(target.position, dt);
                }
                else {
                    directionToTarget.scaleInPlace(-1);
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._fullThrust(dt);
                }
            }
            else {
                this._tmpEscapeDistance -= this.escapeDistance / 5 * dt;
                if (distanceToTarget > this._tmpEscapeDistance) {
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._inputToPosition(target.position, dt);
                }
                else {
                    directionToTarget.scaleInPlace(-1);
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._fullThrust(dt);
                }
            }
        }
    }
    _inputToPosition(position, dt) {
        let distance = BABYLON.Vector3.Distance(this._spaceShip.position, position);
        this._spaceShip.forwardInput = distance / 50;
    }
    _fullThrust(dt) {
        this._spaceShip.forwardInput = 1;
    }
    _inputToDirection(direction, up, dt) {
        let angleAroundY = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localY);
        this._spaceShip.yawInput = (angleAroundY - this._spaceShip.yaw * 0.25) / Math.PI * 20;
        let angleAroundX = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localX);
        this._spaceShip.pitchInput = (angleAroundX - this.spaceShip.pitch * 0.25) / Math.PI * 20;
        let angleAroundZ = SpaceMath.AngleFromToAround(up, this._spaceShip.localY, this._spaceShip.localZ);
        this._spaceShip.rollInput = (angleAroundZ - this.spaceShip.roll * 0.25) / Math.PI;
    }
}
class WingManAI extends SpaceShipAI {
    constructor(spaceShip, groupPosition, role, team, scene) {
        super(spaceShip, role, team, scene);
        this._targetPosition = BABYLON.Vector3.Zero();
        this._direction = new BABYLON.Vector3(0, 0, 1);
        this._distance = 1;
        this._groupPosition = groupPosition;
        this._mode = IIABehaviour.Follow;
    }
    checkInputs(dt) {
        this._checkMode(dt);
        this._goTo(dt);
    }
    commandPosition(newPosition) {
        this._targetPosition.copyFrom(newPosition);
        this._mode = IIABehaviour.GoTo;
        Comlink.Display(this.spaceShip.name, Dialogs.randomNeutralCommand());
    }
    _checkMode(dt) {
        this._findLeader();
        if (!this._leader) {
            return;
        }
        if (this._mode === IIABehaviour.Follow) {
            this._targetPosition.copyFrom(this._groupPosition);
            BABYLON.Vector3.TransformCoordinatesToRef(this._targetPosition, this._leader.spaceShip.getWorldMatrix(), this._targetPosition);
            this._direction.copyFrom(this._targetPosition);
            this._direction.subtractInPlace(this._spaceShip.position);
            this._distance = this._direction.length();
            this._direction.normalize();
            if (this._distance < 10) {
                this._targetPosition.copyFromFloats(-this._groupPosition.x, this._groupPosition.y, this._groupPosition.z);
                BABYLON.Vector3.TransformCoordinatesToRef(this._targetPosition, this._leader.spaceShip.getWorldMatrix(), this._targetPosition);
                this._mode = IIABehaviour.GoTo;
            }
        }
        else if (this._mode === IIABehaviour.GoTo) {
            this._direction.copyFrom(this._targetPosition);
            this._direction.subtractInPlace(this._spaceShip.position);
            this._distance = this._direction.length();
            this._direction.normalize();
            if (this._distance < 10) {
                this._mode = IIABehaviour.Follow;
            }
        }
        $("#behaviour").text(IIABehaviour[this._mode]);
    }
    _goTo(dt) {
        if (this._distance > 2 * this._spaceShip.forward) {
            this._spaceShip.forwardInput = 1;
        }
        let angleAroundY = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localY);
        this._spaceShip.yawInput = angleAroundY / Math.PI;
        let angleAroundX = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localX);
        this._spaceShip.pitchInput = angleAroundX / Math.PI;
        let angleAroundZ = SpaceMath.AngleFromToAround(this._leader.spaceShip.localY, this._spaceShip.localY, this._spaceShip.localZ);
        this._spaceShip.rollInput = angleAroundZ / Math.PI;
    }
    _findLeader() {
        for (let i = 0; i < SpaceShipControler.Instances.length; i++) {
            if (SpaceShipControler.Instances[i].team === this.team) {
                if (SpaceShipControler.Instances[i].role === ISquadRole.Leader) {
                    this._leader = SpaceShipControler.Instances[i];
                }
            }
        }
    }
}
class SectionLevel {
    constructor(section) {
        this.name = "NewLevel";
        this.section = section;
    }
    get joinedLevels() {
        if (!this._joinedLevels) {
            this._joinedLevels = [];
            for (let i = 0; i < this._joinedLevelsIds.length; i++) {
                this._joinedLevels.push(SectionLevel.SectionLevels.get(this._joinedLevelsIds[i]));
            }
        }
        return this._joinedLevels;
    }
    get scene() {
        return this.section.scene;
    }
    load(data, callback) {
        console.log("Load Level");
        this.name = data.name;
        this.index = data.index;
        this.level = data.level;
        this._joinedLevelsIds = data.joinedLevels;
        SectionLevel.SectionLevels.set(this.index, this);
    }
    above() {
        if (this.section) {
            return this.section.levels[this.level + 1];
        }
        return undefined;
    }
    below() {
        if (this.section) {
            return this.section.levels[this.level - 1];
        }
        return undefined;
    }
    instantiate(callback) {
        if (this.instance) {
            if (callback) {
                callback();
            }
            return;
        }
        MeshLoader.instance.get("SectionLevels/" + this.name, (mesh) => {
            if (!mesh) {
                console.warn("Could not instance " + this.name);
            }
            this.instance = mesh;
            this.instance.position.copyFrom(this.section.position);
            this.instance.rotation.copyFrom(this.section.rotation);
            this.instance.id = this.index + "";
            if (callback) {
                callback();
            }
        });
    }
    static InstantiateRecursively(levels, callback) {
        let level = levels.pop();
        if (level) {
            level.instantiate(() => {
                SectionLevel.InstantiateRecursively(levels, callback);
            });
        }
        else {
            if (callback) {
                callback();
            }
        }
    }
    disposeInstance() {
        if (this.instance) {
            this.instance.dispose();
        }
        this.instance = undefined;
    }
}
SectionLevel.SectionLevels = new Map();
class Station {
    constructor() {
        this.name = "NewStation";
        this.sections = [];
        this.lines = [];
    }
    load(data, callback) {
        this.name = data.name;
        this.index = data.index;
        for (let i = 0; i < data.sections.length; i++) {
            let section = new StationSection(this);
            section.load(data.sections[i]);
            this.sections[i] = section;
        }
        for (let i = 0; i < data.lines.length; i++) {
            let line = new MetroLine();
            line.load(data.lines[i]);
            this.lines[i] = line;
            let t0 = 0;
            if (i === 0) {
                t0 = 450;
            }
            let metro1 = new Metro(line, t0);
            metro1.instantiate();
        }
    }
    instantiate(scene, callback) {
        this.scene = scene;
        let sections = [];
        for (let i = 0; i < this.sections.length; i++) {
            sections.push(this.sections[i]);
        }
        StationSection.InstantiateRecursively(sections, -1, callback);
    }
}
class EasyGUID {
    static GetNewGUID() {
        EasyGUID._current++;
        return EasyGUID._current;
    }
}
EasyGUID._current = 0;
class MetroLineData {
    constructor() {
        this.path = [];
    }
}
class LevelData {
}
class SectionData {
    constructor() {
        this.levels = [];
    }
}
class StationData {
    constructor() {
        this.sections = [];
        this.lines = [];
    }
}
class Test {
    static ConnectLevels(level1, level2) {
        level1.joinedLevels.push(level2.index);
        level2.joinedLevels.push(level1.index);
    }
    static ConnectSections(section1, section2) {
        Test.ConnectLevels(section1.outer, section2.outer);
        Test.ConnectLevels(section1.levels[0], section2.levels[0]);
        Test.ConnectLevels(section1.levels[1], section2.levels[1]);
    }
    static TestDataTwo() {
        let data = new StationData();
        data.name = "TestTwo";
        data.index = EasyGUID.GetNewGUID();
        data.lines[0] = new MetroLineData();
        data.lines[0].name = "MetroLine-0";
        data.lines[0].index = EasyGUID.GetNewGUID();
        data.lines[0].path = [
            new BABYLON.Vector3(-1.5214, 199.39, -13.066),
            new BABYLON.Vector3(1.4907, 198.2007, -26.0936),
            new BABYLON.Vector3(1.5, 195.6295, -41.5823),
            new BABYLON.Vector3(1.5, 190.2113, -61.8034),
            new BABYLON.Vector3(1.5, 182.7091, -81.3473),
            new BABYLON.Vector3(1.5, 173.2051, -100),
            new BABYLON.Vector3(1.5, 161.8034, -117.5571),
            new BABYLON.Vector3(1.5, 148.629, -133.8261),
            new BABYLON.Vector3(1.5, 133.8261, -148.629),
            new BABYLON.Vector3(1.5, 117.5571, -161.8034),
            new BABYLON.Vector3(1.5, 100, -173.2051),
            new BABYLON.Vector3(1.5, 81.3473, -182.7091),
            new BABYLON.Vector3(1.5, 61.8034, -190.2113),
            new BABYLON.Vector3(1.5, 41.5823, -195.6295),
            new BABYLON.Vector3(1.5, 20.9057, -198.9044),
            new BABYLON.Vector3(1.5, 0, -200),
            new BABYLON.Vector3(1.5, -20.9057, -198.9044),
            new BABYLON.Vector3(1.5, -41.5823, -195.6295),
            new BABYLON.Vector3(1.5, -61.8034, -190.2113),
            new BABYLON.Vector3(1.5, -81.3474, -182.7091),
            new BABYLON.Vector3(1.5, -100, -173.2051),
            new BABYLON.Vector3(1.5, -117.5571, -161.8034),
            new BABYLON.Vector3(1.5, -133.8261, -148.629),
            new BABYLON.Vector3(1.5, -148.629, -133.8261),
            new BABYLON.Vector3(1.5, -161.8034, -117.5571),
            new BABYLON.Vector3(1.5, -173.2051, -100),
            new BABYLON.Vector3(1.5, -182.7091, -81.3473),
            new BABYLON.Vector3(1.5, -190.2113, -61.8034),
            new BABYLON.Vector3(1.5, -195.6295, -41.5823),
            new BABYLON.Vector3(1.5033, -198.2007, -26.0936),
            new BABYLON.Vector3(4.2298, -199.2822, -14.1952),
            new BABYLON.Vector3(14.1952, -199.2822, -4.2298),
            new BABYLON.Vector3(26.0936, -198.2007, -1.5033),
            new BABYLON.Vector3(41.5823, -195.6295, -1.5),
            new BABYLON.Vector3(61.8034, -190.2113, -1.5),
            new BABYLON.Vector3(81.3473, -182.709, -1.5),
            new BABYLON.Vector3(100, -173.205, -1.5),
            new BABYLON.Vector3(117.5571, -161.8033, -1.5),
            new BABYLON.Vector3(133.8261, -148.6289, -1.5),
            new BABYLON.Vector3(148.629, -133.8261, -1.5),
            new BABYLON.Vector3(161.8034, -117.557, -1.5),
            new BABYLON.Vector3(173.2051, -100, -1.5),
            new BABYLON.Vector3(182.7091, -81.3473, -1.5),
            new BABYLON.Vector3(190.2113, -61.8034, -1.5),
            new BABYLON.Vector3(195.6295, -41.5823, -1.5),
            new BABYLON.Vector3(198.9044, -20.9057, -1.5),
            new BABYLON.Vector3(200, 0, -1.5),
            new BABYLON.Vector3(198.9044, 20.9057, -1.5),
            new BABYLON.Vector3(195.6295, 41.5823, -1.5),
            new BABYLON.Vector3(190.2113, 61.8034, -1.5),
            new BABYLON.Vector3(182.7091, 81.3473, -1.5),
            new BABYLON.Vector3(173.2051, 100, -1.5),
            new BABYLON.Vector3(161.8034, 117.557, -1.5),
            new BABYLON.Vector3(148.629, 133.8261, -1.5),
            new BABYLON.Vector3(133.8261, 148.6289, -1.5),
            new BABYLON.Vector3(117.5571, 161.8034, -1.5),
            new BABYLON.Vector3(100, 173.205, -1.5),
            new BABYLON.Vector3(81.3473, 182.7091, -1.5),
            new BABYLON.Vector3(61.8034, 190.2113, -1.5),
            new BABYLON.Vector3(41.5823, 195.6295, -1.5),
            new BABYLON.Vector3(26.0936, 198.2007, -1.5),
            new BABYLON.Vector3(13.066, 199.39, 1.5214),
            new BABYLON.Vector3(1.5213, 199.39, 13.066),
            new BABYLON.Vector3(-1.4907, 198.2007, 26.0936),
            new BABYLON.Vector3(-1.5, 195.6295, 41.5823),
            new BABYLON.Vector3(-1.5, 190.2113, 61.8034),
            new BABYLON.Vector3(-1.5, 182.7091, 81.3473),
            new BABYLON.Vector3(-1.5, 173.2051, 100),
            new BABYLON.Vector3(-1.5, 161.8034, 117.5571),
            new BABYLON.Vector3(-1.5, 148.6289, 133.8261),
            new BABYLON.Vector3(-1.5, 133.8261, 148.629),
            new BABYLON.Vector3(-1.5, 117.557, 161.8034),
            new BABYLON.Vector3(-1.5, 100, 173.2051),
            new BABYLON.Vector3(-1.5, 81.3473, 182.7091),
            new BABYLON.Vector3(-1.5, 61.8034, 190.2113),
            new BABYLON.Vector3(-1.5, 41.5823, 195.6295),
            new BABYLON.Vector3(-1.5, 20.9057, 198.9044),
            new BABYLON.Vector3(-1.5, 0, 200),
            new BABYLON.Vector3(-1.5, -20.9057, 198.9044),
            new BABYLON.Vector3(-1.5, -41.5823, 195.6295),
            new BABYLON.Vector3(-1.5, -61.8034, 190.2113),
            new BABYLON.Vector3(-1.5, -81.3474, 182.7091),
            new BABYLON.Vector3(-1.5, -100, 173.2051),
            new BABYLON.Vector3(-1.5, -117.5571, 161.8034),
            new BABYLON.Vector3(-1.5, -133.8261, 148.629),
            new BABYLON.Vector3(-1.5, -148.629, 133.8261),
            new BABYLON.Vector3(-1.5, -161.8034, 117.5571),
            new BABYLON.Vector3(-1.5, -173.205, 100),
            new BABYLON.Vector3(-1.5, -182.7091, 81.3473),
            new BABYLON.Vector3(-1.5, -190.2113, 61.8034),
            new BABYLON.Vector3(-1.5, -195.6295, 41.5823),
            new BABYLON.Vector3(-1.5033, -198.2007, 26.0936),
            new BABYLON.Vector3(-4.2298, -199.2822, 14.1952),
            new BABYLON.Vector3(-14.1952, -199.2822, 4.2298),
            new BABYLON.Vector3(-26.0936, -198.2007, 1.5033),
            new BABYLON.Vector3(-41.5823, -195.6295, 1.5),
            new BABYLON.Vector3(-61.8034, -190.2113, 1.5),
            new BABYLON.Vector3(-81.3473, -182.7091, 1.5),
            new BABYLON.Vector3(-100, -173.2051, 1.5),
            new BABYLON.Vector3(-117.5571, -161.8034, 1.5),
            new BABYLON.Vector3(-133.8261, -148.629, 1.5),
            new BABYLON.Vector3(-148.629, -133.8261, 1.5),
            new BABYLON.Vector3(-161.8034, -117.5571, 1.5),
            new BABYLON.Vector3(-173.2051, -100, 1.5),
            new BABYLON.Vector3(-182.7091, -81.3474, 1.5),
            new BABYLON.Vector3(-190.2113, -61.8034, 1.5),
            new BABYLON.Vector3(-195.6295, -41.5823, 1.5),
            new BABYLON.Vector3(-198.9044, -20.9057, 1.5),
            new BABYLON.Vector3(-200, 0, 1.5),
            new BABYLON.Vector3(-198.9044, 20.9057, 1.5),
            new BABYLON.Vector3(-195.6295, 41.5823, 1.5),
            new BABYLON.Vector3(-190.2113, 61.8034, 1.5),
            new BABYLON.Vector3(-182.7091, 81.3473, 1.5),
            new BABYLON.Vector3(-173.2051, 100, 1.5),
            new BABYLON.Vector3(-161.8034, 117.557, 1.5),
            new BABYLON.Vector3(-148.629, 133.8261, 1.5),
            new BABYLON.Vector3(-133.8261, 148.629, 1.5),
            new BABYLON.Vector3(-117.5571, 161.8034, 1.5),
            new BABYLON.Vector3(-100, 173.2051, 1.5),
            new BABYLON.Vector3(-81.3473, 182.7091, 1.5),
            new BABYLON.Vector3(-61.8034, 190.2113, 1.5),
            new BABYLON.Vector3(-41.5823, 195.6295, 1.5),
            new BABYLON.Vector3(-26.0936, 198.2007, 1.5),
            new BABYLON.Vector3(-13.066, 199.39, -1.5214)
        ];
        /*
        data.lines[1] = new MetroLineData();
        data.lines[1].name = "MetroLine-1"
        data.lines[1].index = EasyGUID.GetNewGUID();
        data.lines[1].path = [
            new BABYLON.Vector3(-4.2298, 199.2822, -14.1952),
            new BABYLON.Vector3(-14.1952, 199.2822, -4.2298),
            new BABYLON.Vector3(-26.0936, 198.2007, -1.5033),
            new BABYLON.Vector3(-41.5823, 195.6295, -1.5),
            new BABYLON.Vector3(-61.8034, 190.2113, -1.5),
            new BABYLON.Vector3(-81.3473, 182.7091, -1.5),
            new BABYLON.Vector3(-100, 173.2051, -1.5),
            new BABYLON.Vector3(-117.5571, 161.8034, -1.5),
            new BABYLON.Vector3(-133.8261, 148.629, -1.5),
            new BABYLON.Vector3(-148.629, 133.8261, -1.5),
            new BABYLON.Vector3(-161.8034, 117.557, -1.5),
            new BABYLON.Vector3(-173.2051, 100, -1.5),
            new BABYLON.Vector3(-182.7091, 81.3473, -1.5),
            new BABYLON.Vector3(-190.2113, 61.8034, -1.5),
            new BABYLON.Vector3(-195.6295, 41.5823, -1.5),
            new BABYLON.Vector3(-198.9044, 20.9057, -1.5),
            new BABYLON.Vector3(-200, 0, -1.5),
            new BABYLON.Vector3(-198.9044, -20.9057, -1.5),
            new BABYLON.Vector3(-195.6295, -41.5823, -1.5),
            new BABYLON.Vector3(-190.2113, -61.8034, -1.5),
            new BABYLON.Vector3(-182.7091, -81.3474, -1.5),
            new BABYLON.Vector3(-173.2051, -100, -1.5),
            new BABYLON.Vector3(-161.8034, -117.5571, -1.5),
            new BABYLON.Vector3(-148.629, -133.8261, -1.5),
            new BABYLON.Vector3(-133.8261, -148.629, -1.5),
            new BABYLON.Vector3(-117.5571, -161.8034, -1.5),
            new BABYLON.Vector3(-100, -173.2051, -1.5),
            new BABYLON.Vector3(-81.3473, -182.7091, -1.5),
            new BABYLON.Vector3(-61.8034, -190.2113, -1.5),
            new BABYLON.Vector3(-41.5823, -195.6295, -1.5),
            new BABYLON.Vector3(-26.0936, -198.2007, -1.5),
            new BABYLON.Vector3(-13.066, -199.39, 1.5214),
            new BABYLON.Vector3(-1.5214, -199.39, 13.066),
            new BABYLON.Vector3(1.4907, -198.2007, 26.0936),
            new BABYLON.Vector3(1.5, -195.6295, 41.5823),
            new BABYLON.Vector3(1.5, -190.2113, 61.8034),
            new BABYLON.Vector3(1.5, -182.7091, 81.3473),
            new BABYLON.Vector3(1.5, -173.205, 100),
            new BABYLON.Vector3(1.5, -161.8034, 117.5571),
            new BABYLON.Vector3(1.5, -148.629, 133.8261),
            new BABYLON.Vector3(1.5, -133.8261, 148.629),
            new BABYLON.Vector3(1.5, -117.5571, 161.8034),
            new BABYLON.Vector3(1.5, -100, 173.2051),
            new BABYLON.Vector3(1.5, -81.3474, 182.7091),
            new BABYLON.Vector3(1.5, -61.8034, 190.2113),
            new BABYLON.Vector3(1.5, -41.5823, 195.6295),
            new BABYLON.Vector3(1.5, -20.9057, 198.9044),
            new BABYLON.Vector3(1.5, 0, 200),
            new BABYLON.Vector3(1.5, 20.9057, 198.9044),
            new BABYLON.Vector3(1.5, 41.5823, 195.6295),
            new BABYLON.Vector3(1.5, 61.8034, 190.2113),
            new BABYLON.Vector3(1.5, 81.3473, 182.7091),
            new BABYLON.Vector3(1.5, 100, 173.2051),
            new BABYLON.Vector3(1.5, 117.557, 161.8034),
            new BABYLON.Vector3(1.5, 133.8261, 148.629),
            new BABYLON.Vector3(1.5, 148.6289, 133.8261),
            new BABYLON.Vector3(1.5, 161.8034, 117.5571),
            new BABYLON.Vector3(1.5, 173.2051, 100),
            new BABYLON.Vector3(1.5, 182.7091, 81.3473),
            new BABYLON.Vector3(1.5, 190.2113, 61.8034),
            new BABYLON.Vector3(1.5, 195.6295, 41.5823),
            new BABYLON.Vector3(1.5033, 198.2007, 26.0936),
            new BABYLON.Vector3(4.2298, 199.2822, 14.1952),
            new BABYLON.Vector3(14.1952, 199.2822, 4.2298),
            new BABYLON.Vector3(26.0936, 198.2007, 1.5033),
            new BABYLON.Vector3(41.5823, 195.6295, 1.5),
            new BABYLON.Vector3(61.8034, 190.2113, 1.5),
            new BABYLON.Vector3(81.3473, 182.7091, 1.5),
            new BABYLON.Vector3(100, 173.205, 1.5),
            new BABYLON.Vector3(117.5571, 161.8034, 1.5),
            new BABYLON.Vector3(133.8261, 148.6289, 1.5),
            new BABYLON.Vector3(148.629, 133.8261, 1.5),
            new BABYLON.Vector3(161.8034, 117.557, 1.5),
            new BABYLON.Vector3(173.2051, 100, 1.5),
            new BABYLON.Vector3(182.7091, 81.3473, 1.5),
            new BABYLON.Vector3(190.2113, 61.8034, 1.5),
            new BABYLON.Vector3(195.6295, 41.5823, 1.5),
            new BABYLON.Vector3(198.9044, 20.9057, 1.5),
            new BABYLON.Vector3(200, 0, 1.5),
            new BABYLON.Vector3(198.9044, -20.9057, 1.5),
            new BABYLON.Vector3(195.6295, -41.5823, 1.5),
            new BABYLON.Vector3(190.2113, -61.8034, 1.5),
            new BABYLON.Vector3(182.7091, -81.3473, 1.5),
            new BABYLON.Vector3(173.2051, -100, 1.5),
            new BABYLON.Vector3(161.8034, -117.557, 1.5),
            new BABYLON.Vector3(148.629, -133.8261, 1.5),
            new BABYLON.Vector3(133.8261, -148.6289, 1.5),
            new BABYLON.Vector3(117.5571, -161.8033, 1.5),
            new BABYLON.Vector3(100, -173.205, 1.5),
            new BABYLON.Vector3(81.3473, -182.709, 1.5),
            new BABYLON.Vector3(61.8034, -190.2113, 1.5),
            new BABYLON.Vector3(41.5823, -195.6295, 1.5),
            new BABYLON.Vector3(26.0936, -198.2007, 1.5),
            new BABYLON.Vector3(13.066, -199.39, -1.5213),
            new BABYLON.Vector3(1.5213, -199.39, -13.066),
            new BABYLON.Vector3(-1.4907, -198.2007, -26.0936),
            new BABYLON.Vector3(-1.5, -195.6295, -41.5823),
            new BABYLON.Vector3(-1.5, -190.2113, -61.8034),
            new BABYLON.Vector3(-1.5, -182.7091, -81.3473),
            new BABYLON.Vector3(-1.5, -173.2051, -100),
            new BABYLON.Vector3(-1.5, -161.8034, -117.5571),
            new BABYLON.Vector3(-1.5, -148.629, -133.8261),
            new BABYLON.Vector3(-1.5, -133.8261, -148.629),
            new BABYLON.Vector3(-1.5, -117.5571, -161.8034),
            new BABYLON.Vector3(-1.5, -100, -173.2051),
            new BABYLON.Vector3(-1.5, -81.3474, -182.7091),
            new BABYLON.Vector3(-1.5, -61.8034, -190.2113),
            new BABYLON.Vector3(-1.5, -41.5823, -195.6295),
            new BABYLON.Vector3(-1.5, -20.9057, -198.9044),
            new BABYLON.Vector3(-1.5, 0, -200),
            new BABYLON.Vector3(-1.5, 20.9057, -198.9044),
            new BABYLON.Vector3(-1.5, 41.5823, -195.6295),
            new BABYLON.Vector3(-1.5, 61.8034, -190.2113),
            new BABYLON.Vector3(-1.5, 81.3473, -182.7091),
            new BABYLON.Vector3(-1.5, 100, -173.2051),
            new BABYLON.Vector3(-1.5, 117.5571, -161.8034),
            new BABYLON.Vector3(-1.5, 133.8261, -148.629),
            new BABYLON.Vector3(-1.5, 148.629, -133.8261),
            new BABYLON.Vector3(-1.5, 161.8034, -117.5571),
            new BABYLON.Vector3(-1.5, 173.2051, -100),
            new BABYLON.Vector3(-1.5, 182.7091, -81.3473),
            new BABYLON.Vector3(-1.5, 190.2113, -61.8034),
            new BABYLON.Vector3(-1.5, 195.6295, -41.5823),
            new BABYLON.Vector3(-1.5033, 198.2007, -26.0936)
        ]
        */
        let rotationMatrixZero = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, 12 / 180 * Math.PI);
        let rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, 6 / 180 * Math.PI);
        let hubTop = new SectionData();
        hubTop.name = "Section-" + 0;
        hubTop.index = EasyGUID.GetNewGUID();
        hubTop.outer = {
            name: "hub-outer",
            index: EasyGUID.GetNewGUID(),
            level: -1,
            joinedLevels: []
        };
        hubTop.levels = [
            {
                name: "hub-level-0",
                index: EasyGUID.GetNewGUID(),
                level: 0,
                joinedLevels: []
            },
            {
                name: "hub-level-1",
                index: EasyGUID.GetNewGUID(),
                level: 1,
                joinedLevels: []
            }
        ];
        hubTop.position = new BABYLON.Vector3(0, 200, 0);
        hubTop.rotation = new BABYLON.Vector3(0, 0, 0);
        data.sections[0] = hubTop;
        let hubBottom = new SectionData();
        hubBottom.name = "Section-" + 0;
        hubBottom.index = EasyGUID.GetNewGUID();
        hubBottom.outer = {
            name: "hub-outer",
            index: EasyGUID.GetNewGUID(),
            level: -1,
            joinedLevels: []
        };
        hubBottom.levels = [
            {
                name: "hub-level-0",
                index: EasyGUID.GetNewGUID(),
                level: 0,
                joinedLevels: []
            },
            {
                name: "hub-level-1",
                index: EasyGUID.GetNewGUID(),
                level: 1,
                joinedLevels: []
            }
        ];
        hubBottom.position = new BABYLON.Vector3(0, -200, 0);
        hubBottom.rotation = new BABYLON.Vector3(Math.PI, Math.PI / 2, 0);
        data.sections[1] = hubBottom;
        for (let j = 0; j < 4; j++) {
            if (j === 1) {
                rotationMatrixZero = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, 12 / 180 * Math.PI);
                rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, 6 / 180 * Math.PI);
            }
            if (j === 2) {
                rotationMatrixZero = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, -12 / 180 * Math.PI);
                rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, -6 / 180 * Math.PI);
            }
            if (j === 3) {
                rotationMatrixZero = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, -12 / 180 * Math.PI);
                rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, -6 / 180 * Math.PI);
            }
            for (let i = 0; i < 27; i++) {
                let index = i + 2 + j * 27;
                let section = new SectionData();
                section.name = "Section-" + i;
                section.index = EasyGUID.GetNewGUID();
                section.outer = {
                    name: "way-outer",
                    index: EasyGUID.GetNewGUID(),
                    level: -1,
                    joinedLevels: []
                };
                section.levels = [
                    {
                        name: "way-level-0",
                        index: EasyGUID.GetNewGUID(),
                        level: 0,
                        joinedLevels: []
                    },
                    {
                        name: "way-level-1",
                        index: EasyGUID.GetNewGUID(),
                        level: 1,
                        joinedLevels: []
                    }
                ];
                if (i === 0) {
                    section.position = BABYLON.Vector3.TransformCoordinates(data.sections[0].position, rotationMatrixZero);
                }
                else {
                    section.position = BABYLON.Vector3.TransformCoordinates(data.sections[index - 1].position, rotationMatrix);
                }
                if (j === 0) {
                    section.rotation = new BABYLON.Vector3(12 / 180 * Math.PI + i * (6 / 180 * Math.PI), 0, 0);
                }
                else if (j === 1) {
                    let flip = 1;
                    if (i % 2 === 0) {
                        flip = -1;
                    }
                    let rY = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, flip * Math.PI / 2);
                    let rZ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, 12 / 180 * Math.PI + i * (6 / 180 * Math.PI));
                    section.rotation = rZ.multiply(rY).toEulerAngles();
                }
                else if (j === 2) {
                    section.rotation = new BABYLON.Vector3(-12 / 180 * Math.PI - i * (6 / 180 * Math.PI), 0, 0);
                }
                else if (j === 3) {
                    let flip = 1;
                    if (i % 2 === 0) {
                        flip = -1;
                    }
                    let rY = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, flip * Math.PI / 2);
                    let rZ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, -12 / 180 * Math.PI - i * (6 / 180 * Math.PI));
                    section.rotation = rZ.multiply(rY).toEulerAngles();
                }
                data.sections[index] = section;
            }
            Test.ConnectSections(hubTop, data.sections[2 + j * 27]);
            Test.ConnectSections(hubBottom, data.sections[28 + j * 27]);
            for (let i = 0; i < 26; i++) {
                Test.ConnectSections(data.sections[2 + i + j * 27], data.sections[2 + i + 1 + j * 27]);
            }
        }
        return data;
    }
    static TestDataOne() {
        let data = new StationData();
        data.name = "TestOne";
        data.index = EasyGUID.GetNewGUID();
        let rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, 2 * Math.PI / 30);
        let sectionZero = new SectionData();
        sectionZero.name = "Section-" + 0;
        sectionZero.index = EasyGUID.GetNewGUID();
        sectionZero.outer = {
            name: "outer",
            index: EasyGUID.GetNewGUID(),
            level: -1,
            joinedLevels: []
        };
        sectionZero.levels = [
            {
                name: "Level-0",
                index: EasyGUID.GetNewGUID(),
                level: 0,
                joinedLevels: []
            },
            {
                name: "Level-1",
                index: EasyGUID.GetNewGUID(),
                level: 1,
                joinedLevels: []
            }
        ];
        sectionZero.position = new BABYLON.Vector3(0, 150, 0);
        sectionZero.rotation = new BABYLON.Vector3(0, 0, 0);
        data.sections[0] = sectionZero;
        for (let i = 1; i < 30; i++) {
            let section = new SectionData();
            section.name = "Section-" + i;
            section.index = EasyGUID.GetNewGUID();
            section.outer = {
                name: "outer",
                index: EasyGUID.GetNewGUID(),
                level: -1,
                joinedLevels: []
            };
            section.levels = [
                {
                    name: "level-0",
                    index: EasyGUID.GetNewGUID(),
                    level: 0,
                    joinedLevels: []
                },
                {
                    name: "level-1",
                    index: EasyGUID.GetNewGUID(),
                    level: 1,
                    joinedLevels: []
                }
            ];
            section.position = BABYLON.Vector3.TransformCoordinates(data.sections[i - 1].position, rotationMatrix);
            section.rotation = new BABYLON.Vector3(2 * Math.PI / 30 * i, 0, 0);
            data.sections[i] = section;
        }
        for (let i = 0; i < 30; i++) {
            let previousSection = data.sections[(i - 1 + 30) % 30];
            let section = data.sections[i];
            let nextSection = data.sections[(i + 1) % 30];
            section.outer.joinedLevels.push(previousSection.outer.index);
            section.outer.joinedLevels.push(nextSection.outer.index);
            for (let j = 0; j < section.levels.length; j++) {
                section.levels[j].joinedLevels.push(previousSection.levels[j].index);
                section.levels[j].joinedLevels.push(nextSection.levels[j].index);
            }
        }
        return data;
    }
}
class StationLoadManager {
    constructor(character) {
        this.updateLoad = () => {
            let currentLevel = this._character.currentLevel();
            if (currentLevel && currentLevel !== this._lastLevel) {
                // mark previously loaded sections for disposal (outer only instantiation)
                let needDisposal = [];
                if (this._lastLevel) {
                    needDisposal.push(this._lastLevel.section);
                    this._lastLevel.joinedLevels.forEach((lastJoinedLevel) => {
                        if (needDisposal.indexOf(lastJoinedLevel.section) === -1) {
                            needDisposal.push(lastJoinedLevel.section);
                        }
                    });
                }
                // unmark current level section for disposal
                let currentSectionIndex = needDisposal.indexOf(currentLevel.section);
                if (currentSectionIndex !== -1) {
                    needDisposal.splice(currentSectionIndex, 1);
                }
                currentLevel.section.instantiate(currentLevel.level);
                currentLevel.joinedLevels.forEach((joinedLevel) => {
                    joinedLevel.section.instantiate(joinedLevel.level);
                    // unmark joinded level section for disposal
                    let joindedLevelSectionIndex = needDisposal.indexOf(joinedLevel.section);
                    if (joindedLevelSectionIndex !== -1) {
                        needDisposal.splice(joindedLevelSectionIndex, 1);
                    }
                });
                // dispose sections still marked for disposal
                needDisposal.forEach((section) => {
                    section.instantiate(-1);
                });
            }
            this._lastLevel = currentLevel;
        };
        this._character = character;
        this._character.scene.registerBeforeRender(this.updateLoad);
    }
}
var LodLevel;
(function (LodLevel) {
    LodLevel[LodLevel["Outer"] = 0] = "Outer";
    LodLevel[LodLevel["Inner"] = 1] = "Inner";
})(LodLevel || (LodLevel = {}));
class StationSection {
    constructor(station) {
        this.name = "NewSection";
        this.levels = [];
        this.station = station;
    }
    get scene() {
        return this.station.scene;
    }
    load(data, callback) {
        console.log("Load Section");
        this.name = data.name;
        this.index = data.index;
        this.position = data.position.clone();
        this.rotation = data.rotation.clone();
        this.worldMatrix = BABYLON.Matrix.Compose(BABYLON.Vector3.One(), BABYLON.Quaternion.RotationYawPitchRoll(this.rotation.y, this.rotation.x, this.rotation.z), this.position);
        this.invertedWorldMatrix = BABYLON.Matrix.Invert(this.worldMatrix);
        this.outer = new SectionLevel(this);
        this.outer.load(data.outer);
        for (let i = 0; i < data.levels.length; i++) {
            let level = new SectionLevel(this);
            level.load(data.levels[i]);
            this.levels[i] = level;
        }
    }
    instantiate(level, callback) {
        if (level === -1) {
            for (let i = 0; i < this.levels.length; i++) {
                this.levels[i].disposeInstance();
            }
            this.outer.instantiate(callback);
        }
        else {
            this.outer.disposeInstance();
            for (let i = level + 1; i < this.levels.length; i++) {
                this.levels[i].disposeInstance();
            }
            let levels = [];
            for (let i = 0; i < this.levels.length && i <= level; i++) {
                levels.push(this.levels[i]);
            }
            SectionLevel.InstantiateRecursively(levels, callback);
        }
    }
    static InstantiateRecursively(sections, level, callback) {
        let station = sections.pop();
        if (station) {
            station.instantiate(level, () => {
                StationSection.InstantiateRecursively(sections, level, callback);
            });
        }
        else {
            if (callback) {
                callback();
            }
        }
    }
}
class SSMeshBuilder {
    static CreateZCircleMesh(radius, scene, color, updatable, instance) {
        let points = [];
        let colors = [];
        if (!color) {
            color = new BABYLON.Color4(1, 1, 1, 1);
        }
        for (let i = 0; i <= 32; i++) {
            points.push(new BABYLON.Vector3(radius * Math.cos(i / 32 * Math.PI * 2), radius * Math.sin(i / 32 * Math.PI * 2), 0));
            colors.push(color);
        }
        return BABYLON.MeshBuilder.CreateLines("zcircle", {
            points: points,
            colors: colors,
            updatable: updatable,
            instance: instance
        }, scene);
    }
    static CreateZRailMesh(radiusIn, radiusOut, alphaMin, alphaMax, tesselation, scene, color, updatable, instance) {
        let alphaLength = alphaMax - alphaMin;
        let count = Math.round(alphaLength * 64 / (Math.PI * 2));
        let step = alphaLength / count;
        let points = [];
        let colors = [];
        if (!color) {
            color = new BABYLON.Color4(1, 1, 1, 1);
        }
        for (let i = 0; i <= count; i++) {
            points.push(new BABYLON.Vector3(radiusIn * Math.cos(alphaMin + i * step), radiusIn * Math.sin(alphaMin + i * step), 0));
            colors.push(color);
        }
        for (let i = count; i >= 0; i--) {
            points.push(new BABYLON.Vector3(radiusOut * Math.cos(alphaMin + i * step), radiusOut * Math.sin(alphaMin + i * step), 0));
            colors.push(color);
        }
        points.push(points[0]);
        colors.push(colors[0]);
        return BABYLON.MeshBuilder.CreateLines("zcircle", {
            points: points,
            colors: colors,
            updatable: updatable,
            instance: instance
        }, scene);
    }
}
