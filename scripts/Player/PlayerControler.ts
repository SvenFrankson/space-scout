class PlayerControler {

    public hud: Hud;
    private _spaceship: Spaceship;
    public get spaceship(): Spaceship {
        return this._spaceship;
    }
    public scene: BABYLON.Scene;
    public engine: BABYLON.Engine;
    public canvas: HTMLCanvasElement;

    private _throttleSensitivity: number = 2;

    private _throttleInput: boolean = false;
    private _brakeInput: boolean = false;
    private _rollLeftInput: boolean = false;
    private _rollRightInput: boolean = false;
    private _shootInput: boolean = false;
    private _freezeInput: number = 0;

    private _targetSpeed: number = 0;

    public initialize(hud: Hud, scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
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

    public setSpaceship(spaceship: Spaceship): void {
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

    private _update = () => {
        let dt = this.engine.getDeltaTime() / 1000;
        let needThrottleUpdate: boolean = false;
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
            this._targetSpeed = Math.min(1, Math.max(- 1, this._targetSpeed));
            this.hud.setTargetSpeed(this._targetSpeed);
            this.spaceship.forwardInput = this._targetSpeed;
        }
    }

    private _onKeyDown = (e: KeyboardEvent) => {
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
    } 

    private _onKeyUp = (e: KeyboardEvent) => {
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
    }

    private _onPointerDown = (e: PointerEvent) => {
        if (e.button === 0) {
            this._shootInput = true;
        }
    }

    private _onPointerUp = (e: PointerEvent) => {
        if (e.button === 0) {
            this._shootInput = false;
        }
    }

    private _onPointerMove = (e: PointerEvent) => {
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
    }
}