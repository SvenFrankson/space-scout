class HUDMap extends BABYLON.GUI.Image {

    public icons: MapIcon[] = [];

    constructor(
        public hud: HUD
    ) {
        super("hudMap", "./datas/textures/hud/map.png");
        this.width = "256px";
        this.height = "256px";
        this.left = "32px";
        this.top = "32px";
        this.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        Main.GuiTexture.addControl(this);

        this.hud.scene.onBeforeRenderObservable.add(this._update);
    }

    public destroy(): void {
        this.dispose();
        this.hud.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
        this._updateIcons();
    }

    private _updateIcons(): void {
        SpaceShipControler.Instances.forEach(
            (spaceShipControler) => {
                if (!(spaceShipControler instanceof SpaceShipInputs)) {
                    let spaceship = spaceShipControler.spaceShip;
                    let icon = this.icons.find(icon => { return icon.object === spaceship; })
                    if (!icon) {
                        this.icons.push(
                            new MapIcon(spaceship, this)
                        );
                    }
                }
            }
        )
        let i = 0;
        while (i < this.icons.length) {
            let icon = this.icons[i];
            if (icon.object instanceof SpaceShip) {
                if (!icon.object.isAlive) {
                    icon.destroy();
                    this.icons.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            else {
                i++;
            }
        }
    }
}