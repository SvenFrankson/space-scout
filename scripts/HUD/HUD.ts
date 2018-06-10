class HUD {

    public scene: BABYLON.Scene;
    private spaceshipInfos: HUDSpaceshipInfo[] = [];
    public target0: BABYLON.GUI.Image;
    public target1: BABYLON.GUI.Image;
    public target2: BABYLON.GUI.Image;

    constructor(input: SpaceShipInputs, scene: BABYLON.Scene) {
        this.scene = scene;
        this.scene.onBeforeRenderObservable.add(this._updateSpaceshipInfos);
        let w: number = Main.Canvas.width;
		let h: number = Main.Canvas.height;
		let r: number = Math.min(w, h);
        let size: number = r / 1.5;
        
        this.target0 = new BABYLON.GUI.Image("target0", "./datas/textures/hud/target1.png");
        this.target0.width = size + "px";
        this.target0.height = size + "px";
        Main.GuiTexture.addControl(this.target0);
        this.target1 = new BABYLON.GUI.Image("target0", "./datas/textures/hud/target2.png");
        this.target1.width = size / 2 + "px";
        this.target1.height = size / 2 + "px";
        Main.GuiTexture.addControl(this.target1);
        this.target2 = new BABYLON.GUI.Image("target0", "./datas/textures/hud/target3.png");
        this.target2.width = size / 4 + "px";
        this.target2.height = size / 4 + "px";
        Main.GuiTexture.addControl(this.target2);
    }

    public destroy(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._updateSpaceshipInfos);
        while (this.spaceshipInfos.length > 0) {
            let spaceshipInfo = this.spaceshipInfos[0];
            spaceshipInfo.destroy();
            this.spaceshipInfos.splice(0, 1);
        }
        this.target0.dispose();
        this.target1.dispose();
        this.target2.dispose();
    }

    private _updateSpaceshipInfos = () => {
        SpaceShipControler.Instances.forEach(
            (spaceShipControler) => {
                if (!(spaceShipControler instanceof SpaceShipInputs)) {
                    let spaceship = spaceShipControler.spaceShip;
                    let spaceshipInfo = this.spaceshipInfos.find(ssInfo => { return ssInfo.spaceship === spaceship; })
                    if (!spaceshipInfo) {
                        this.spaceshipInfos.push(
                            new HUDSpaceshipInfo(spaceship)
                        );
                    }
                }
            }
        )
        let i = 0;
        while (i < this.spaceshipInfos.length) {
            let spaceshipInfo = this.spaceshipInfos[i];
            if (!spaceshipInfo.spaceship.isAlive) {
                spaceshipInfo.destroy();
                this.spaceshipInfos.splice(i, 1);
            }
            else {
                i++;
            }
        }
    }
}