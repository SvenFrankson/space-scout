class PlayerControler {

    public horizontalSensibility: number = 8;
    public verticalSensibility: number = 2;
    public mouseWheelSensibility: number = 2;

    private _rotating: boolean = false;
    private _deltaX: number = 0;
    private _deltaY: number = 0;
    private _deltaWheel: number = 0;
    private _forward: boolean = false;
    private _backward: boolean = false;
    private _right: boolean = false;
    private _left: boolean = false;

    public character: Character;
    public camera: PlayerCamera;

    constructor(camera: PlayerCamera) {
        this.camera = camera;
        this.character = camera.character;
        this.character.scene.registerBeforeRender(this._checkInputs);
    }

    private _checkInputs = () => {
        if (this._forward && !this._backward) {
            this.character.positionAdd(this.character.localForward.scale(0.3));
            this.character.instance.updateAnimation(2.5);
        } else {
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
    }

    private _canvasWidth: number = 1;
    private _canvasHeight: number = 1;
    public attachControl(canvas: HTMLCanvasElement): void {
        this._canvasWidth = canvas.width;
        this._canvasHeight = canvas.height;

        canvas.addEventListener(
            "keydown",
            (ev: KeyboardEvent) => {
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
            }
        );
        canvas.addEventListener(
            "keyup",
            (ev: KeyboardEvent) => {
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
            }
        );
        this.character.scene.onPointerObservable.add(this._pointerObserver);
    }

    private _pointerObserver = (eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
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
    }
}