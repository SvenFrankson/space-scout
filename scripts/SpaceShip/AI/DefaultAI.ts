/// <reference path="./SpaceShipAI.ts"/>

class AggroTableCell {

    constructor(public target: IWoundable, public aggro: number = 0) {}
}

class AggroTable {

    public cells: AggroTableCell[];

    constructor() {
        this.cells = [];
    }

    public get length(): number {
        return this.cells.length;
    }

    public push(target: IWoundable, aggro: number = 0) {
        this.cells.push(new AggroTableCell(target, aggro));
    }

    public get(target: IWoundable): AggroTableCell {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].target === target) {
                return this.cells[i];
            }
        }
    }

    public getAt(i: number) {
        return this.cells[i];
    }

    public remove(target: IWoundable) {
        let index = this.indexOf(target);
        if (index !== -1) {
            this.removeAt(index);
        }
    }

    public removeAt(i: number) {
        this.cells.splice(i, 1);
    }

    public indexOf(target: IWoundable): number {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].target === target) {
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
    private _initialPosition: BABYLON.Vector3;
    private idleRange: number = 50;
    private _idlePosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public behaviour: string;
    private _patrolIndex: number = 0;
    public patrolRange: number = 20;
    public patrolPositions: BABYLON.Vector3[];

    constructor(spaceShip: SpaceShip, role: ISquadRole, team: number, scene: BABYLON.Scene, patrolPositions?: BABYLON.Vector3[]) {
        super(spaceShip, role, team, scene);
        this._initialPosition = spaceShip.position.clone();
        this._mode = IIABehaviour.Follow;
        this._aggroTable = new AggroTable();
        this.patrolPositions = patrolPositions;
        spaceShip.onWoundObservable.add(this._onWound);
        Spawner.onAnySpawnerSpawnObservable.add(this._onAnySpawn);
    }

    private _updateAggroTable = () => {
        SpaceShipControler.Instances.forEach(
            (spaceShipControler) => {
                if (spaceShipControler.team !== this.team) {
                    if (this._aggroTable.indexOf(spaceShipControler.spaceShip) === -1) {
                        if (spaceShipControler instanceof SpaceShipInputs) {
                            this._aggroTable.push(spaceShipControler.spaceShip, 0);
                        }
                        else {
                            this._aggroTable.push(spaceShipControler.spaceShip, 10 * Math.random());
                        }
                    }
                }
            }
        )
        Spawner.Instances.forEach(
            (spawner) => {
                if (spawner.team !== this.team) {
                    if (this._aggroTable.indexOf(spawner) === -1) {
                        this._aggroTable.push(spawner, 10 * Math.random());
                    }
                }
            }
        )
        let i = 0;
        while (i < this._aggroTable.length) {
            if (!this._aggroTable.getAt(i).target.isAlive) {
                this._aggroTable.removeAt(i);
            }
            else {
                i++;
            }
        }
        this._aggroTable.sortStep();
    }

    public findTarget(): IWoundable {
        this._updateAggroTable();
        let cell = this._aggroTable.getAt(0);
        if (cell) {
            return cell.target;
        }
    }

    public findLeader(): SpaceShipControler {
        for (let i = 0; i < SpaceShipControler.Instances.length; i++) {
            let spaceshipControler = SpaceShipControler.Instances[i];
            if (spaceshipControler !== this) {
                if (spaceshipControler.team === this.team) {
                    return spaceshipControler;
                }
            }
        }
        return undefined;
    }
    
    public throttledFindNewIdlePosition(leader: SpaceShipControler): void {
        RuntimeUtils.Throttle(
            () => {
                this.findNewIdlePosition(leader);
            },
            "findNewIdlePosition-" + SpaceShipControler.Instances.indexOf(this),
            3000
        );
    }

    public findNewIdlePosition(leader: SpaceShipControler): void {
        if (leader) {
            this._idlePosition.copyFromFloats(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).scaleInPlace(2 * this.idleRange).addInPlace(leader.position);
        }
        else {
            this._idlePosition.copyFromFloats(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).scaleInPlace(2 * this.idleRange).addInPlace(this._initialPosition);
        }
    }

    public escapeDistance: number = 150;
    private _tmpEscapeDistance: number = 150;
    private _tmpDirection: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public checkInputs(dt: number): void {
        let target = this.findTarget();
        if (target) {
            let futureTargetPosition = DefaultAI.FuturePosition(target, this.spaceShip.projectileDurationTo(target));
            let sqrDistanceToTarget = BABYLON.Vector3.DistanceSquared(this.spaceShip.position, futureTargetPosition);
            this._tmpDirection.copyFrom(futureTargetPosition).subtractInPlace(this.spaceShip.position).normalize();
            let angleToTarget = Math.acos(BABYLON.Vector3.Dot(this._tmpDirection, this.spaceShip.localZ));
            // Cas "Face à la cible"
            if (angleToTarget < Math.PI * 0.5) {
                this._tmpEscapeDistance = this.escapeDistance;
                if (angleToTarget < Math.PI / 16) {
                    this.spaceShip.shoot(this._tmpDirection);
                }
                if (sqrDistanceToTarget > 20 * 20) {
                    this.behaviour = "Track";
                    this._inputToDirection(this._tmpDirection, target.localY);
                    this._inputToPosition(target.position);
                }
                else {
                    this.behaviour = "Escape";
                    this._tmpDirection.scaleInPlace(-1);
                    this._inputToDirection(this._tmpDirection, target.localY);
                    this._fullThrust();
                }
            }
            // Cas "Dos à la cible"
            else {
                this._tmpEscapeDistance -= this.escapeDistance / 5 * dt;
                if (sqrDistanceToTarget > this._tmpEscapeDistance * this._tmpEscapeDistance) {
                    this.behaviour = "Track";
                    this._inputToDirection(this._tmpDirection, target.localY);
                    this._inputToPosition(target.position);
                }
                else {
                    this._tmpDirection.scaleInPlace(-1);
                    this.behaviour = "Escape";
                    this._inputToDirection(this._tmpDirection, target.localY);
                    this._fullThrust();
                }
            }
        }
        else if (this.patrolPositions) {
            let patrolPosition = this.patrolPositions[this._patrolIndex];
            this._tmpDirection.copyFrom(patrolPosition).subtractInPlace(this.position).normalize();
            let sqrDistanceToPatrolPosition = BABYLON.Vector3.DistanceSquared(this.position, patrolPosition);
            this.behaviour = "Patrol " + this._patrolIndex;
            this._inputToPosition(patrolPosition);
            this._inputToDirection(this._tmpDirection, BABYLON.Axis.Y);
            if (sqrDistanceToPatrolPosition < this.patrolRange * this.patrolRange) {
                this._patrolIndex = (this._patrolIndex + 1) % this.patrolPositions.length;
            }
        }
        else {
            let leader = this.findLeader();
            if (leader) {
                let sqrDistanceToLeader = BABYLON.Vector3.DistanceSquared(this.position, leader.position);
                this._tmpDirection.copyFrom(leader.position).subtractInPlace(this.position).normalize();
                if (sqrDistanceToLeader > this.idleRange * this.idleRange) {
                    this.behaviour = "GoTo Leader";
                    this._inputToPosition(leader.position);
                    this._inputToDirection(this._tmpDirection, leader.spaceShip.localY);
                }
                else {
                    this._goIdle(leader);
                }
            }
            else {
                this._goIdle(leader);
            }
        }
    }

    private _goIdle(leader?: SpaceShipControler) {
        if (!this._idlePosition) {
            this.findNewIdlePosition(leader);
        }
        let sqrDistanceToIdle = BABYLON.Vector3.DistanceSquared(this.position, this._idlePosition);
        let directionToIdle = this._idlePosition.subtract(this.position).normalize();
        if (sqrDistanceToIdle < this.idleRange * this.idleRange) {
            this.throttledFindNewIdlePosition(leader);
        }
        this.behaviour = "GoTo Idle";
        this._inputToPosition(this._idlePosition);
        this._inputToDirection(directionToIdle, BABYLON.Axis.Y);
    }

    private _inputToPosition(position: BABYLON.Vector3): void {
        let distance = BABYLON.Vector3.Distance(this._spaceShip.position, position);
        this._spaceShip.forwardInput = distance / 100;
    }

    private _fullThrust(): void {
        this._spaceShip.forwardInput = 1;
    }

    private _inputToDirection(direction: BABYLON.Vector3, up: BABYLON.Vector3): void {
        let angleAroundY: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localY);
        this._spaceShip.yawInput = (angleAroundY - this._spaceShip.yaw * 0.25) / Math.PI * 20;
    
        let angleAroundX: number = SpaceMath.AngleFromToAround(this._spaceShip.localZ, direction, this._spaceShip.localX);
        this._spaceShip.pitchInput = (angleAroundX - this.spaceShip.pitch * 0.25) / Math.PI * 20;
    
        let angleAroundZ: number = SpaceMath.AngleFromToAround(up, this._spaceShip.localY, this._spaceShip.localZ);
        this._spaceShip.rollInput =  (angleAroundZ - this.spaceShip.roll * 0.25) / Math.PI * 10;
    }

    private _onWound = (projectile: Projectile) => {
        let aggroCell = this._aggroTable.get(projectile.shooter);
        if (aggroCell) {
            aggroCell.aggro += projectile.power;
        }
    }

    private _onAnySpawn = (spawner: Spawner) => {
        if (spawner.team !== this.team) {
            let aggroCell = this._aggroTable.get(spawner);
            if (aggroCell) {
                aggroCell.aggro += 5;
            }
        }
    }
}
