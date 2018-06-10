/// <reference path="./SpaceShipAI.ts"/>

class AggroTableCell {
    public spaceShipControler: SpaceShipControler;
    public aggro: number;

    constructor(spaceShipControler: SpaceShipControler, aggro: number = 0) {
        this.spaceShipControler = spaceShipControler;
        this.aggro = aggro;
    }
}

class AggroTable {

    public cells: AggroTableCell[];

    constructor() {
        this.cells = [];
    }

    public get length(): number {
        return this.cells.length;
    }

    public push(spaceShipControler: SpaceShipControler, aggro: number = 0) {
        this.cells.push(new AggroTableCell(spaceShipControler, aggro));
    }

    public get(spaceShipControler: SpaceShipControler): AggroTableCell {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].spaceShipControler === spaceShipControler) {
                return this.cells[i];
            }
        }
    }

    public getAt(i: number) {
        return this.cells[i];
    }

    public remove(spaceShipControler: SpaceShipControler) {
        let index = this.indexOf(spaceShipControler);
        if (index !== -1) {
            this.removeAt(index);
        }
    }

    public removeAt(i: number) {
        this.cells.splice(i, 1);
    }

    public indexOf(spaceShipControler: SpaceShipControler): number {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].spaceShipControler === spaceShipControler) {
                return i;
            }
        }
        return -1;
    }

    public sortStep(): void {
        for (let i = 0; i < this.cells.length - 1; i++) {
            let c0 = this.cells[i];
            let c1 = this.cells[i + 1];
            if (c1.aggro > c0.aggro * 1.1) {
                this.cells[i + 1] = c0;
                this.cells[i] = c1;
            }
        }
    }
}

class DefaultAI extends SpaceShipAI {

    private _aggroTable: AggroTable;

    constructor(spaceShip: SpaceShip, role: ISquadRole, team: number, scene: BABYLON.Scene) {
        super(spaceShip, role, team, scene);
        this._mode = IIABehaviour.Follow;
        this._aggroTable = new AggroTable();
        spaceShip.onWoundObservable.add(this._onWound);
    }

    private _updateAggroTable = () => {
        SpaceShipControler.Instances.forEach(
            (spaceShipControler) => {
                if (spaceShipControler.team !== this.team) {
                    if (this._aggroTable.indexOf(spaceShipControler) === -1) {
                        if (spaceShipControler instanceof SpaceShipInputs) {
                            this._aggroTable.push(spaceShipControler, 0);
                        }
                        else {
                            this._aggroTable.push(spaceShipControler, 10);
                        }
                    }
                }
            }
        )
        let i = 0;
        while (i < this._aggroTable.length) {
            if (!this._aggroTable.getAt(i).spaceShipControler.spaceShip.isAlive) {
                this._aggroTable.removeAt(i);
            }
            else {
                i++;
            }
        }
        this._aggroTable.sortStep();
    }

    public findTarget(): SpaceShipControler {
        this._updateAggroTable();
        let cell = this._aggroTable.getAt(0);
        if (cell) {
            return cell.spaceShipControler;
        }
    }

    public escapeDistance: number = 150;
    private _tmpEscapeDistance: number = 150;
    public checkInputs(dt: number): void {
        let target = this.findTarget();
        if (target) {
            let futureTargetPosition = DefaultAI.FuturePosition(target.spaceShip, this.spaceShip.projectileDurationTo(target.spaceShip));
            let distanceToTarget = BABYLON.Vector3.Distance(this.spaceShip.position, futureTargetPosition);
            let directionToTarget = futureTargetPosition.subtract(this.spaceShip.position).normalize();
            let angleToTarget = Math.acos(BABYLON.Vector3.Dot(directionToTarget, this.spaceShip.localZ));
            // Cas "Face à la cible"
            if (angleToTarget < Math.PI * 0.5) {
                this._tmpEscapeDistance = this.escapeDistance;
                if (angleToTarget < Math.PI / 16) {
                    this.spaceShip.shoot(directionToTarget);
                }
                if (distanceToTarget > 20) {
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._inputToPosition(target.position, dt);
                }
                else {
                    directionToTarget.scaleInPlace(-1);
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._fullThrust(dt);
                }
            }
            // Cas "Dos à la cible"
            else {
                this._tmpEscapeDistance -= this.escapeDistance / 5 * dt;
                if (distanceToTarget > this._tmpEscapeDistance) {
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._inputToPosition(target.position, dt);
                }
                else {
                    directionToTarget.scaleInPlace(-1);
                    this._inputToDirection(directionToTarget, target.spaceShip.localY, dt);
                    this._fullThrust(dt);
                }
            }
        }
    }

    private _inputToPosition(position: BABYLON.Vector3, dt: number): void {
        let distance = BABYLON.Vector3.Distance(this._spaceShip.position, position);
        this._spaceShip.forwardInput = distance / 50;
    }

    private _fullThrust(dt: number): void {
        this._spaceShip.forwardInput = 1;
    }

    private _inputToDirection(direction: BABYLON.Vector3, up: BABYLON.Vector3, dt: number): void {
        let angleAroundY: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localY);
        this._spaceShip.yawInput = (angleAroundY - this._spaceShip.yaw * 0.25) / Math.PI * 20;
    
        let angleAroundX: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localX);
        this._spaceShip.pitchInput = (angleAroundX - this.spaceShip.pitch * 0.25) / Math.PI * 20;
    
        let angleAroundZ: number = SpaceMath.AngleFromToAround(up, this._spaceShip.localY, this._spaceShip.localZ);
        this._spaceShip.rollInput =  (angleAroundZ - this.spaceShip.roll * 0.25) / Math.PI;
    }

    private _onWound = (projectile: Projectile) => {
        let aggroCell = this._aggroTable.get(projectile.shooter.controler);
        if (aggroCell) {
            aggroCell.aggro += projectile.power;
        }
    }
}
