class Level0 implements ILevel {

  public dialogs: string[][] = [
    [""],
    ["- One beacon transmiting."],
    ["- Second beacon transmision well received."],
    ["- Third beacon activated, loading datas."],
    ["- Fourth and last beacon all setup.", "- Well done captain !"]
  ];

  public LoadLevel(scene: BABYLON.Scene): void {
    let beaconMaster: BABYLON.Mesh = Loader.LoadedStatics["beacon"][0];
    if (beaconMaster) {
      let instances: BABYLON.InstancedMesh[] = beaconMaster.instances;
      for (let i: number = 0; i < instances.length; i++) {
        let b: BABYLON.InstancedMesh = instances[i];
        let emit: BeaconEmiter = new BeaconEmiter("Emiter-" + i, scene);
        emit.initialize();
        emit.position.copyFrom(b.position);
        emit.rotation.copyFrom(b.rotation);
        scene.registerBeforeRender(
          () => {
            emit.updateMapIcon(SpaceShipInputs.SSIInstances[0].spaceShip);
            if (!emit.activated) {
              for (let i: number = 0; i < SpaceShipControler.Instances.length; i++) {
                let spaceShip: SpaceShipControler = SpaceShipControler.Instances[i];
                if (BABYLON.Vector3.DistanceSquared(spaceShip.position, b.position) < 400) {
                  emit.activate();
                  Comlink.Display(this.dialogs[BeaconEmiter.activatedCount]);
                }
              }
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
