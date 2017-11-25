class SectionLevel {

    public static SectionLevels: Map<number, SectionLevel> = new Map<number, SectionLevel>();

    public name: string = "NewLevel";
    public index: number;
    public level: number;
    private _joinedLevelsIds: number[];
    private _joinedLevels: SectionLevel[];
    public get joinedLevels(): SectionLevel[] {
        if (!this._joinedLevels) {
            this._joinedLevels = [];
            for (let i: number = 0; i < this._joinedLevelsIds.length; i++) {
                this._joinedLevels.push(SectionLevel.SectionLevels.get(this._joinedLevelsIds[i]));
            }
        }
        return this._joinedLevels;
    }
    public section: StationSection;
    public get scene(): BABYLON.Scene {
        return this.section.scene;
    }
    public instance: BABYLON.InstancedMesh;

    constructor(section: StationSection) {
        this.section = section;
    }

    public load(data: LevelData, callback?: () => void): void {
        console.log("Load Level");
        this.name = data.name;
        this.index = data.index;
        this.level = data.level;
        this._joinedLevelsIds = data.joinedLevels;
        SectionLevel.SectionLevels.set(this.index, this);
    }

    public above(): SectionLevel {
        if (this.section) {
            return this.section.levels[this.level + 1];
        }
        return undefined;
    }
    
    public below(): SectionLevel {
        if (this.section) {
            return this.section.levels[this.level - 1];
        }
        return undefined;
    }

    public instantiate(callback?: () => void): void {
        if (this.instance) {
            if (callback) {
                callback();
            }
            return;
        }
        MeshLoader.instance.get(
            "SectionLevels/" + this.name,
            (mesh) => {
                if (!mesh) {
                    console.warn("Could not instance " + this.name);
                }
                this.instance = mesh;
                this.instance.position.copyFrom(this.section.position);
                this.instance.rotation.copyFrom(this.section.rotation);
                this.instance.id = this.index + "";
                if (callback) {
                    callback();
                }
            }
        );
    }

    public static InstantiateRecursively(levels: SectionLevel[], callback?: () => void): void {
        let level = levels.pop();
        if (level) {
            level.instantiate(
                () => {
                    SectionLevel.InstantiateRecursively(levels, callback);
                }
            );
        } else {
            if (callback) {
                callback();
            }
        }
    }

    public disposeInstance(): void {
        if (this.instance) {
            this.instance.dispose();
        }
        this.instance = undefined;
    }
}