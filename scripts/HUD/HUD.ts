class HUD {

    public player: SpaceShipInputs;
    public scene: BABYLON.Scene;

    private spaceshipInfos: HUDSpaceshipInfo[] = [];
    private map: HUDMap;
    public comlink: HUDComlink;

    public target0: BABYLON.GUI.Image;
    public target1: BABYLON.GUI.Image;
    public target2: BABYLON.GUI.Image;

    private _lockedTarget: SpaceShip;
    public get lockedTarget(): SpaceShip {
        return this._lockedTarget;
    }
    public set lockedTarget(t: SpaceShip) {
        if (t === this._lockedTarget) {
            return;
        }
        this._lockedTarget = t;
        this.onLockedTargetChangedObservable.notifyObservers(this._lockedTarget);
    }
    public onLockedTargetChangedObservable: BABYLON.Observable<SpaceShip> = new BABYLON.Observable<SpaceShip>();

    constructor(input: SpaceShipInputs, scene: BABYLON.Scene) {
        ScreenLoger.instance.log("Create HUD");
        this.player = input;
        this.scene = scene;
        this.scene.onBeforeRenderObservable.add(this._update);

        let w: number = Main.Canvas.width;
		let h: number = Main.Canvas.height;
		let r: number = Math.min(w, h);
        let size: number = r / 1.5;
        
        this.target0 = new BABYLON.GUI.Image("target0", "./datas/textures/hud/target1.png");
        this.target0.width = size + "px";
        this.target0.height = size + "px";
        Main.GuiTexture.addControl(this.target0);
        this.target1 = new BABYLON.GUI.Image("target1", "./datas/textures/hud/target2.png");
        this.target1.width = size / 2 + "px";
        this.target1.height = size / 2 + "px";
        Main.GuiTexture.addControl(this.target1);
        this.target2 = new BABYLON.GUI.Image("target2", "./datas/textures/hud/target3.png");
        this.target2.width = size / 6 + "px";
        this.target2.height = size / 6 + "px";
        Main.GuiTexture.addControl(this.target2);

        this.map = new HUDMap(this);
        this.comlink = new HUDComlink(this.scene, Main.GuiTexture);
    }

    public destroy(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
        while (this.spaceshipInfos.length > 0) {
            let spaceshipInfo = this.spaceshipInfos[0];
            spaceshipInfo.destroy();
            this.spaceshipInfos.splice(0, 1);
        }
        this.target0.dispose();
        this.target1.dispose();
        this.target2.dispose();
        this.map.destroy();
    }

    private _update = () => {
        this._updateSpaceshipInfos();
        if (this.lockedTarget) {
            if (this.player.spaceShip.focalPlane) {
                this.player.spaceShip.focalPlane.position.z = BABYLON.Vector3.Distance(this.player.spaceShip.position, this.lockedTarget.position);
            }
        }
    }

    private _updateSpaceshipInfos(): void {
        SpaceShipControler.Instances.forEach(
            (spaceShipControler) => {
                if (!(spaceShipControler instanceof SpaceShipInputs)) {
                    let spaceship = spaceShipControler.spaceShip;
                    let spaceshipInfo = this.spaceshipInfos.find(ssInfo => { return ssInfo.spaceship === spaceship; })
                    if (!spaceshipInfo) {
                        this.spaceshipInfos.push(
                            new HUDSpaceshipInfo(spaceship, this)
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