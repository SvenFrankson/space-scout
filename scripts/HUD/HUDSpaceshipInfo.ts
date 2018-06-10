class HUDSpaceshipInfo extends BABYLON.TransformNode {

    public spaceship: SpaceShip;
    private circle: BABYLON.LinesMesh;
    private hitpointInfo: BABYLON.LinesMesh;
    private distanceInfo: BABYLON.GUI.TextBlock;

    constructor(spaceship: SpaceShip) {
        super("hudSpaceshipInfo", spaceship.getScene());
        this.spaceship = spaceship;
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
        this.distanceInfo.dispose();
        this.spaceship.onWoundObservable.removeCallback(this.onWound);
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
        this.lookAt(this.getScene().activeCamera.position);
        this.distanceInfo.text = BABYLON.Vector3.Distance(this.spaceship.position, this.getScene().activeCamera.position).toFixed(0) + " m";
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