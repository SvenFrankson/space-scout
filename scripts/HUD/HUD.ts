class HUD {

    public scene: BABYLON.Scene;
    private spaceshipInfos: HUDSpaceshipInfo[] = [];

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.scene.onBeforeRenderObservable.add(this._updateSpaceshipInfos);
    }

    public destroy(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._updateSpaceshipInfos);
        while (this.spaceshipInfos.length > 0) {
            let spaceshipInfo = this.spaceshipInfos[0];
            spaceshipInfo.destroy();
            this.spaceshipInfos.splice(0, 1);
        }
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