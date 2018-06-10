class HUDSpaceshipInfo extends BABYLON.TransformNode {

    public hud: HUD;
    public spaceship: SpaceShip;
    private _locked: boolean = false;
    public get locked(): boolean {
        return this._locked;
    }
    public set locked(l: boolean) {
        this._locked = l;
        this._updateLock();
    }
    private circle: BABYLON.LinesMesh;
    private lockCircle: BABYLON.LinesMesh;
    private circleNextPos: BABYLON.LinesMesh;
    private hitpointInfo: BABYLON.LinesMesh;
    private distanceInfo: BABYLON.GUI.TextBlock;

    constructor(spaceship: SpaceShip, hud: HUD) {
        super("hudSpaceshipInfo", spaceship.getScene());
        this.spaceship = spaceship;
        this.hud = hud;
        this.position = spaceship.position;

        this.circle = SSMeshBuilder.CreateZCircleMesh(6, spaceship.getScene());
        this.circle.parent = this;

        this.hitpointInfo = SSMeshBuilder.CreateZRailMesh(
            6.5, 7.5,
            - Math.PI / 4,
            Math.PI / 4,
            64,
            this.getScene(),
            new BABYLON.Color4(0, 1, 0, 1)
        );
        this.hitpointInfo.parent = this;

        let distanceInfoPosition = new BABYLON.Mesh("distanceInfoPosition", this.getScene());
        distanceInfoPosition.parent = this;
        distanceInfoPosition.position.y = - 6;
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

    public destroy(): void {
        this.dispose();
        if (this.circleNextPos) {
            this.circleNextPos.dispose();
        }
        this.distanceInfo.dispose();
        this.spaceship.onWoundObservable.removeCallback(this.onWound);
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
        this.lookAt(this.getScene().activeCamera.position);
        this.distanceInfo.text = BABYLON.Vector3.Distance(this.spaceship.position, this.getScene().activeCamera.position).toFixed(0) + " m";
        if (this.circleNextPos && this.circleNextPos.isVisible) {
            this.circleNextPos.position = DefaultAI.FuturePosition(
                this.spaceship,
                this.hud.input.spaceShip.projectileDurationTo(this.spaceship)
            );
            this.circleNextPos.lookAt(this.getScene().activeCamera.position);
        }
    }

    private _updateLock(): void {
        if (this.locked) {
            if (!this.lockCircle) {
                this.lockCircle = SSMeshBuilder.CreateZCircleMesh(5.5, this.spaceship.getScene());
                this.lockCircle.parent = this;
            }
            if (!this.circleNextPos) {
                this.circleNextPos = SSMeshBuilder.CreateZCircleMesh(2, this.spaceship.getScene());
            }
            this.lockCircle.isVisible = true;
            this.circleNextPos.isVisible = true;
        }
        else {
            if (this.lockCircle) {
                this.lockCircle.isVisible = false;
            }
            if (this.circleNextPos) {
                this.circleNextPos.isVisible = false;
            }
        }
    }

    private onWound = () => {
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
        this.hitpointInfo = SSMeshBuilder.CreateZRailMesh(
            6.5, 7.5,
            Math.PI / 4 - Math.PI / 2 * ratio,
            Math.PI / 4,
            64,
            this.getScene(),
            color
        );
        this.hitpointInfo.parent = this;
    }
}