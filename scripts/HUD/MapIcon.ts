interface IMapableObject {
    name: string;
    position: BABYLON.Vector3;
    getScene: () => BABYLON.Scene;
}

class MapIcon extends BABYLON.GUI.Image {

    public get hud(): HUD {
        return this.map.hud;
    }
    public get player(): SpaceShipInputs {
        return this.hud.player;
    }

    constructor(
        public object: IMapableObject,
        public map: HUDMap
    ) {
        super("mapIcon-" + object.name, "./datas/textures/hud/map-icon-blue.png");
        this._updateIcon();
        this.width = "32px";
        this.height = "32px";
        this.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        Main.GuiTexture.addControl(this);

        this.hud.onLockedTargetChangedObservable.add(this._updateIcon);
        this.object.getScene().onBeforeRenderObservable.add(this._update);
    }

    public destroy(): void {
        this.dispose();
        this.hud.onLockedTargetChangedObservable.removeCallback(this._updateIcon);
        this.object.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
        let relPos: BABYLON.Vector3 = this.object.position.subtract(this.hud.player.spaceShip.position);
        let angularPos: number = SpaceMath.Angle(relPos, this.hud.player.spaceShip.localZ) / Math.PI;
        let rollPos: number = SpaceMath.AngleFromToAround(this.hud.player.spaceShip.localY, relPos, this.hud.player.spaceShip.localZ);
        let iconPos: BABYLON.Vector2 = new BABYLON.Vector2(
            - Math.sin(rollPos) * angularPos,
            - Math.cos(rollPos) * angularPos
        );
        iconPos.scaleInPlace(2);
        let l = iconPos.length();
        if (l > 1) {
            iconPos.scaleInPlace(1 / l);
        }
        this.left = Math.round(32 + 128 + iconPos.x * 128 * 0.8 - 16) + "px";
        this.top = Math.round(32 + 128 + iconPos.y * 128 * 0.8 - 16) + "px";
    }

    private _updateIcon = () => {
        if (this.object instanceof SpaceShip) {
            if (this.object.controler.team === this.player.team) {
                if (this.object === this.hud.lockedTarget) {
                    this.source = "./datas/textures/hud/map-icon-spaceship-locked-green.png"
                }
                else {
                    this.source = "./datas/textures/hud/map-icon-spaceship-green.png"
                }
            }
            else {
                if (this.object === this.hud.lockedTarget) {
                    this.source = "./datas/textures/hud/map-icon-spaceship-locked-red.png"
                }
                else {
                    this.source = "./datas/textures/hud/map-icon-spaceship-red.png"
                }
            }
        }
    }
}