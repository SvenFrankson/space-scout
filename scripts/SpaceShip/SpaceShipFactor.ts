enum ISquadRole {
  Leader,
  WingMan
}

interface ISpaceShip {
  name: string;
  url: string;
  x: number;
  y: number;
  z: number;
  team: number;
  role: ISquadRole;
}

class SpaceShipFactory {
  public static AddSpaceShipToScene(
    data: ISpaceShip,
    scene: BABYLON.Scene,
    callback?: () => {}
  ): void {
    let spaceShip: SpaceShip = new SpaceShip(data.name, Main.Scene);
    spaceShip.initialize(
      data.url,
      () => {
        let spaceshipAI: WingManAI;
        if (data.role === ISquadRole.WingMan) {
          spaceshipAI = new WingManAI(spaceShip, new BABYLON.Vector3(30, -10, 15), data.role, data.team, Main.Scene);
        }
        spaceShip.attachControler(spaceshipAI);
        if (callback) {
          callback();
        }
      }
    );
    spaceShip.position.copyFromFloats(data.x, data.y, data.z);
  }
}
