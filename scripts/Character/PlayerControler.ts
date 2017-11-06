class PlayerControler {

    private _forward: boolean = false;
    private _backward: boolean = false;
    private _right: boolean = false;
    private _left: boolean = false;

    public character: Character;

    constructor(character: Character) {
        this.character = character;
        this.character.scene.registerBeforeRender(this._checkInputs);
    }

    private _checkInputs = () => {
        if (this._forward && !this._backward) {
            this.character.positionAdd(this.character.localForward.scale(0.1));
        }
        if (this._backward && !this._forward) {
            this.character.positionAdd(this.character.localForward.scale(-0.1));
        }
        if (this._left && !this._right) {
            this.character.d -= 0.1;
        }
        if (this._right && !this._left) {
            this.character.d += 0.1;
        }
    }

    public attachControl(canvas: HTMLCanvasElement): void {
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
    }
}