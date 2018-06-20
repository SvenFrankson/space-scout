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
    private aiBehaviourInfo: BABYLON.GUI.TextBlock;

    constructor(spaceship: SpaceShip, hud: HUD) {
        super("hudSpaceshipInfo", spaceship.getScene());
        this.spaceship = spaceship;
        this.hud = hud;
        this.position = spaceship.position;

        this.circle = SSMeshBuilder.CreateZCircleMesh(6, spaceship.getScene());
        this.circle.parent = this;
        this.circle.layerMask = 2;

        this.hitpointInfo = SSMeshBuilder.CreateZRailMesh(
            6.5, 7.5,
            - Math.PI / 4,
            Math.PI / 4,
            64,
            this.getScene(),
            new BABYLON.Color4(0, 1, 0, 1)
        );
        this.hitpointInfo.parent = this;
        this.hitpointInfo.layerMask = 2;

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

        let aiBehaviourInfoPosition = new BABYLON.Mesh("aiBehaviourInfoPosition", this.getScene());
        aiBehaviourInfoPosition.parent = this;
        aiBehaviourInfoPosition.position.x = - 6;
        this.aiBehaviourInfo = new BABYLON.GUI.TextBlock("aiBehaviourInfo", "-");
        this.aiBehaviourInfo.fontFamily = "consolas";
        this.aiBehaviourInfo.fontSize = "12px";
        this.aiBehaviourInfo.color = "white";
        Main.GuiTexture.addControl(this.aiBehaviourInfo);
        this.aiBehaviourInfo.linkWithMesh(aiBehaviourInfoPosition);
        this.aiBehaviourInfo.linkOffsetX = "-60px";

        this.getScene().onBeforeRenderObservable.add(this._update);
        this.spaceship.onWoundObservable.add(this.onWound);
        this.hud.onLockedTargetChangedObservable.add(this._updateLock);
    }

    public destroy(): void {
        this.dispose();
        if (this.circleNextPos) {
            this.circleNextPos.dispose();
        }
        this.distanceInfo.dispose();
        this.aiBehaviourInfo.dispose();
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.spaceship.onWoundObservable.removeCallback(this.onWound);
        this.hud.onLockedTargetChangedObservable.removeCallback(this._updateLock);
    }

    private _update = () => {
        this.lookAt(Main.GameCamera.position);
        this.distanceInfo.text = BABYLON.Vector3.Distance(this.spaceship.position, Main.GameCamera.position).toFixed(0) + " m";
        if (this.spaceship.controler instanceof DefaultAI) {
            this.aiBehaviourInfo.text = this.spaceship.controler.behaviour;
        }
        if (this.circleNextPos && this.circleNextPos.isVisible) {
            this.circleNextPos.position = DefaultAI.FuturePosition(
                this.spaceship,
                this.hud.player.spaceShip.projectileDurationTo(this.spaceship)
            );
            this.circleNextPos.lookAt(Main.GameCamera.position);
        }
    }

    private _updateLock = () => {
        if (this.hud.lockedTarget === this.spaceship) {
            if (!this.lockCircle) {
                this.lockCircle = SSMeshBuilder.CreateZCircleMesh(5.5, this.spaceship.getScene());
                this.lockCircle.parent = this;
                this.lockCircle.layerMask = 2;
            }
            if (!this.circleNextPos) {
                this.circleNextPos = SSMeshBuilder.CreateZCircleMesh(2, this.spaceship.getScene());
                this.circleNextPos.layerMask = 2;
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
        this.hitpointInfo.layerMask = 2;
    }
}