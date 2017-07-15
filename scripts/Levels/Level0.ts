class Level0 implements ILevel {

  public LoadLevel(scene: BABYLON.Scene): void {
    let beaconMaster: BABYLON.Mesh = Loader.LoadedStatics["beacon"][0];
    if (beaconMaster) {
      let instances: BABYLON.InstancedMesh[] = beaconMaster.instances;
      for (let i: number = 0; i < instances.length; i++) {
        let b: BABYLON.InstancedMesh = instances[i];
        let emit: BABYLON.Mesh;
        BABYLON.SceneLoader.ImportMesh(
          "",
          "./datas/beacon-emit.babylon",
          "",
          scene,
          (
            meshes: BABYLON.AbstractMesh[],
            particleSystems: BABYLON.ParticleSystem[],
            skeletons: BABYLON.Skeleton[]
          ) => {
            if (meshes[0] instanceof BABYLON.Mesh) {
              emit = meshes[0] as BABYLON.Mesh;
              emit.position.copyFrom(b.position);
              emit.rotation.copyFrom(b.rotation);
              emit.material = new ShieldMaterial("Emiter" + i, scene);
            }
          }
        )
        scene.registerBeforeRender(
          () => {
            for (let i: number = 0; i < SpaceShipControler.Instances.length; i++) {
              let spaceShip: SpaceShipControler = SpaceShipControler.Instances[i];
              if (BABYLON.Vector3.DistanceSquared(spaceShip.position, b.position) < 400) {
                if (emit.material instanceof ShieldMaterial) {
                  emit.material.flashAt(BABYLON.Vector3.Zero(), 0.1);
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
