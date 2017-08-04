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
        Config.activationSqrRange = 100000;
        Config.sceneLoaderDelay = 1;
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
    static LoadScene(name, scene, callback) {
        Main.Level = new Level0();
        $.ajax({
            url: "./datas/scenes/" + name + ".json",
            success: (data) => {
                Main.Scene.activeCamera = Main.MenuCamera;
                Main.MenuCamera.setPosition(new BABYLON.Vector3(data.cinematic.xCam, data.cinematic.yCam, data.cinematic.zCam));
                Loader.RunCinematic(data.cinematic);
                Loader._loadSceneData(data, scene, () => {
                    Main.Level.LoadLevel(scene);
                    if (callback) {
                        callback();
                    }
                });
            }
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
        Layout.ReadyLayout();
    }
    static _loadSceneData(data, scene, callback) {
        Loader.AddStaticsIntoScene(data.statics, scene, callback, Config.sceneLoaderDelay);
    }
    static _loadStatic(name, scene, callback) {
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
            if (callback) {
                callback(Loader.LoadedStatics.get(name));
            }
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
    static AddStaticsIntoScene(datas, scene, callback, delay = 0, index = 0) {
        if (datas[index]) {
            Loader.AddStaticIntoScene(datas[index], scene, () => {
                setTimeout(() => {
                    Loader.AddStaticsIntoScene(datas, scene, callback, delay, index + 1);
                }, delay);
            });
        }
        else {
            if (callback) {
                callback();
            }
        }
    }
    static AddStaticIntoScene(data, scene, callback) {
        if (Loader.LoadedStatics.get(data.name)) {
            Loader._cloneStaticIntoScene(Loader.LoadedStatics.get(data.name), data.x, data.y, data.z, data.s, data.rX, data.rY, data.rZ, callback);
        }
        else {
            Loader._loadStatic(data.name, scene, (loadedMeshes) => {
                Loader._cloneStaticIntoScene(loadedMeshes, data.x, data.y, data.z, data.s, data.rX, data.rY, data.rZ, callback);
            });
        }
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
    }
    static HideMenu() {
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
        Main._tmpPlayer = new SpaceShip("Player", Main.Scene);
        Main.GameCamera = new SpaceShipCamera(BABYLON.Vector3.Zero(), Main.Scene, Main._tmpPlayer);
        Main.GameCamera.attachSpaceShipControl(Main.Canvas);
        Main.GameCamera.setEnabled(false);
        Main._tmpPlayer.initialize("spaceship", () => {
            let playerControl = new SpaceShipInputs(Main._tmpPlayer, Main.Scene);
            Main._tmpPlayer.attachControler(playerControl);
            playerControl.attachControl(Main.Canvas);
        });
    }
    static TMPResetPlayer() {
        Main._tmpPlayer.position.copyFromFloats(0, 0, 0);
        Main._tmpPlayer.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
    static TMPCreateWingMan() {
        SpaceShipFactory.AddSpaceShipToScene({
            name: "Voyoslov",
            url: "spaceship",
            x: 0, y: 0, z: 30,
            team: 0,
            role: ISquadRole.WingMan
        }, Main.Scene, (spaceShip) => {
            Main._tmpWingMan = spaceShip;
        });
    }
    static TMPResetWingMan() {
        Main._tmpWingMan.position.copyFromFloats(0, 0, 30);
        Main._tmpWingMan.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
}
Main._state = State.Menu;
Main.playStart = 0;
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
    Menu.RegisterToUI();
    Intro.RunIntro();
    Main.TMPCreatePlayer();
    Main.TMPCreateWingMan();
});
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
        this._forwardPow = 10;
        this._rollPow = 2.5;
        this._yawPow = 3;
        this._pitchPow = 3;
        this._scene = scene;
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
            this._spaceShip.forward += this._forwardPow * dt;
        }
        let angleAroundY = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localY);
        let yawInput = BABYLON.MathTools.Clamp(angleAroundY / Math.PI, -1, 1);
        this._spaceShip.yaw += this._yawPow * yawInput * dt;
        let angleAroundX = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localX);
        let pitchInput = BABYLON.MathTools.Clamp(angleAroundX / Math.PI, -1, 1);
        this._spaceShip.pitch += this._pitchPow * pitchInput * dt;
        let angleAroundZ = SpaceMath.AngleFromToAround(this._leader.spaceShip.localY, this._spaceShip.localY, this._spaceShip.localZ);
        let rollInput = BABYLON.MathTools.Clamp(angleAroundZ / Math.PI, -1, 1);
        this._spaceShip.roll += this._rollPow * rollInput * dt;
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
class SpaceShip extends BABYLON.Mesh {
    constructor(name, scene) {
        super(name, scene);
        this._forwardDrag = 0.01;
        this._backwardDrag = 1;
        this._forward = 0;
        this._rollDrag = 0.9;
        this._roll = 0;
        this._yawDrag = 0.9;
        this._yaw = 0;
        this._pitchDrag = 0.9;
        this._pitch = 0;
        this._dt = 0;
        this._colliders = [];
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
        scene.registerBeforeRender(() => {
            this._move();
        });
    }
    get forward() {
        return this._forward;
    }
    set forward(v) {
        this._forward = v;
    }
    get roll() {
        return this._roll;
    }
    set roll(v) {
        if (!isNaN(v)) {
            this._roll = v;
        }
    }
    get yaw() {
        return this._yaw;
    }
    set yaw(v) {
        if (!isNaN(v)) {
            this._yaw = v;
        }
    }
    get pitch() {
        return this._pitch;
    }
    set pitch(v) {
        if (!isNaN(v)) {
            this._pitch = v;
        }
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
                this._shield.parent = this._mesh;
                this.wingTipLeft.parent = this._mesh;
                this.wingTipRight.parent = this._mesh;
                let spaceshipMaterial = new BABYLON.StandardMaterial("SpaceShipMaterial", this.getScene());
                spaceshipMaterial.diffuseTexture = new BABYLON.Texture("./datas/" + url + "-diffuse.png", Main.Scene);
                spaceshipMaterial.bumpTexture = new BABYLON.Texture("./datas/" + url + "-bump.png", Main.Scene);
                spaceshipMaterial.ambientTexture = new BABYLON.Texture("./datas/" + url + "-ao.png", Main.Scene);
                spaceshipMaterial.ambientTexture.level = 2;
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
        this._controler = controler;
    }
    static CenterRadiusBoundingSphere(center, radius) {
        return new BABYLON.BoundingSphere(new BABYLON.Vector3(center.x, center.y - radius, center.z), new BABYLON.Vector3(center.x, center.y + radius, center.z));
    }
    _move() {
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
        this.roll = this.roll * (1 - this._rollDrag * this._dt);
        this.yaw = this.yaw * (1 - this._yawDrag * this._dt);
        this.pitch = this.pitch * (1 - this._pitchDrag * this._dt);
        let sqrForward = this.forward * this.forward;
        if (this.forward > 0) {
            this.forward -= this._forwardDrag * sqrForward * this._dt;
        }
        else if (this.forward < 0) {
            this.forward += this._backwardDrag * sqrForward * this._dt;
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
                let intersection = Intersection.MeshSphere(this._shield, sphere);
                if (intersection.intersect) {
                    let forcedDisplacement = intersection.direction.multiplyByFloats(-1, -1, -1);
                    forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(intersection.depth, intersection.depth, intersection.depth));
                    this.position.addInPlace(forcedDisplacement);
                    this._shield.flashAt(intersection.point, BABYLON.Space.WORLD);
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
}
var ISquadRole;
(function (ISquadRole) {
    ISquadRole[ISquadRole["Leader"] = 0] = "Leader";
    ISquadRole[ISquadRole["WingMan"] = 1] = "WingMan";
})(ISquadRole || (ISquadRole = {}));
class SpaceShipFactory {
    static AddSpaceShipToScene(data, scene, callback) {
        let spaceShip = new SpaceShip(data.name, Main.Scene);
        spaceShip.initialize(data.url, () => {
            let spaceshipAI;
            if (data.role === ISquadRole.WingMan) {
                spaceshipAI = new WingManAI(spaceShip, new BABYLON.Vector3(30, -10, 15), data.role, data.team, Main.Scene);
            }
            spaceShip.attachControler(spaceshipAI);
            if (callback) {
                callback(spaceShip);
            }
        });
        spaceShip.position.copyFromFloats(data.x, data.y, data.z);
    }
}
class SpaceShipInputs extends SpaceShipControler {
    constructor(spaceShip, scene) {
        super(spaceShip, ISquadRole.Leader, 0);
        this._active = false;
        this._forwardPow = Config.tmpPlayerSpeed;
        this._backwardPow = 10;
        this._rollPow = 2.5;
        this._yawPow = 1.5;
        this._pitchPow = 1.5;
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
            if (e.keyCode === 87) {
                this._forward = true;
            }
            if (e.keyCode === 83) {
                this._backward = true;
            }
            if (e.keyCode === 68) {
                this._right = true;
            }
            if (e.keyCode === 65) {
                this._left = true;
            }
        });
        canvas.addEventListener("keyup", (e) => {
            if (e.keyCode === 87) {
                this._forward = false;
            }
            if (e.keyCode === 83) {
                this._backward = false;
            }
            if (e.keyCode === 68) {
                this._right = false;
            }
            if (e.keyCode === 65) {
                this._left = false;
            }
            if (e.keyCode === 69) {
                this.commandWingManGoTo();
            }
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
        if (this._forward) {
            this._spaceShip.forward += this._forwardPow * dt;
        }
        if (this._backward) {
            this._spaceShip.forward -= this._backwardPow * dt;
        }
        if (this._right) {
            this._spaceShip.roll += this._rollPow * dt;
        }
        if (this._left) {
            this._spaceShip.roll -= this._rollPow * dt;
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
        mouseInput.x = BABYLON.MathTools.Sign(mouseInput.x) * mouseInput.x * mouseInput.x;
        mouseInput.y = BABYLON.MathTools.Sign(mouseInput.y) * mouseInput.y * mouseInput.y;
        this._spaceShip.yaw += this._yawPow * mouseInput.x * dt;
        this._spaceShip.pitch += this._pitchPow * mouseInput.y * dt;
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
        this._focalLength = BABYLON.MathTools.Clamp(v, 10, 1000);
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
            this.focalLength *= 1 + BABYLON.MathTools.Sign(event.wheelDeltaY) * 0.05;
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
