class Level0 implements ILevel {
  public introDialogs: string[] = [
    "- Jack, your squad should now be reaching the zone.",
    "- Our drones dropped four beacons here.",
    "- Find and activate the beacons, so we can analyze their data.",
    "- The beacons should appear on your radar. Good luck, stay safe !"
  ];

  public tipDialogs: string[] = [
    "- Ok captain. Driving a SpaceShip for dummies.",
    "- Lesson 1 - Use your mouse to rotate the ship.",
    "- Lesson 2 - Press W to accelerate.",
    "- Lesson 3 - Press A or D key to do a barrel-roll.",
    "- Lesson 4 - Press Q or E to assign task to your squad.",
    "- Lesson 5 - Upgrade to Premium Account to unlock blasters.",
    "- And... That's it. Let's find the beacons."
  ];

  public dialogs: string[] = [
    "- First beacon activated. Analysis completed. Non-relevant. Three left. Keep on.",
    "- Second beacon activated. Analysis completed. All clear. Two left. Keep on.",
    "- Third beacon activated. Analysis completed. Corrupted data. One left. Keep on.",
    "- Fourth beacon activated. Analysis completed. Got it ! That's all we needed. Mission accomplished !",
    "- Well done Jack ! Get back to base. Over."
  ];

  public LoadLevel(scene: BABYLON.Scene): void {
    let beaconMasterName: string = "beacon";
    let beaconMaster: BABYLON.Mesh = Loader.LoadedStatics[beaconMasterName][0];
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
                  Comlink.Display(
                    "MotherShip",
                    this.dialogs[BeaconEmiter.activatedCount - 1],
                    "aff9ff"
                  );
                }
              }
            }
          }
        );
      }
    }
    Main.State = State.Ready;
  }

  public OnGameStart(): void {
    let delay: number = 1000;
    for (let i: number = 0; i < this.introDialogs.length; i++) {
      setTimeout(
        () => {
          Comlink.Display("MotherShip", this.introDialogs[i], "aff9ff");
        },
        delay
      );
      delay += 6000;
    }
    for (let i: number = 0; i < this.tipDialogs.length; i++) {
      setTimeout(
        () => {
          Comlink.Display("Voyoslov", this.tipDialogs[i], "ffffff");
        },
        delay
      );
      delay += 3000;
    }
  }
}
