class Level0 implements ILevel {

  private _spaceShipIndex: number = 0;

  public LoadLevel(scene: BABYLON.Scene): void {
    let beaconMaster: BABYLON.Mesh = Loader.LoadedStatics["beacon"][0];
    if (beaconMaster) {
      let instances: BABYLON.InstancedMesh[] = beaconMaster.instances;
      for (let i: number = 0; i < instances.length; i++) {
        let b: BABYLON.InstancedMesh = instances[i];
        scene.registerBeforeRender(
          () => {
            this._spaceShipIndex++;
            let spaceShip: SpaceShipControler = SpaceShipControler.Instances[this._spaceShipIndex];
            if (!spaceShip) {
              this._spaceShipIndex = 0;
              spaceShip = SpaceShipControler.Instances[this._spaceShipIndex];
            }
            if (BABYLON.Vector3.DistanceSquared(spaceShip.position, b.position) < 400) {
              Comlink.Display(["- Beacon found !"]);
            }
          }
        );
      }
    }
  }

  public OnGameStart(): void {
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[0], 10000);
      },
      3000
    );
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[1], 10000);
      },
      16000
    );
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[2], 10000);
      },
      29000
    );
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[3], 10000);
      },
      42000
    );

  }
}
