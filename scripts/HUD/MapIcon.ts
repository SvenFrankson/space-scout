interface IMapableObject {
    name: string;
    position: BABYLON.Vector3;
    getScene: () => BABYLON.Scene;
}

class MapIcon extends BABYLON.GUI.Image {

    public get hud(): HUD {
        return this.map.hud;
    }

    public static MapIconURLFromObject(object: IMapableObject): string {
        return "./datas/textures/hud/map-icon-blue.png";
    }

    constructor(
        public object: IMapableObject,
        public map: HUDMap
    ) {
        super("mapIcon-" + object.name, MapIcon.MapIconURLFromObject(object));
        this.width = "32px";
        this.height = "32px";
        this.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        Main.GuiTexture.addControl(this);

        this.object.getScene().onBeforeRenderObservable.add(this._update);
    }

    public destroy(): void {
        this.dispose();
        this.object.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
        let relPos: BABYLON.Vector3 = this.object.position.subtract(this.hud.input.spaceShip.position);
        let angularPos: number = SpaceMath.Angle(relPos, this.hud.input.spaceShip.localZ) / Math.PI;
        let rollPos: number = SpaceMath.AngleFromToAround(this.hud.input.spaceShip.localY, relPos, this.hud.input.spaceShip.localZ);
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
}