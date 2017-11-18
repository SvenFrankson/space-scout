enum LodLevel {
    Outer = 0,
    Inner = 1
}

class StationSection {
    
    public name: string = "NewSection";
    public index: number;
    public station: Station;
    public outer: SectionLevel;
    public levels: SectionLevel[] = [];
    public position: BABYLON.Vector3;
    public rotation: BABYLON.Vector3;
    public worldMatrix: BABYLON.Matrix;
    public invertedWorldMatrix: BABYLON.Matrix;
    public get scene(): BABYLON.Scene {
        return this.station.scene;
    }

    constructor(station: Station) {
        this.station = station;
    }

    public load(data: SectionData, callback?: () => void): void {
        console.log("Load Section");
        this.name = data.name;
        this.index = data.index;
        this.position = data.position.clone();
        this.rotation = data.rotation.clone();
        this.worldMatrix = BABYLON.Matrix.Compose(
            BABYLON.Vector3.One(),
            BABYLON.Quaternion.RotationYawPitchRoll(this.rotation.y, this.rotation.x, this.rotation.z),
            this.position
        );
        this.invertedWorldMatrix = BABYLON.Matrix.Invert(this.worldMatrix);

        this.outer = new SectionLevel(this);
        this.outer.load(data.outer);

        for (let i: number = 0; i < data.levels.length; i++) {
            let level: SectionLevel = new SectionLevel(this);
            level.load(data.levels[i]);
            this.levels[i] = level;
        }
    }

    public instantiate(level: number, callback?: () => void): void {
        if (level === -1) {
            for (let i: number = 0; i < this.levels.length; i++) {
                this.levels[i].disposeInstance();
            }
            this.outer.instantiate(callback);
        }
        else {
            this.outer.disposeInstance();
            for (let i: number = level + 1; i < this.levels.length; i++) {
                this.levels[i].disposeInstance();
            }
            let levels: SectionLevel[] = [];
            for (let i: number = 0; i < this.levels.length && i <= level; i++) {
                levels.push(this.levels[i]);
            }
            SectionLevel.InstantiateRecursively(levels, callback);
        }
    }

    public static InstantiateRecursively(sections: StationSection[], level: number, callback?: () => void): void {
        let station = sections.pop();
        if (station) {
            station.instantiate(
                level,
                () => {
                    StationSection.InstantiateRecursively(sections, level, callback);
                }
            );
        } else {
            if (callback) {
                callback();
            }
        }
    }
}