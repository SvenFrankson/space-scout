class Character {

    public id: number;
    public name: string;
    public station: Station;
    private _section: StationSection;
    public level: SectionLevel;
	private position: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    
    public get scene(): BABYLON.Scene {
        return this.station.scene;
    }
    public instance: CharacterInstance;

    constructor(station: Station) {
        this.station = station;
    }

    public instantiate() {
        this.instance = new CharacterInstance(this);
        let m: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("tmp_box", {size: 0.5, height: 2, width: 1}, this.scene);
        let data: BABYLON.VertexData = BABYLON.VertexData.ExtractFromMesh(m);
        data.applyToMesh(this.instance);
        m.dispose();
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
	
	private _d: number = 0;
    public get d(): number {
        return this._d;
    }
    public set d(v: number) {
        this._d = v;
        this.updatePosition();
	}
	
	private _localForward: BABYLON.Vector3 = BABYLON.Vector3.Zero();
	public get localForward(): BABYLON.Vector3 {
		this._localForward.z = Math.cos(this.d);
		this._localForward.y = 0;
		this._localForward.x = Math.sin(this.d);
		return this._localForward;
	}
	
	private _localRight: BABYLON.Vector3 = BABYLON.Vector3.Zero();
	public get localRight(): BABYLON.Vector3 {
		this._localRight.z = Math.cos(this.d + Math.PI / 2);
		this._localRight.y = 0;
		this._localRight.x = Math.sin(this.d + Math.PI / 2);
		return this._localRight;
    }

    public setXYH(x: number, y: number, h: number): void {
        this.position.copyFromFloats(x, h, y);
        this.updatePosition;
	}

	public positionAdd(delta: BABYLON.Vector3): void {
		this.position.addInPlace(delta);
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
				this.instance.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(this._section.rotation.y, this._section.rotation.x, this._section.rotation.z);
				this.instance.rotate(BABYLON.Axis.Y, this.d, BABYLON.Space.LOCAL);
            }
        }
	}

    public applyGravity(): void {
        let downRay = this.downRay();
        if (downRay) {
            let pick = this.scene.pickWithRay(downRay, (m) => { return m instanceof SectionLevelInstance });
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
            this.d = this.instance.rotationQuaternion.toEulerAngles().y - section.rotation.y;
            BABYLON.Vector3.TransformCoordinatesToRef(this.position, this._section.invertedWorldMatrix, this.position);
            this.updatePosition();
        }
    }

    public currentLevel(): SectionLevel {
        let downRay = this.downRay();
        if (downRay) {
            let pick = this.scene.pickWithRay(downRay, (m) => { return m instanceof SectionLevelInstance });
            if (pick.hit) {
                if (pick.pickedMesh instanceof SectionLevelInstance) {
                    let level: SectionLevel = pick.pickedMesh.level;
                    if (this.position.y - Math.floor(this.position.y / 5) > 4) {
                        let above: SectionLevel = level.above();
                        if (above) {
                            return above;
                        }
                    }
                    return pick.pickedMesh.level;
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