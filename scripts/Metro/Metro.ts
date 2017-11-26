class Metro {

    public position: number = 0;
    private _timer: number = 0;
    public timeStop: number = 30;
    public timeTravel: number = 60;
    public get timeStep(): number {
        return this.timeStop + this.timeTravel;
    }
    public lengthStep: number = 4;
    public line: MetroLine;
    public instance: BABYLON.InstancedMesh;

    constructor(line: MetroLine, timerZero: number = 0) {
        this.line = line;
        this._timer = timerZero;
        this.easing = new BABYLON.CubicEase();
        this.easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    }

    public instantiate(): void {
        MeshLoader.instance.get(
            "metro",
            (m) => {
                this.instance = m;
                this.instance.rotationQuaternion = BABYLON.Quaternion.Identity();
                this.instance.getScene().registerBeforeRender(
                    () => {
                        this.debugRoll();
                        this.updatePosition();
                    }
                )
            }
        );
    }

    private easing = new BABYLON.CubicEase();

    public debugRoll = () => {
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
    }

    public updatePosition(): void {
        if (this.instance) {
            this.line.evaluatePositionToRef(this.position, this.instance.position);
            let up = this.instance.position.clone().normalize();
            let forward = this.line.evaluateDirection(this.position).scale(-1);
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(BABYLON.Vector3.Cross(up, forward), up, forward, this.instance.rotationQuaternion);
        }
    }
}