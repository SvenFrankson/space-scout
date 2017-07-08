var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Main = (function () {
    function Main(canvasElement) {
        Main.Canvas = document.getElementById(canvasElement);
        Main.Engine = new BABYLON.Engine(Main.Canvas, true);
    }
    Main.prototype.createScene = function () {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        Main.Light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(0, 1, 0), Main.Scene);
        Main.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Main.Light.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
        var skybox = BABYLON.MeshBuilder.CreateBox("SkyBox", { size: 1000 }, Main.Scene);
        skybox.infiniteDistance = true;
        var skyboxMaterial = new BABYLON.StandardMaterial("SkyBoxMaterial", Main.Scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        skyboxMaterial.diffuseColor = BABYLON.Color3.Black();
        skyboxMaterial.specularColor = BABYLON.Color3.Black();
        skyboxMaterial.emissiveTexture = new BABYLON.Texture("./datas/stars.png", Main.Scene);
        BABYLON.SceneLoader.ImportMesh("", "./datas/roids1.babylon", "", Main.Scene, function (meshes, particleSystems, skeletons) {
            var base = meshes[0];
            base.isVisible = false;
            var roids1Material = new BABYLON.StandardMaterial("Roids1", Main.Scene);
            roids1Material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            roids1Material.bumpTexture = new BABYLON.Texture("./datas/roids1_normals.png", Main.Scene);
            roids1Material.ambientTexture = new BABYLON.Texture("./datas/roids1_ao.png", Main.Scene);
            base.material = roids1Material;
            for (var i = 0; i < 50; i++) {
                var clone = base.createInstance("Clone" + i);
                clone.position.x = 100 * Math.random() - 50;
                clone.position.y = 20 * Math.random() - 10;
                clone.position.z = 100 * Math.random() - 50;
                clone.rotation.x = 100 * Math.random() - 50;
                clone.rotation.y = 20 * Math.random() - 10;
                clone.rotation.z = 100 * Math.random() - 50;
                var scaling = 1.5 * Math.random() + 0.5;
                clone.scaling.copyFromFloats(scaling, scaling, scaling);
                Obstacle.SphereInstances.push(clone.getBoundingInfo().boundingSphere);
            }
        });
        var w = Main.Canvas.width * 0.95;
        var h = Main.Canvas.height * 0.95;
        var size = Math.min(w, h);
        $("#target1").css("width", size + "px");
        $("#target1").css("height", size + "px");
        $("#target1").css("top", Main.Canvas.height / 2 - size / 2);
        $("#target1").css("left", Main.Canvas.width / 2 - size / 2);
    };
    Main.prototype.animate = function () {
        Main.Engine.runRenderLoop(function () {
            Main.Scene.render();
        });
        window.addEventListener("resize", function () {
            Main.Engine.resize();
        });
    };
    return Main;
}());
window.addEventListener("DOMContentLoaded", function () {
    var game = new Main("render-canvas");
    game.createScene();
    game.animate();
    var player = new SpaceShip("Player", Main.Scene);
    new SpaceShipCamera("Camera", BABYLON.Vector3.Zero(), Main.Scene, player);
    player.initialize("./datas/spaceship.babylon", function () {
        player.attachControl(Main.Canvas);
    });
});
var Obstacle = (function () {
    function Obstacle() {
    }
    return Obstacle;
}());
Obstacle.SphereInstances = [];
Obstacle.BoxInstances = [];
var SpaceShip = (function (_super) {
    __extends(SpaceShip, _super);
    function SpaceShip(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this._forwardDrag = 0.1;
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
        _this._inputs = new SpaceShipInputs(_this, scene);
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
    SpaceShip.prototype.initialize = function (url, callback) {
        var _this = this;
        BABYLON.SceneLoader.ImportMesh("", url, "", Main.Scene, function (meshes, particleSystems, skeletons) {
            var spaceship = meshes[0];
            if (spaceship instanceof BABYLON.Mesh) {
                spaceship.parent = _this;
                _this._mesh = spaceship;
                var spaceshipMaterial = new BABYLON.StandardMaterial("SpaceShipMaterial", _this.getScene());
                spaceshipMaterial.diffuseTexture = new BABYLON.Texture("./datas/diffuse.png", Main.Scene);
                spaceshipMaterial.bumpTexture = new BABYLON.Texture("./datas/normals.png", Main.Scene);
                spaceshipMaterial.ambientTexture = new BABYLON.Texture("./datas/ao.png", Main.Scene);
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
    SpaceShip.CenterRadiusBoundingSphere = function (center, radius) {
        return new BABYLON.BoundingSphere(new BABYLON.Vector3(center.x, center.y - radius, center.z), new BABYLON.Vector3(center.x, center.y + radius, center.z));
    };
    SpaceShip.prototype.attachControl = function (canvas) {
        this._inputs.attachControl(canvas);
    };
    SpaceShip.prototype._move = function () {
        this._dt = this.getEngine().getDeltaTime() / 1000;
        BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.X, this.getWorldMatrix(), this._localX);
        BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Y, this.getWorldMatrix(), this._localY);
        BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Z, this.getWorldMatrix(), this._localZ);
        this._inputs.checkInputs(this._dt);
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
            for (var i = 0; i < Obstacle.SphereInstances.length; i++) {
                var sphere = Obstacle.SphereInstances[i];
                if (SpaceShip.IntersectsDepth(thisSphere, sphere) > 0) {
                    for (var j = 0; j < this._colliders.length; j++) {
                        this._updateColliders();
                        var collisionDepth = SpaceShip.IntersectsDepth(sphere, this._colliders[j]);
                        if (collisionDepth > 0) {
                            console.log(collisionDepth);
                            var forcedDisplacement = this._colliders[j].centerWorld.subtract(sphere.centerWorld).normalize();
                            forcedDisplacement.multiplyInPlace(new BABYLON.Vector3(collisionDepth, collisionDepth, collisionDepth));
                            this.position.addInPlace(forcedDisplacement);
                            return;
                        }
                    }
                }
            }
            for (var i = 0; i < Obstacle.BoxInstances.length; i++) {
                var box = Obstacle.BoxInstances[i];
                if (SpaceShip.IntersectsSphereDepth(box.minimumWorld, box.maximumWorld, thisSphere, tmpAxis) > 0) {
                    for (var j = 0; j < this._colliders.length; j++) {
                        this._updateColliders();
                        var collisionDepth = SpaceShip.IntersectsSphereDepth(box.minimumWorld, box.maximumWorld, this._colliders[j], tmpAxis);
                        if (collisionDepth > 0) {
                            console.log(collisionDepth);
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
    SpaceShip.IntersectsDepth = function (sphere0, sphere1) {
        var distance = BABYLON.Vector3.Distance(sphere0.centerWorld, sphere1.centerWorld);
        return sphere0.radiusWorld + sphere1.radiusWorld - distance;
    };
    SpaceShip.IntersectsSphereDepth = function (minPoint, maxPoint, sphere, directionFromBox) {
        var vector = BABYLON.Vector3.Clamp(sphere.centerWorld, minPoint, maxPoint);
        var num = BABYLON.Vector3.Distance(sphere.centerWorld, vector);
        directionFromBox.copyFrom(sphere.centerWorld);
        directionFromBox.subtractInPlace(vector);
        return (sphere.radiusWorld - num);
    };
    return SpaceShip;
}(BABYLON.Mesh));
var SpaceShipCamera = (function (_super) {
    __extends(SpaceShipCamera, _super);
    function SpaceShipCamera(name, position, scene, spaceShip, smoothness, smoothnessRotation) {
        var _this = _super.call(this, name, position, scene) || this;
        _this._smoothness = 32;
        _this._smoothnessRotation = 16;
        _this._targetPosition = BABYLON.Vector3.Zero();
        _this._targetRotation = BABYLON.Quaternion.Identity();
        _this._offset = new BABYLON.Vector3(0, 4, -10);
        _this._offsetRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, 4 / 60);
        _this.rotation.copyFromFloats(0, 0, 0);
        _this.rotationQuaternion = BABYLON.Quaternion.Identity();
        _this._spaceShip = spaceShip;
        _this.maxZ = 1000;
        if (!isNaN(smoothness)) {
            _this._smoothness = smoothness;
        }
        if (!isNaN(smoothnessRotation)) {
            _this._smoothnessRotation = smoothnessRotation;
        }
        return _this;
    }
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
    return SpaceShipCamera;
}(BABYLON.FreeCamera));
var SpaceShipInputs = (function () {
    function SpaceShipInputs(spaceShip, scene) {
        this._forwardPow = 20;
        this._backwardPow = 10;
        this._rollPow = 3;
        this._yawPow = 1;
        this._pitchPow = 1;
        this._spaceShip = spaceShip;
        this._scene = scene;
    }
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
        });
    };
    SpaceShipInputs.prototype.checkInputs = function (dt) {
        if (!this._canvas) {
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
    };
    return SpaceShipInputs;
}());
