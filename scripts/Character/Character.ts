class Character {

    public id: number;
    public name: string;
    public station: Station;
    private _section: StationSection;
    public level: SectionLevel;
	private position: BABYLON.Vector3 = BABYLON.Vector3.Zero();
	private rotation: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    
    public get scene(): BABYLON.Scene {
        return this.station.scene;
    }
    public instance: CharacterInstance;

    constructor(station: Station) {
        this.station = station;
    }

    public instantiate() {
        this.instance = new CharacterInstance(this);
        this.scene.registerBeforeRender(this.updateRotation);
    }

    public get x(): number {
        return this.position.x;
    }
    public set x(v: number) {
        this.position.x = v;
        this.updatePosition();
    }
    
    public get y(): number {
        return this.position.z;
    }
    public set y(v: number) {
        this.position.z = v;
        this.updatePosition();
    }
    
    public get h(): number {
        return this.position.y;
    }
    public set h(v: number) {
        this.position.y = v;
        this.updatePosition();
    }
	
	private _localForward: BABYLON.Vector3 = BABYLON.Vector3.One();
	public get localForward(): BABYLON.Vector3 {
		if (this.instance) {
            this.instance.getDirectionToRef(BABYLON.Axis.Z, this._localForward);
            if (this._section) {
                BABYLON.Vector3.TransformNormalToRef(this._localForward, this._section.invertedWorldMatrix, this._localForward);
            }
        }
		return this._localForward;
	}
	
	private _localRight: BABYLON.Vector3 = BABYLON.Vector3.One();
	public get localRight(): BABYLON.Vector3 {
		if (this.instance) {
            this.instance.getDirectionToRef(BABYLON.Axis.X, this._localRight);
            if (this._section) {
                BABYLON.Vector3.TransformNormalToRef(this._localRight, this._section.invertedWorldMatrix, this._localRight);
            }
        }
		return this._localRight;
    }
	
	private _localUp: BABYLON.Vector3 = BABYLON.Vector3.One();
	public get localUp(): BABYLON.Vector3 {
		if (this.instance) {
            this.instance.getDirectionToRef(BABYLON.Axis.Y, this._localUp);
        }
		return this._localUp;
    }

    public setXYH(x: number, y: number, h: number): void {
        this.position.copyFromFloats(x, h, y);
        this.updatePosition;
	}

	public positionAdd(delta: BABYLON.Vector3): void {
		this.position.addInPlace(delta);
		this.updatePosition();
    }
    
    private _tmpQuaternion: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    public rotate(angle: number): void {
        BABYLON.Quaternion.RotationAxisToRef(this.localUp, angle, this._tmpQuaternion);
        this._tmpQuaternion.multiplyInPlace(this.rotation);
        this.rotation.copyFrom(this._tmpQuaternion);
		this.updatePosition();
    }

    public updatePosition(): void {
        if (this._section) {
            let currentSection = this.currentSection();
            if (currentSection) {
                this.setSection(currentSection);
            }
            if (this.instance) {
                this.applyGravity();
				BABYLON.Vector3.TransformCoordinatesToRef(this.position, this._section.worldMatrix, this.instance.position);
            }
        }
    }
    
    public updateRotation = () => {
        this.instance.rotationQuaternion.copyFrom(this.rotation);
        let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(
            BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.instance.getWorldMatrix())
        );
        let targetUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(this.instance.absolutePosition);
        let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(currentUp, targetUp);
        let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));
        let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle);
        this.instance.rotationQuaternion = rotation.multiply(this.instance.rotationQuaternion);
        this.rotation.copyFrom(this.instance.rotationQuaternion);
    }

    public applyGravity(): void {
        let downRay = this.downRay();
        if (downRay) {
            let pick = this.scene.pickWithRay(downRay, (m) => { return SectionLevel.SectionLevels.get(parseInt(m.id)) !== undefined });
            if (pick.hit) {
                this.position.y += 0.9 - pick.distance;
            }
        }
    }

    private _downRay: BABYLON.Ray;
    public downRay(): BABYLON.Ray {
        if (this.instance) {
            if (!this._downRay) {
                this._downRay = new BABYLON.Ray(BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, -1, 0), 6);
            }
            this._downRay.origin.copyFrom(this.instance.absolutePosition);
            this._downRay.origin.addInPlace(this._localUp.scale(0.9));
            this.instance.getDirectionToRef(BABYLON.Axis.Y, this._downRay.direction);
            this._downRay.direction.scaleInPlace(-1);
        } else {
            this._downRay = null;
        }
        return this._downRay;
    }

    public currentSection(): StationSection {
        let currentLevel = this.currentLevel();
        if (currentLevel) {
            return currentLevel.section;
        }
        return null;
    }

    public setSection(section: StationSection): void {
        if (!this._section) {
            this._section = section;
        }
        else if (this._section !== section) {
            BABYLON.Vector3.TransformCoordinatesToRef(this.position, this._section.worldMatrix, this.position);
            this._section = section;
            BABYLON.Vector3.TransformCoordinatesToRef(this.position, this._section.invertedWorldMatrix, this.position);
            this.updatePosition();
        }
    }

    public currentLevel(): SectionLevel {
        let downRay = this.downRay();
        if (downRay) {
            let pick = this.scene.pickWithRay(downRay, (m) => { return SectionLevel.SectionLevels.get(parseInt(m.id)) !== undefined });
            if (pick.hit) {
                if (pick.pickedMesh) {
                    let level: SectionLevel = SectionLevel.SectionLevels.get(parseInt(pick.pickedMesh.id));
                    if (this.position.y - Math.floor(this.position.y / 5) > 4) {
                        let above: SectionLevel = level.above();
                        if (above) {
                            return above;
                        }
                    }
                    return level;
                }
            }
        }
        return null;
    }

    public disposeInstance() {
        this.instance.dispose();
        this.instance = undefined;
    }
}