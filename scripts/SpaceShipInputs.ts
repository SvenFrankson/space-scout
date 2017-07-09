class SpaceShipInputs {
  private _active: boolean = false;
  private _spaceShip: SpaceShip;
  private _forwardPow: number = 30;
  private _forward: boolean;
  private _backwardPow: number = 10;
  private _backward: boolean;
  private _rollPow: number = 3;
  private _right: boolean;
  private _left: boolean;
  private _yawPow: number = 1;
  private _pitchPow: number = 1;
  private _scene: BABYLON.Scene;
  private _canvas: HTMLCanvasElement;

  constructor(spaceShip: SpaceShip, scene: BABYLON.Scene) {
    this._spaceShip = spaceShip;
    this._scene = scene;
  }

  public attachControl(canvas: HTMLCanvasElement): void {
    this._canvas = canvas;
    canvas.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.keyCode === 90) {
          this._forward = true;
        }
        if (e.keyCode === 83) {
          this._backward = true;
        }
        if (e.keyCode === 68) {
          this._right = true;
        }
        if (e.keyCode === 81) {
          this._left = true;
        }
      }
    );
    canvas.addEventListener(
      "keyup",
      (e: KeyboardEvent) => {
        if (e.keyCode === 90) {
          this._forward = false;
        }
        if (e.keyCode === 83) {
          this._backward = false;
        }
        if (e.keyCode === 68) {
          this._right = false;
        }
        if (e.keyCode === 81) {
          this._left = false;
        }
      }
    );
    canvas.addEventListener(
      "mouseover",
      (e: MouseEvent) => {
        this._active = true;
      }
    );
    canvas.addEventListener(
      "mouseout",
      (e: MouseEvent) => {
        this._active = false;
      }
    );
  }

  public checkInputs(dt: number): void {
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
    let w: number = this._canvas.width;
    let h: number = this._canvas.height;
    let r: number = Math.min(w, h);
    r = r / 2;
    let x: number = (this._scene.pointerX - w / 2) / r;
    let y: number = (this._scene.pointerY - h / 2) / r;
    let mouseInput: BABYLON.Vector2 = new BABYLON.Vector2(x, y);
    this.updateUI(mouseInput);
    let power: number = mouseInput.length();
    if (power > 1) {
      mouseInput.x = mouseInput.x / power;
      mouseInput.y = mouseInput.y / power;
    }
    mouseInput.x = BABYLON.MathTools.Sign(mouseInput.x) * mouseInput.x * mouseInput.x;
    mouseInput.y = BABYLON.MathTools.Sign(mouseInput.y) * mouseInput.y * mouseInput.y;
    this._spaceShip.yaw += this._yawPow * mouseInput.x * dt;
    this._spaceShip.pitch += this._pitchPow * mouseInput.y * dt;
  }

  public updateUI(mouseInput: BABYLON.Vector2): void {
    let w: number = this._canvas.width;
    let h: number = this._canvas.height;
    let r: number = Math.min(w, h);

    let size: number = r / 2;
    $("#target2").css("width", size + "px");
    $("#target2").css("height", size + "px");
    $("#target2").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 4);
    $("#target2").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 4);

    size = size / 2;
    $("#target3").css("width", size + "px");
    $("#target3").css("height", size + "px");
    $("#target3").css("top", Main.Canvas.height / 2 - size / 2 + r * mouseInput.y / 2);
    $("#target3").css("left", Main.Canvas.width / 2 - size / 2 + r * mouseInput.x / 2);
  }
}
