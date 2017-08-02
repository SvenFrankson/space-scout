var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BeaconEmiter = (function (_super) {
    __extends(BeaconEmiter, _super);
    function BeaconEmiter(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this.activated = false;
        BeaconEmiter.Instances.push(_this);
        _this.mapIconId = "map-icon-" + BeaconEmiter.Instances.length;
        $("body").append("<img id='" + _this.mapIconId + "' class='map-icon' src='./datas/objective-blue.png' hidden></img>");
        return _this;
    }
    Object.defineProperty(BeaconEmiter.prototype, "shieldMaterial", {
        get: function () {
            if (this.material instanceof ShieldMaterial) {
                return this.material;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    BeaconEmiter.prototype.initialize = function () {
        var _this = this;
        BABYLON.SceneLoader.ImportMesh("", "./datas/beacon-emit.babylon", "", this.getScene(), function (meshes, particleSystems, skeletons) {
            if (meshes[0] instanceof BABYLON.Mesh) {
                var data = BABYLON.VertexData.ExtractFromMesh(meshes[0]);
                data.applyToMesh(_this);
                meshes[0].dispose();
                var emitMat = new ShieldMaterial(_this.name + ("-mat"), _this.getScene());
                emitMat.length = 2;
                emitMat.tex = new BABYLON.Texture("./datas/fading-white-stripes.png", _this.getScene());
                emitMat.color.copyFromFloats(0.5, 0.5, 0.8, 1);
                emitMat.fadingDistance = 10;
                _this.material = emitMat;
            }
        });
    };
    BeaconEmiter.prototype.activate = function () {
        var _this = this;
        if (this.activated) {
            return;
        }
        this.activated = true;
        $("#" + this.mapIconId).attr("src", "./datas/objective-green.png");
        BeaconEmiter.activatedCount++;
        if (this.shieldMaterial) {
            this.shieldMaterial.flashAt(BABYLON.Vector3.Zero(), 0.1);
        }
        setInterval(function () {
            if (_this.shieldMaterial) {
                _this.shieldMaterial.flashAt(BABYLON.Vector3.Zero(), 0.1);
            }
        }, 3000);
    };
    BeaconEmiter.prototype.updateMapIcon = function (spaceShip) {
        var w = Main.Canvas.width;
        var h = Main.Canvas.height;
        var size = Math.min(w, h);
        var relPos = this.position.subtract(spaceShip.position);
        var angularPos = SpaceMath.Angle(relPos, spaceShip.localZ) / Math.PI;
        var rollPos = SpaceMath.AngleFromToAround(spaceShip.localY, relPos, spaceShip.localZ);
        var iconPos = new BABYLON.Vector2(-Math.sin(rollPos) * angularPos, -Math.cos(rollPos) * angularPos);
        var center = size / 2 * 0.1 + size / 2 * 0.4;
        $("#" + this.mapIconId).css("width", 32);
        $("#" + this.mapIconId).css("height", 32);
        $("#" + this.mapIconId).css("top", center + size / 2 * 0.4 * iconPos.y - 16);
        $("#" + this.mapIconId).css("left", center + size / 2 * 0.4 * iconPos.x - 16);
    };
    return BeaconEmiter;
}(BABYLON.Mesh));
BeaconEmiter.Instances = [];
BeaconEmiter.activatedCount = 0;
var Comlink = (function () {
    function Comlink() {
    }
    Comlink.Display = function (sender, line, hexColor, delay) {
        if (hexColor === void 0) { hexColor = "ffffff"; }
        if (delay === void 0) { delay = 10000; }
        var id = "com-link-line-" + Comlink._lineCount;
        Comlink._lineCount++;
        $("#com-link").append("<div id='" + id + "' class='row'>" +
            "<div class='col-xs-2 no-click'>[" + sender + "]</div>" +
            "<div class='col-xs-10 no-click'>" + line + "</div>" +
            "</div>");
        $("#" + id).css("color", "#" + hexColor);
        setTimeout(function () {
            $("#" + id).remove();
        }, delay);
        while ($("#com-link").children().length > 4) {
            $("#com-link").children().get(0).remove();
        }
    };
    return Comlink;
}());
Comlink._lineCount = 0;
var Dialogs = (function () {
    function Dialogs() {
    }
    Dialogs.randomNeutralCommand = function () {
        var index = Math.floor(Math.random() * Dialogs.neutralCommands.length);
        return Dialogs.neutralCommands[index];
    };
    return Dialogs;
}());
Dialogs.neutralCommands = [
    "- Copy that.",
    "- Loud and clear, I'm on it.",
    "- I'll check it for you captain.",
    "- Affirmative.",
    "- Roger. Wilco."
];
var Intersection = (function () {
    function Intersection() {
    }
    Intersection.SphereSphere = function (sphere0, sphere1) {
        var distance = BABYLON.Vector3.Distance(sphere0.centerWorld, sphere1.centerWorld);
        return sphere0.radiusWorld + sphere1.radiusWorld - distance;
    };
    Intersection.BoxSphere = function (box, sphere, directionFromBox) {
        var vector = BABYLON.Vector3.Clamp(sphere.centerWorld, box.minimumWorld, box.maximumWorld);
        var num = BABYLON.Vector3.Distance(sphere.centerWorld, vector);
        directionFromBox.copyFrom(sphere.centerWorld);
        directionFromBox.subtractInPlace(vector);
        return (sphere.radiusWorld - num);
    };
    Intersection.MeshSphere = function (mesh, sphere) {
        if (!BABYLON.BoundingSphere.Intersects(mesh.getBoundingInfo().boundingSphere, sphere)) {
            return {
                intersect: false,
                depth: 0
            };
        }
        var intersection = {
            intersect: false,
            depth: 0
        };
        var depth = 0;
        var vertex = Intersection._v;
        var world = mesh.getWorldMatrix();
        var vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        var normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        for (var i = 0; i < vertices.length / 3; i++) {
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
    };
    return Intersection;
}());
Intersection._v = BABYLON.Vector3.Zero();
var Intro = (function () {
    function Intro() {
    }
    Intro.RunIntro = function () {
        Intro.index = -1;
        $("#cinematic-frame").show();
        $("#cinematic-frame-title").show();
        $("#cinematic-frame-location-date").hide();
        $("#skip-button").show();
        $("#skip-button").on("click", function () {
            Intro.UpdateIntro();
        });
        Intro.UpdateIntro();
    };
    Intro.UpdateIntro = function () {
        clearTimeout(Intro._timeoutHandle);
        Intro.index = Intro.index + 1;
        if (!Intro.texts[Intro.index]) {
            return Intro.CloseIntro();
        }
        $("#cinematic-frame-text").text(Intro.texts[Intro.index]);
        $("#cinematic-frame-picture-img").attr("src", Intro.pictures[Intro.index]);
        Intro._timeoutHandle = setTimeout(function () {
            Intro.UpdateIntro();
        }, 6000);
    };
    Intro.CloseIntro = function () {
        $("#cinematic-frame").hide();
        $("#cinematic-frame-title").hide();
        $("#cinematic-frame-location-date").hide();
        $("#skip-button").hide();
        $("#skip-button").off();
        Menu.RunLevel1();
    };
    return Intro;
}());
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
var Level0 = (function () {
    function Level0() {
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
    Level0.prototype.LoadLevel = function (scene) {
        var _this = this;
        var beaconMasterName = "beacon";
        var beaconMaster = Loader.LoadedStatics[beaconMasterName][0];
        if (beaconMaster) {
            var instances = beaconMaster.instances;
            var _loop_1 = function (i) {
                var b = instances[i];
                var emit = new BeaconEmiter("Emiter-" + i, scene);
                emit.initialize();
                emit.position.copyFrom(b.position);
                emit.rotation.copyFrom(b.rotation);
                scene.registerBeforeRender(function () {
                    emit.updateMapIcon(SpaceShipInputs.SSIInstances[0].spaceShip);
                    if (!emit.activated) {
                        for (var i_1 = 0; i_1 < SpaceShipControler.Instances.length; i_1++) {
                            var spaceShip = SpaceShipControler.Instances[i_1];
                            if (BABYLON.Vector3.DistanceSquared(spaceShip.position, b.position) < 400) {
                                emit.activate();
                                Comlink.Display("MotherShip", _this.dialogs[BeaconEmiter.activatedCount - 1], "aff9ff");
                            }
                        }
                    }
                });
            };
            for (var i = 0; i < instances.length; i++) {
                _loop_1(i);
            }
        }
        Main.State = State.Ready;
    };
    Level0.prototype.OnGameStart = function () {
        var _this = this;
        var delay = 1000;
        var _loop_2 = function (i) {
            setTimeout(function () {
                Comlink.Display("MotherShip", _this.introDialogs[i], "aff9ff");
            }, delay);
            delay += 6000;
        };
        for (var i = 0; i < this.introDialogs.length; i++) {
            _loop_2(i);
        }
        var _loop_3 = function (i) {
            setTimeout(function () {
                Comlink.Display("Voyoslov", _this.tipDialogs[i], "ffffff");
            }, delay);
            delay += 3000;
        };
        for (var i = 0; i < this.tipDialogs.length; i++) {
            _loop_3(i);
        }
    };
    return Level0;
}());
var Menu = (function () {
    function Menu() {
    }
    Menu.RunLevel1 = function () {
        Loader.LoadScene("level-0", Main.Scene);
    };
    Menu.ShowMenu = function () {
    };
    Menu.HideMenu = function () {
    };
    return Menu;
}());
var Loader = (function () {
    function Loader() {
    }
    Loader.LoadScene = function (name, scene, callback) {
        Main.Level = new Level0();
        $.ajax({
            url: "./datas/scenes/" + name + ".json",
            success: function (data) {
                Main.Scene.activeCamera = Main.MenuCamera;
                Main.MenuCamera.setPosition(new BABYLON.Vector3(data.cinematic.xCam, data.cinematic.yCam, data.cinematic.zCam));
                Loader.RunCinematic(data.cinematic);
                Loader._loadSceneData(data, scene, function () {
                    Main.Level.LoadLevel(scene);
                    if (callback) {
                        callback();
                    }
                });
            }
        });
    };
    Loader.RunCinematic = function (data) {
        Loader.index = -1;
        $("#cinematic-frame").show();
        $("#cinematic-frame-title").hide();
        $("#cinematic-frame-location-date").show();
        $("#cinematic-frame-location").text(data.location);
        $("#cinematic-frame-date").text(data.date);
        $("#cinematic-frame-text").show();
        $("#skip-button").show();
        $("#skip-button").on("click", function () {
            Loader.UpdateCinematic(data);
        });
        Loader.UpdateCinematic(data);
    };
    Loader.UpdateCinematic = function (data) {
        clearTimeout(Loader._timeoutHandle);
        Loader.index = Loader.index + 1;
        if (!data.frames[Loader.index]) {
            return Loader.CloseCinematic();
        }
        $("#cinematic-frame-text").text(data.frames[Loader.index].text);
        Loader._timeoutHandle = setTimeout(function () {
            Loader.UpdateCinematic(data);
        }, data.frames[Loader.index].delay);
    };
    Loader.CloseCinematic = function () {
        $("#cinematic-frame").hide();
        $("#cinematic-frame-title").hide();
        $("#cinematic-frame-location-date").hide();
        $("#skip-button").hide();
        $("#skip-button").off();
        $("#play-frame").show();
    };
    Loader._loadSceneData = function (data, scene, callback) {
        Loader.AddStaticsIntoScene(data.statics, scene, callback, 10);
    };
    Loader._loadStatic = function (name, scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./datas/" + name + ".babylon", "", scene, function (meshes, particleSystems, skeletons) {
            Loader.LoadedStatics[name] = [];
            for (var i = 0; i < meshes.length; i++) {
                if (meshes[i] instanceof BABYLON.Mesh) {
                    var mesh = meshes[i];
                    Loader.LoadedStatics[name].push(mesh);
                    Loader._loadMaterial(mesh.material, name, scene);
                    for (var j = 0; j < mesh.instances.length; j++) {
                        Loader.LoadedStatics[name].push(mesh.instances[j]);
                        mesh.instances[j].isVisible = false;
                        mesh.instances[j].isPickable = false;
                    }
                    mesh.isVisible = false;
                    mesh.isPickable = false;
                }
            }
            if (callback) {
                callback(Loader.LoadedStatics[name]);
            }
        });
    };
    Loader._loadMaterial = function (material, name, scene) {
        if (material instanceof BABYLON.StandardMaterial) {
            material.bumpTexture = new BABYLON.Texture("./datas/" + name + "-bump.png", scene);
            material.ambientTexture = new BABYLON.Texture("./datas/" + name + "-ao.png", scene);
        }
    };
    Loader._cloneStaticIntoScene = function (sources, x, y, z, s, rX, rY, rZ, callback) {
        if (s === void 0) { s = 1; }
        if (rX === void 0) { rX = 0; }
        if (rY === void 0) { rY = 0; }
        if (rZ === void 0) { rZ = 0; }
        var instance;
        for (var i = 0; i < sources.length; i++) {
            if (sources[i] instanceof BABYLON.Mesh) {
                var source = sources[i];
                instance = source.createInstance(source.name);
                instance.position.copyFromFloats(x, y, z);
                instance.rotation.copyFromFloats(rX, rY, rZ);
                instance.scaling.copyFromFloats(s, s, s);
                instance.computeWorldMatrix();
                instance.freezeWorldMatrix();
                if (source.name[0] === "S") {
                    var radius = source.name.substring(2);
                    instance.getBoundingInfo().boundingSphere.radius = parseFloat(radius);
                    instance.getBoundingInfo().boundingSphere.radiusWorld = parseFloat(radius) * s;
                }
                Obstacle.PushSphere(instance.getBoundingInfo().boundingSphere);
            }
            else if (sources[i] instanceof BABYLON.InstancedMesh) {
                var source = sources[i];
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
    };
    Loader.AddStaticsIntoScene = function (datas, scene, callback, delay, index) {
        if (delay === void 0) { delay = 0; }
        if (index === void 0) { index = 0; }
        if (datas[index]) {
            Loader.AddStaticIntoScene(datas[index], scene, function () {
                setTimeout(function () {
                    Loader.AddStaticsIntoScene(datas, scene, callback, delay, index + 1);
                }, delay);
            });
        }
        else {
            if (callback) {
                callback();
            }
        }
    };
    Loader.AddStaticIntoScene = function (data, scene, callback) {
        if (Loader.LoadedStatics[data.name]) {
            Loader._cloneStaticIntoScene(Loader.LoadedStatics[data.name], data.x, data.y, data.z, data.s, data.rX, data.rY, data.rZ, callback);
        }
        else {
            Loader._loadStatic(data.name, scene, function (loadedMeshes) {
                Loader._cloneStaticIntoScene(loadedMeshes, data.x, data.y, data.z, data.s, data.rX, data.rY, data.rZ, callback);
            });
        }
    };
    return Loader;
}());
Loader.LoadedStatics = [];
Loader.index = 0;
Loader._timeoutHandle = 0;
var State;
(function (State) {
    State[State["Menu"] = 0] = "Menu";
    State[State["Ready"] = 1] = "Ready";
    State[State["Game"] = 2] = "Game";
})(State || (State = {}));
;
var Main = (function () {
    function Main(canvasElement) {
        Main.Canvas = document.getElementById(canvasElement);
        Main.Canvas.addEventListener("click", function () {
            Main.OnClick();
        });
        Main.Engine = new BABYLON.Engine(Main.Canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    Object.defineProperty(Main, "State", {
        get: function () {
            return Main._state;
        },
        set: function (v) {
            Main._state = v;
        },
        enumerable: true,
        configurable: true
    });
    Main.prototype.createScene = function () {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        this.resize();
        var sun = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.93, 0.06, 0.36), Main.Scene);
        sun.intensity = 0.8;
        var cloud = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(-0.75, 0.66, 0.07), Main.Scene);
        cloud.intensity = 0.3;
        cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
        cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);
        Main.MenuCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
        Main.Scene.activeCamera = Main.MenuCamera;
        Main.MenuCamera.setPosition(new BABYLON.Vector3(160, 80, -160));
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, Main.Scene);
        skybox.infiniteDistance = true;
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./datas/skyboxes/green-nebulae", Main.Scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    };
    Main.prototype.animate = function () {
        var _this = this;
        Main.Engine.runRenderLoop(function () {
            Main.Scene.render();
        });
        window.addEventListener("resize", function () {
            _this.resize();
        });
    };
    Main.prototype.resize = function () {
        Main.Engine.resize();
        var w = Main.Canvas.width;
        var h = Main.Canvas.height;
        var size = Math.min(w, h);
        $("#cinematic-frame").css("width", size * 0.8);
        $("#cinematic-frame").css("height", size * 0.8);
        $("#cinematic-frame").css("bottom", h / 2 - size * 0.8 / 2);
        $("#cinematic-frame").css("left", w / 2 - size * 0.8 / 2);
        $("#target1").css("width", size * 0.9 + "px");
        $("#target1").css("height", size * 0.9 + "px");
        $("#target1").css("top", Main.Canvas.height / 2 - size * 0.9 / 2);
        $("#target1").css("left", Main.Canvas.width / 2 - size * 0.9 / 2);
        $("#panel-right").css("width", size / 3 + "px");
        $("#panel-right").css("height", size / 3 + "px");
        $("#panel-right").css("top", Main.Canvas.height - size / 3);
        $("#panel-right").css("left", Main.Canvas.width - size / 3);
        $("#speed-display").css("width", size / 3 + "px");
        $("#speed-display").css("height", size / 3 + "px");
        $("#speed-display").css("top", Main.Canvas.height - size / 3);
        $("#speed-display").css("left", Main.Canvas.width - size / 3);
        $("#objective-radar").css("width", size / 2 * 0.8 + "px");
        $("#objective-radar").css("height", size / 2 * 0.8 + "px");
        $("#objective-radar").css("top", size / 2 * 0.1);
        $("#objective-radar").css("left", size / 2 * 0.1);
    };
    Main.OnClick = function () {
        if (Main.State === State.Ready) {
            Main.Play();
        }
    };
    Main.Play = function () {
        Main.State = State.Game;
        $("#focal-length").show();
        $("#target1").show();
        $("#target2").show();
        $("#target3").show();
        $("#panel-right").show();
        $("#team-panel").show();
        $("#speed-display").show();
        $("#objective-radar").show();
        $(".map-icon").show();
        $("#play-frame").hide();
        Main.Scene.activeCamera = Main.GameCamera;
        Main.Level.OnGameStart();
    };
    return Main;
}());
Main._state = State.Menu;
window.addEventListener("DOMContentLoaded", function () {
    var game = new Main("render-canvas");
    game.createScene();
    game.animate();
    Intro.RunIntro();
    var player = new SpaceShip("Player", Main.Scene);
    Main.GameCamera = new SpaceShipCamera(BABYLON.Vector3.Zero(), Main.Scene, player);
    Main.GameCamera.attachSpaceShipControl(Main.Canvas);
    Main.GameCamera.setEnabled(false);
    player.initialize("spaceship", function () {
        var playerControl = new SpaceShipInputs(player, Main.Scene);
        player.attachControler(playerControl);
        playerControl.attachControl(Main.Canvas);
    });
    SpaceShipFactory.AddSpaceShipToScene({
        name: "Voyoslov",
        url: "spaceship",
        x: 0, y: 0, z: 30,
        team: 0,
        role: ISquadRole.WingMan
    }, Main.Scene);
});
var Flash = (function () {
    function Flash() {
        this.source = BABYLON.Vector3.Zero();
        this.distance = 100;
        this.speed = 0.1;
        this.resetLimit = 10;
    }
    return Flash;
}());
var ShieldMaterial = (function (_super) {
    __extends(ShieldMaterial, _super);
    function ShieldMaterial(name, scene) {
        var _this = _super.call(this, name, scene, "shield", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection"],
            needAlphaBlending: true
        }) || this;
        _this._flash1 = new Flash();
        _this.backFaceCulling = false;
        _this.color = new BABYLON.Color4(1, 1, 1, 1);
        _this.tex = new BABYLON.Texture("./datas/shield.png", _this.getScene());
        _this.length = 1.5;
        _this.noiseFrequency = 1;
        _this.noiseAmplitude = 0;
        _this.fresnelBias = 2;
        _this.fresnelPower = 64;
        _this.fadingDistance = 0;
        _this.getScene().registerBeforeRender(function () {
            _this._flash1.distance += _this._flash1.speed;
            _this.setVector3("source1", _this._flash1.source);
            _this.setFloat("sourceDist1", _this._flash1.distance);
            _this.setVector3("cameraPosition", scene.activeCamera.position);
        });
        return _this;
    }
    Object.defineProperty(ShieldMaterial.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (v) {
            this._color = v;
            this.setColor4("color", this._color);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShieldMaterial.prototype, "length", {
        get: function () {
            return this._length;
        },
        set: function (v) {
            this._length = v;
            this.setFloat("length", this._length);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShieldMaterial.prototype, "tex", {
        get: function () {
            return this._tex;
        },
        set: function (v) {
            this._tex = v;
            this.setTexture("tex", this._tex);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShieldMaterial.prototype, "noiseAmplitude", {
        get: function () {
            return this._noiseAmplitude;
        },
        set: function (v) {
            this._noiseAmplitude = v;
            this.setFloat("noiseAmplitude", this._noiseAmplitude);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShieldMaterial.prototype, "noiseFrequency", {
        get: function () {
            return this._noiseFrequency;
        },
        set: function (v) {
            this._noiseFrequency = v;
            this.setFloat("noiseFrequency", this._noiseFrequency);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShieldMaterial.prototype, "fresnelBias", {
        get: function () {
            return this._fresnelBias;
        },
        set: function (v) {
            this._fresnelBias = v;
            this.setFloat("fresnelBias", this._fresnelBias);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShieldMaterial.prototype, "fresnelPower", {
        get: function () {
            return this._fresnelPower;
        },
        set: function (v) {
            this._fresnelPower = v;
            this.setFloat("fresnelPower", this._fresnelPower);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShieldMaterial.prototype, "fadingDistance", {
        get: function () {
            return this._fadingDistance;
        },
        set: function (v) {
            this._fadingDistance = v;
            this.setFloat("fadingDistance", this._fadingDistance);
        },
        enumerable: true,
        configurable: true
    });
    ShieldMaterial.prototype.flashAt = function (position, speed) {
        if (this._flash1.distance > this._flash1.resetLimit) {
            this._flash1.distance = 0.01;
            this._flash1.source.copyFrom(position);
            this._flash1.speed = speed;
        }
    };
    return ShieldMaterial;
}(BABYLON.ShaderMaterial));
var TrailMaterial = (function (_super) {
    __extends(TrailMaterial, _super);
    function TrailMaterial(name, scene) {
        var _this = _super.call(this, name, scene, "trail", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["projection", "view", "world", "worldView", "worldViewProjection"],
            needAlphaBlending: true
        }) || this;
        _this._diffuseColor1 = new BABYLON.Color4(1, 1, 1, 1);
        _this._diffuseColor2 = new BABYLON.Color4(1, 1, 1, 1);
        _this.getScene().registerBeforeRender(function () {
            _this.setFloat("alpha", _this.alpha);
            _this.setVector3("cameraPosition", Main.MenuCamera.position);
        });
        return _this;
    }
    Object.defineProperty(TrailMaterial.prototype, "diffuseColor1", {
        get: function () {
            return this._diffuseColor1;
        },
        set: function (v) {
            this._diffuseColor1 = v;
            this.setColor4("diffuseColor1", this._diffuseColor1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TrailMaterial.prototype, "diffuseColor2", {
        get: function () {
            return this._diffuseColor2;
        },
        set: function (v) {
            this._diffuseColor2 = v;
            this.setColor4("diffuseColor2", this._diffuseColor2);
        },
        enumerable: true,
        configurable: true
    });
    return TrailMaterial;
}(BABYLON.ShaderMaterial));
var SpaceMath = (function () {
    function SpaceMath() {
    }
    SpaceMath.ProjectPerpendicularAt = function (v, at) {
        var p = BABYLON.Vector3.Zero();
        var k = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    };
    SpaceMath.Angle = function (from, to) {
        var pFrom = BABYLON.Vector3.Normalize(from);
        var pTo = BABYLON.Vector3.Normalize(to);
        var angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    };
    SpaceMath.AngleFromToAround = function (from, to, around) {
        var pFrom = SpaceMath.ProjectPerpendicularAt(from, around).normalize();
        var pTo = SpaceMath.ProjectPerpendicularAt(to, around).normalize();
        var angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
        }
        return angle;
    };
    return SpaceMath;
}());
var Obstacle = (function () {
    function Obstacle() {
    }
    Obstacle.SphereInstancesFromPosition = function (position) {
        var xChunck = Math.floor(position.x / Obstacle.ChunckSize);
        var yChunck = Math.floor(position.y / Obstacle.ChunckSize);
        var zChunck = Math.floor(position.z / Obstacle.ChunckSize);
        var spheres = [];
        for (var x = xChunck - 1; x <= xChunck + 1; x++) {
            for (var y = yChunck - 1; y <= yChunck + 1; y++) {
                for (var z = zChunck - 1; z <= zChunck + 1; z++) {
                    if (Obstacle.SphereInstances[x]) {
                        if (Obstacle.SphereInstances[x][y]) {
                            if (Obstacle.SphereInstances[x][y][z]) {
                                spheres.push.apply(spheres, Obstacle.SphereInstances[x][y][z]);
                            }
                        }
                    }
                }
            }
        }
        return spheres;
    };
    Obstacle.PushSphere = function (sphere) {
        var xChunck = Math.floor(sphere.centerWorld.x / Obstacle.ChunckSize);
        var yChunck = Math.floor(sphere.centerWorld.y / Obstacle.ChunckSize);
        var zChunck = Math.floor(sphere.centerWorld.z / Obstacle.ChunckSize);
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
    };
    return Obstacle;
}());
Obstacle.ChunckSize = 20;
Obstacle.SphereInstances = [];
Obstacle.BoxInstances = [];
var Shield = (function (_super) {
    __extends(Shield, _super);
    function Shield(spaceShip) {
        var _this = _super.call(this, spaceShip.name + "-Shield", spaceShip.getScene()) || this;
        _this._spaceShip = spaceShip;
        return _this;
    }
    Shield.prototype.initialize = function () {
        var _this = this;
        BABYLON.SceneLoader.ImportMesh("", "./datas/shield.babylon", "", Main.Scene, function (meshes, particleSystems, skeletons) {
            var shield = meshes[0];
            if (shield instanceof BABYLON.Mesh) {
                var data = BABYLON.VertexData.ExtractFromMesh(shield);
                data.applyToMesh(_this);
                shield.dispose();
                var shieldMaterial = new ShieldMaterial(_this.name, _this.getScene());
                shieldMaterial.color = new BABYLON.Color4(0.13, 0.52, 0.80, 1);
                shieldMaterial.tex = new BABYLON.Texture("./datas/white-front-gradient.png", Main.Scene);
                shieldMaterial.noiseAmplitude = 0.25;
                shieldMaterial.noiseFrequency = 16;
                _this.material = shieldMaterial;
            }
        });
    };
    Shield.prototype.flashAt = function (position, space, speed) {
        if (space === void 0) { space = BABYLON.Space.LOCAL; }
        if (speed === void 0) { speed = 0.1; }
        if (this.material instanceof ShieldMaterial) {
            if (space === BABYLON.Space.WORLD) {
                var worldToLocal = BABYLON.Matrix.Invert(this.getWorldMatrix());
                BABYLON.Vector3.TransformCoordinatesToRef(position, worldToLocal, position);
            }
            this.material.flashAt(position, speed);
        }
    };
    return Shield;
}(BABYLON.Mesh));
var SpaceShipControler = (function () {
    function SpaceShipControler(spaceShip, role, team) {
        this._spaceShip = spaceShip;
        this._role = role;
        this._team = team;
        SpaceShipControler.Instances.push(this);
    }
    Object.defineProperty(SpaceShipControler.prototype, "spaceShip", {
        get: function () {
            return this._spaceShip;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShipControler.prototype, "role", {
        get: function () {
            return this._role;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShipControler.prototype, "team", {
        get: function () {
            return this._team;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShipControler.prototype, "position", {
        get: function () {
            return this.spaceShip.position;
        },
        enumerable: true,
        configurable: true
    });
    return SpaceShipControler;
}());
SpaceShipControler.Instances = [];
var IIABehaviour;
(function (IIABehaviour) {
    IIABehaviour[IIABehaviour["Track"] = 0] = "Track";
    IIABehaviour[IIABehaviour["Escape"] = 1] = "Escape";
    IIABehaviour[IIABehaviour["Follow"] = 2] = "Follow";
    IIABehaviour[IIABehaviour["GoTo"] = 3] = "GoTo";
})(IIABehaviour || (IIABehaviour = {}));
var SpaceShipAI = (function (_super) {
    __extends(SpaceShipAI, _super);
    function SpaceShipAI(spaceShip, role, team, scene) {
        var _this = _super.call(this, spaceShip, role, team) || this;
        _this._forwardPow = 10;
        _this._rollPow = 2.5;
        _this._yawPow = 3;
        _this._pitchPow = 3;
        _this._scene = scene;
        return _this;
    }
    return SpaceShipAI;
}(SpaceShipControler));
var WingManAI = (function (_super) {
    __extends(WingManAI, _super);
    function WingManAI(spaceShip, groupPosition, role, team, scene) {
        var _this = _super.call(this, spaceShip, role, team, scene) || this;
        _this._targetPosition = BABYLON.Vector3.Zero();
        _this._direction = new BABYLON.Vector3(0, 0, 1);
        _this._distance = 1;
        _this._groupPosition = groupPosition;
        _this._mode = IIABehaviour.Follow;
        return _this;
    }
    WingManAI.prototype.checkInputs = function (dt) {
        this._checkMode(dt);
        this._goTo(dt);
    };
    WingManAI.prototype.commandPosition = function (newPosition) {
        this._targetPosition.copyFrom(newPosition);
        this._mode = IIABehaviour.GoTo;
        Comlink.Display(this.spaceShip.name, Dialogs.randomNeutralCommand());
    };
    WingManAI.prototype._checkMode = function (dt) {
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
    };
    WingManAI.prototype._goTo = function (dt) {
        if (this._distance > 2 * this._spaceShip.forward) {
            this._spaceShip.forward += this._forwardPow * dt;
        }
        var angleAroundY = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localY);
        var yawInput = BABYLON.MathTools.Clamp(angleAroundY / Math.PI, -1, 1);
        this._spaceShip.yaw += this._yawPow * yawInput * dt;
        var angleAroundX = SpaceMath.AngleFromToAround(this._spaceShip.localZ, this._direction, this._spaceShip.localX);
        var pitchInput = BABYLON.MathTools.Clamp(angleAroundX / Math.PI, -1, 1);
        this._spaceShip.pitch += this._pitchPow * pitchInput * dt;
        var angleAroundZ = SpaceMath.AngleFromToAround(this._leader.spaceShip.localY, this._spaceShip.localY, this._spaceShip.localZ);
        var rollInput = BABYLON.MathTools.Clamp(angleAroundZ / Math.PI, -1, 1);
        this._spaceShip.roll += this._rollPow * rollInput * dt;
    };
    WingManAI.prototype._findLeader = function () {
        for (var i = 0; i < SpaceShipControler.Instances.length; i++) {
            if (SpaceShipControler.Instances[i].team === this.team) {
                if (SpaceShipControler.Instances[i].role === ISquadRole.Leader) {
                    this._leader = SpaceShipControler.Instances[i];
                }
            }
        }
    };
    return WingManAI;
}(SpaceShipAI));
var SpaceShip = (function (_super) {
    __extends(SpaceShip, _super);
    function SpaceShip(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this._forwardDrag = 0.01;
        _this._backwardDrag = 1;
        _this._forward = 0;
        _this._rollDrag = 0.9;
        _this._roll = 0;
        _this._yawDrag = 0.9;
        _this._yaw = 0;
        _this._pitchDrag = 0.9;
        _this._pitch = 0;
        _this._dt = 0;
        _this._colliders = [];
        _this._localX = new BABYLON.Vector3(1, 0, 0);
        _this._localY = new BABYLON.Vector3(0, 1, 0);
        _this._localZ = new BABYLON.Vector3(0, 0, 1);
        _this.rotation.copyFromFloats(0, 0, 0);
        _this.rotationQuaternion = BABYLON.Quaternion.Identity();
        _this._rX = BABYLON.Quaternion.Identity();
        _this._rY = BABYLON.Quaternion.Identity();
        _this._rZ = BABYLON.Quaternion.Identity();
        _this._shield = new Shield(_this);
        _this._shield.initialize();
        _this.wingTipLeft = new BABYLON.Mesh("WingTipLeft", scene);
        _this.wingTipLeft.parent = _this;
        _this.wingTipLeft.position.copyFromFloats(-2.91, 0, -1.24);
        _this.wingTipRight = new BABYLON.Mesh("WingTipRight", scene);
        _this.wingTipRight.parent = _this;
        _this.wingTipRight.position.copyFromFloats(2.91, 0, -1.24);
        new TrailMesh("Test", _this.wingTipLeft, Main.Scene, 0.1, 120);
        new TrailMesh("Test", _this.wingTipRight, Main.Scene, 0.1, 120);
        _this.createColliders();
        scene.registerBeforeRender(function () {
            _this._move();
        });
        return _this;
    }
    Object.defineProperty(SpaceShip.prototype, "forward", {
        get: function () {
            return this._forward;
        },
        set: function (v) {
            this._forward = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShip.prototype, "roll", {
        get: function () {
            return this._roll;
        },
        set: function (v) {
            if (!isNaN(v)) {
                this._roll = v;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShip.prototype, "yaw", {
        get: function () {
            return this._yaw;
        },
        set: function (v) {
            if (!isNaN(v)) {
                this._yaw = v;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShip.prototype, "pitch", {
        get: function () {
            return this._pitch;
        },
        set: function (v) {
            if (!isNaN(v)) {
                this._pitch = v;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShip.prototype, "localX", {
        get: function () {
            return this._localX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShip.prototype, "localY", {
        get: function () {
            return this._localY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpaceShip.prototype, "localZ", {
        get: function () {
            return this._localZ;
        },
        enumerable: true,
        configurable: true
    });
    SpaceShip.prototype.initialize = function (url, callback) {
        var _this = this;
        BABYLON.SceneLoader.ImportMesh("", "./datas/" + url + ".babylon", "", Main.Scene, function (meshes, particleSystems, skeletons) {
            var spaceship = meshes[0];
            if (spaceship instanceof BABYLON.Mesh) {
                spaceship.parent = _this;
                _this._mesh = spaceship;
                _this._shield.parent = _this._mesh;
                _this.wingTipLeft.parent = _this._mesh;
                _this.wingTipRight.parent = _this._mesh;
                var spaceshipMaterial = new BABYLON.StandardMaterial("SpaceShipMaterial", _this.getScene());
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
    };
    SpaceShip.prototype.createColliders = function () {
        this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0.22, -0.59), 1.06));
        this._colliders.push(SpaceShip.CenterRadiusBoundingSphere(new BABYLON.Vector3(0, 0, 2.43), 0.75));
    };
    SpaceShip.prototype.attachControler = function (controler) {
        this._controler = controler;
    };
    SpaceShip.CenterRadiusBoundingSphere = function (center, radius) {
        return new BABYLON.BoundingSphere(new BABYLON.Vector3(center.x, center.y - radius, center.z), new BABYLON.Vector3(center.x, center.y + radius, center.z));
    };
    SpaceShip.prototype._move = function () {
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
        var dZ = BABYLON.Vector3.Zero();
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
    };
    SpaceShip.prototype._drag = function () {
        this.roll = this.roll * (1 - this._rollDrag * this._dt);
        this.yaw = this.yaw * (1 - this._yawDrag * this._dt);
        this.pitch = this.pitch * (1 - this._pitchDrag * this._dt);
        var sqrForward = this.forward * this.forward;
        if (this.forward > 0) {
            this.forward -= this._forwardDrag * sqrForward * this._dt;
        }
        else if (this.forward < 0) {
            this.forward += this._backwardDrag * sqrForward * this._dt;
        }
    };
    SpaceShip.prototype._updateColliders = function () {
        for (var i = 0; i < this._colliders.length; i++) {
            this._colliders[i]._update(this.getWorldMatrix());
        }
    };
    SpaceShip.prototype._collide = function () {
        if (this._mesh) {
            var tmpAxis = BABYLON.Vector3.Zero();
            var thisSphere = this._mesh.getBoundingInfo().boundingSphere;
            var spheres = Obstacle.SphereInstancesFromPosition(this.position);
            for (var i = 0; i < spheres.length; i++) {
                var sphere = spheres[i];
                var intersection = Intersection.MeshSphere(this._shield, sphere);
                if (intersection.intersect) {
                    var forcedDisplacement = intersection.direction.multiplyByFloats(-1, -1, -1);
                    forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(intersection.depth, intersection.depth, intersection.depth));
                    this.position.addInPlace(forcedDisplacement);
                    this._shield.flashAt(intersection.point, BABYLON.Space.WORLD);
                    return;
                }
            }
            for (var i = 0; i < Obstacle.BoxInstances.length; i++) {
                var box = Obstacle.BoxInstances[i][0][0][0];
                if (Intersection.BoxSphere(box, thisSphere, tmpAxis) > 0) {
                    for (var j = 0; j < this._colliders.length; j++) {
                        this._updateColliders();
                        var collisionDepth = Intersection.BoxSphere(box, this._colliders[j], tmpAxis);
                        if (collisionDepth > 0) {
                            var forcedDisplacement = tmpAxis.normalize();
                            forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(collisionDepth, collisionDepth, collisionDepth));
                            this.position.addInPlace(forcedDisplacement);
                            return;
                        }
                    }
                }
            }
        }
    };
    return SpaceShip;
}(BABYLON.Mesh));
var ISquadRole;
(function (ISquadRole) {
    ISquadRole[ISquadRole["Leader"] = 0] = "Leader";
    ISquadRole[ISquadRole["WingMan"] = 1] = "WingMan";
})(ISquadRole || (ISquadRole = {}));
var SpaceShipFactory = (function () {
    function SpaceShipFactory() {
    }
    SpaceShipFactory.AddSpaceShipToScene = function (data, scene, callback) {
        var spaceShip = new SpaceShip(data.name, Main.Scene);
        spaceShip.initialize(data.url, function () {
            var spaceshipAI;
            if (data.role === ISquadRole.WingMan) {
                spaceshipAI = new WingManAI(spaceShip, new BABYLON.Vector3(30, -10, 15), data.role, data.team, Main.Scene);
            }
            spaceShip.attachControler(spaceshipAI);
            if (callback) {
                callback();
            }
        });
        spaceShip.position.copyFromFloats(data.x, data.y, data.z);
    };
    return SpaceShipFactory;
}());
var SpaceShipInputs = (function (_super) {
    __extends(SpaceShipInputs, _super);
    function SpaceShipInputs(spaceShip, scene) {
        var _this = _super.call(this, spaceShip, ISquadRole.Leader, 0) || this;
        _this._active = false;
        _this._forwardPow = 10;
        _this._backwardPow = 10;
        _this._rollPow = 2.5;
        _this._yawPow = 1.5;
        _this._pitchPow = 1.5;
        _this.wingMen = [];
        SpaceShipInputs.SSIInstances.push(_this);
        _this._spaceShip = spaceShip;
        _this._scene = scene;
        _this._loadPointer();
        return _this;
    }
    Object.defineProperty(SpaceShipInputs.prototype, "spaceShipCamera", {
        get: function () {
            if (!this._spaceShipCamera) {
                this._spaceShipCamera = this._scene.getCameraByName("SpaceShipCamera");
            }
            return this._spaceShipCamera;
        },
        enumerable: true,
        configurable: true
    });
    SpaceShipInputs.prototype._loadPointer = function () {
        var _this = this;
        BABYLON.SceneLoader.ImportMesh("", "./datas/target.babylon", "", Main.Scene, function (meshes, particleSystems, skeletons) {
            for (var i = 0; i < meshes.length; i++) {
                meshes[i].rotationQuaternion = BABYLON.Quaternion.Identity();
                meshes[i].material.alpha = 0;
                meshes[i].enableEdgesRendering();
                meshes[i].edgesColor.copyFromFloats(1, 1, 1, 1);
                meshes[i].edgesWidth = 2;
                if (meshes[i].name.indexOf("Cursor") !== -1) {
                    _this._pointerCursor = meshes[i];
                    var anim = new BABYLON.Animation("popoff", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                    var keys = new Array();
                    keys.push({
                        frame: 0,
                        value: new BABYLON.Vector3(10, 10, 10)
                    });
                    keys.push({
                        frame: 60,
                        value: new BABYLON.Vector3(0.1, 0.1, 0.1)
                    });
                    anim.setKeys(keys);
                    anim.addEvent(new BABYLON.AnimationEvent(60, function () {
                        _this._pointerCursor.isVisible = false;
                    }));
                    _this._pointerCursor.animations.push(anim);
                }
                if (meshes[i].name.indexOf("Disc") !== -1) {
                    _this._pointerDisc = meshes[i];
                    var anim = new BABYLON.Animation("popon", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                    var keys = new Array();
                    keys.push({
                        frame: 0,
                        value: new BABYLON.Vector3(0.1, 0.1, 0.1)
                    });
                    keys.push({
                        frame: 60,
                        value: new BABYLON.Vector3(10, 10, 10)
                    });
                    anim.setKeys(keys);
                    anim.addEvent(new BABYLON.AnimationEvent(60, function () {
                        _this._pointerDisc.isVisible = false;
                    }));
                    _this._pointerDisc.animations.push(anim);
                }
                meshes[i].isVisible = false;
            }
        });
    };
    SpaceShipInputs.prototype.attachControl = function (canvas) {
        var _this = this;
        this._canvas = canvas;
        canvas.addEventListener("keydown", function (e) {
            if (e.keyCode === 90) {
                _this._forward = true;
            }
            if (e.keyCode === 83) {
                _this._backward = true;
            }
            if (e.keyCode === 68) {
                _this._right = true;
            }
            if (e.keyCode === 81) {
                _this._left = true;
            }
        });
        canvas.addEventListener("keyup", function (e) {
            if (e.keyCode === 90) {
                _this._forward = false;
            }
            if (e.keyCode === 83) {
                _this._backward = false;
            }
            if (e.keyCode === 68) {
                _this._right = false;
            }
            if (e.keyCode === 81) {
                _this._left = false;
            }
            if (e.keyCode === 69) {
                _this.commandWingManGoTo();
            }
        });
        canvas.addEventListener("mouseover", function (e) {
            _this._active = true;
        });
        canvas.addEventListener("mouseout", function (e) {
            _this._active = false;
        });
    };
    SpaceShipInputs.prototype.commandWingManGoTo = function () {
        var _this = this;
        this._findWingMen();
        if (this.wingMen[0]) {
            var pick = this._scene.pick(this._scene.pointerX, this._scene.pointerY, function (m) {
                return m === _this._spaceShip.focalPlane;
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
    };
    SpaceShipInputs.prototype.checkInputs = function (dt) {
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
        var w = this._canvas.width;
        var h = this._canvas.height;
        var r = Math.min(w, h);
        r = r / 2;
        var x = (this._scene.pointerX - w / 2) / r;
        var y = (this._scene.pointerY - h / 2) / r;
        var mouseInput = new BABYLON.Vector2(x, y);
        this.updateUI(mouseInput);
        var power = mouseInput.length();
        if (power > 1) {
            mouseInput.x = mouseInput.x / power;
            mouseInput.y = mouseInput.y / power;
        }
        mouseInput.x = BABYLON.MathTools.Sign(mouseInput.x) * mouseInput.x * mouseInput.x;
        mouseInput.y = BABYLON.MathTools.Sign(mouseInput.y) * mouseInput.y * mouseInput.y;
        this._spaceShip.yaw += this._yawPow * mouseInput.x * dt;
        this._spaceShip.pitch += this._pitchPow * mouseInput.y * dt;
    };
    SpaceShipInputs.prototype.updateUI = function (mouseInput) {
        var w = this._canvas.width;
        var h = this._canvas.height;
        var r = Math.min(w, h);
        var size = r / 2;
        $("#target2").css("width", size + "px");
        $("#target2").css("height", size + "px");
        $("#target2").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 4);
        $("#target2").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 4);
        size = size / 2;
        $("#target3").css("width", size + "px");
        $("#target3").css("height", size + "px");
        $("#target3").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 2);
        $("#target3").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 2);
        var wSDisplay = parseInt($("#speed-display").css("width"), 10);
        var hSDisplay = parseInt($("#speed-display").css("height"), 10);
        var clip = 0.72 * hSDisplay - (this._spaceShip.forward) / 40 * 0.38 * hSDisplay;
        clip = Math.floor(clip);
        $("#speed-display").css("clip", "rect(" + clip + "px, " + wSDisplay + "px, " + hSDisplay + "px, 0px)");
    };
    SpaceShipInputs.prototype._findWingMen = function () {
        for (var i = 0; i < SpaceShipControler.Instances.length; i++) {
            if (SpaceShipControler.Instances[i].team === this.team) {
                if (SpaceShipControler.Instances[i] instanceof WingManAI) {
                    if (this.wingMen.indexOf(SpaceShipControler.Instances[i]) === -1) {
                        this.wingMen.push(SpaceShipControler.Instances[i]);
                    }
                }
            }
        }
    };
    return SpaceShipInputs;
}(SpaceShipControler));
SpaceShipInputs.SSIInstances = [];
var SpaceShipCamera = (function (_super) {
    __extends(SpaceShipCamera, _super);
    function SpaceShipCamera(position, scene, spaceShip, smoothness, smoothnessRotation) {
        var _this = _super.call(this, "SpaceShipCamera", position, scene) || this;
        _this._smoothness = 16;
        _this._smoothnessRotation = 8;
        _this._focalLength = 100;
        _this._targetPosition = BABYLON.Vector3.Zero();
        _this._targetRotation = BABYLON.Quaternion.Identity();
        _this._offset = new BABYLON.Vector3(0, 4, -15);
        _this._offsetRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, 4 / _this._focalLength);
        _this.rotation.copyFromFloats(0, 0, 0);
        _this.rotationQuaternion = BABYLON.Quaternion.Identity();
        _this._spaceShip = spaceShip;
        _this.maxZ = 1000;
        _this._spaceShip.focalPlane = BABYLON.MeshBuilder.CreatePlane("FocalPlane", { width: 1000, height: 1000 }, scene);
        _this._spaceShip.focalPlane.parent = _this._spaceShip;
        _this._spaceShip.focalPlane.isVisible = false;
        _this.focalLength = 100;
        if (!isNaN(smoothness)) {
            _this._smoothness = smoothness;
        }
        if (!isNaN(smoothnessRotation)) {
            _this._smoothnessRotation = smoothnessRotation;
        }
        return _this;
    }
    Object.defineProperty(SpaceShipCamera.prototype, "focalLength", {
        get: function () {
            return this._focalLength;
        },
        set: function (v) {
            this._focalLength = BABYLON.MathTools.Clamp(v, 10, 1000);
            if (this._spaceShip.focalPlane) {
                this._spaceShip.focalPlane.position.z = this._focalLength;
            }
            this._offsetRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, 4 / (Math.round(this._focalLength / 5) * 5));
            $("#focal-length").text((Math.round(this._focalLength / 5) * 5).toFixed(0) + " m");
        },
        enumerable: true,
        configurable: true
    });
    SpaceShipCamera.prototype._checkInputs = function () {
        if (!this._spaceShip.getWorldMatrix()) {
            return;
        }
        BABYLON.Vector3.TransformNormalToRef(this._offset, this._spaceShip.getWorldMatrix(), this._targetPosition);
        this._targetPosition.addInPlace(this._spaceShip.position);
        var s = this._smoothness - 1;
        this.position.copyFromFloats((this._targetPosition.x + this.position.x * s) / this._smoothness, (this._targetPosition.y + this.position.y * s) / this._smoothness, (this._targetPosition.z + this.position.z * s) / this._smoothness);
        this._targetRotation.copyFrom(this._spaceShip.rotationQuaternion);
        this._targetRotation.multiplyInPlace(this._offsetRotation);
        BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, this._targetRotation, 1 / this._smoothnessRotation, this.rotationQuaternion);
    };
    SpaceShipCamera.prototype.attachSpaceShipControl = function (canvas) {
        var _this = this;
        canvas.addEventListener("wheel", function (event) {
            _this.focalLength *= 1 + BABYLON.MathTools.Sign(event.wheelDeltaY) * 0.05;
        });
    };
    return SpaceShipCamera;
}(BABYLON.FreeCamera));
var TrailMesh = (function (_super) {
    __extends(TrailMesh, _super);
    function TrailMesh(name, generator, scene, diameter, length) {
        if (diameter === void 0) { diameter = 1; }
        if (length === void 0) { length = 60; }
        var _this = _super.call(this, name, scene) || this;
        _this._sectionPolygonPointsCount = 4;
        _this._generator = generator;
        _this._diameter = diameter;
        _this._length = length;
        _this._sectionVectors = [];
        _this._sectionNormalVectors = [];
        for (var i = 0; i < _this._sectionPolygonPointsCount; i++) {
            _this._sectionVectors[i] = BABYLON.Vector3.Zero();
            _this._sectionNormalVectors[i] = BABYLON.Vector3.Zero();
        }
        _this._createMesh();
        scene.registerBeforeRender(function () {
            _this.update();
        });
        return _this;
    }
    TrailMesh.prototype._createMesh = function () {
        var data = new BABYLON.VertexData();
        var positions = [];
        var normals = [];
        var indices = [];
        var alpha = 2 * Math.PI / this._sectionPolygonPointsCount;
        for (var i = 0; i < this._sectionPolygonPointsCount; i++) {
            positions.push(Math.cos(i * alpha) * this._diameter, Math.sin(i * alpha) * this._diameter, -this._length);
            normals.push(Math.cos(i * alpha), Math.sin(i * alpha), 0);
        }
        for (var i = 1; i <= this._length; i++) {
            for (var j = 0; j < this._sectionPolygonPointsCount; j++) {
                positions.push(Math.cos(j * alpha) * this._diameter, Math.sin(j * alpha) * this._diameter, -this._length + i);
                normals.push(Math.cos(j * alpha), Math.sin(j * alpha), 0);
            }
            var l = positions.length / 3 - 2 * this._sectionPolygonPointsCount;
            for (var j = 0; j < this._sectionPolygonPointsCount - 1; j++) {
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
        var trailMaterial = new TrailMaterial(this.name, this.getScene());
        trailMaterial.diffuseColor1 = new BABYLON.Color4(1, 0, 0, 0.2);
        trailMaterial.diffuseColor2 = new BABYLON.Color4(1, 1, 1, 0.4);
        this.material = trailMaterial;
    };
    TrailMesh.prototype.update = function () {
        var positions = this.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        var normals = this.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        for (var i = 3 * this._sectionPolygonPointsCount; i < positions.length; i++) {
            positions[i - 3 * this._sectionPolygonPointsCount] = positions[i] - normals[i] / this._length * this._diameter;
        }
        for (var i = 3 * this._sectionPolygonPointsCount; i < normals.length; i++) {
            normals[i - 3 * this._sectionPolygonPointsCount] = normals[i];
        }
        var l = positions.length - 3 * this._sectionPolygonPointsCount;
        var alpha = 2 * Math.PI / this._sectionPolygonPointsCount;
        for (var i = 0; i < this._sectionPolygonPointsCount; i++) {
            this._sectionVectors[i].copyFromFloats(Math.cos(i * alpha) * this._diameter, Math.sin(i * alpha) * this._diameter, 0);
            this._sectionNormalVectors[i].copyFromFloats(Math.cos(i * alpha), Math.sin(i * alpha), 0);
            BABYLON.Vector3.TransformCoordinatesToRef(this._sectionVectors[i], this._generator.getWorldMatrix(), this._sectionVectors[i]);
            BABYLON.Vector3.TransformNormalToRef(this._sectionNormalVectors[i], this._generator.getWorldMatrix(), this._sectionNormalVectors[i]);
        }
        for (var i = 0; i < this._sectionPolygonPointsCount; i++) {
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
    return TrailMesh;
}(BABYLON.Mesh));
