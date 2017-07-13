abstract class SpaceShipControler {
  public static Instances: SpaceShipControler[] = [];

  protected _spaceShip: SpaceShip;
  public get spaceShip(): SpaceShip {
    return this._spaceShip;
  }
  private _role: ISquadRole;
  public get role(): ISquadRole {
    return this._role;
  }
  private _team: number;
  public get team(): number {
    return this._team;
  }

  public get position(): BABYLON.Vector3 {
    return this.spaceShip.position;
  }

  constructor(spaceShip: SpaceShip, role: ISquadRole, team: number) {
    this._spaceShip = spaceShip;
    this._role = role;
    this._team = team;
    SpaceShipControler.Instances.push(this);
  }

  public abstract checkInputs(dt: number): void;
}
