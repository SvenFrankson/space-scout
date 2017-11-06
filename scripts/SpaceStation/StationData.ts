class EasyGUID {
    private static _current: number = 0;

    public static GetNewGUID(): number {
        EasyGUID._current++;
        return EasyGUID._current;
    }
}

class LevelData {

    public name: string;
    public index: number;
    public level: number;
    public joinedLevels: number[];
}

class SectionData {

    public name: string;
    public index: number;
    public outer: LevelData;
    public levels: LevelData[] = [];
    public position: BABYLON.Vector3;
    public rotation: BABYLON.Vector3;
}

class StationData {

    public name: string;
    public index: number;
    public sections: SectionData[] = [];
}

class Test {
    public static TestDataOne(): StationData {
        let data: StationData = new StationData();
        data.name = "TestOne";
        data.index = EasyGUID.GetNewGUID();

        let rotationMatrix: BABYLON.Matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, 2 * Math.PI / 30);

        let sectionZero: SectionData = new SectionData();
        sectionZero.name = "Section-" + 0;
        sectionZero.index = EasyGUID.GetNewGUID();
        sectionZero.outer = {
            name: "outer",
            index: EasyGUID.GetNewGUID(),
            level: -1,
            joinedLevels: []
        };
        sectionZero.levels = [
            {
                name: "Level-0",
                index: EasyGUID.GetNewGUID(),
                level: 0,
                joinedLevels: []
            },
            {
                name: "Level-1",
                index: EasyGUID.GetNewGUID(),
                level: 1,
                joinedLevels: []
            }
        ];
        sectionZero.position = new BABYLON.Vector3(0, 150, 0);
        sectionZero.rotation = new BABYLON.Vector3(0, 0, 0);
        data.sections[0] = sectionZero;

        for (let i: number = 1; i < 30; i++) {
            let section: SectionData = new SectionData();
            section.name = "Section-" + i;
            section.index = EasyGUID.GetNewGUID();
            section.outer = {
                name: "outer",
                index: EasyGUID.GetNewGUID(),
                level: -1,
                joinedLevels: []
            };
            section.levels = [
                {
                    name: "level-0",
                    index: EasyGUID.GetNewGUID(),
                    level: 0,
                    joinedLevels: []
                },
                {
                    name: "level-1",
                    index: EasyGUID.GetNewGUID(),
                    level: 1,
                    joinedLevels: []
                }
            ];
            section.position = BABYLON.Vector3.TransformCoordinates(data.sections[i - 1].position, rotationMatrix);
            section.rotation = new BABYLON.Vector3(2 * Math.PI / 30 * i, 0, 0);
            data.sections[i] = section;
        }

        for (let i: number = 0; i < 30; i++) {
            let previousSection: SectionData = data.sections[(i - 1 + 30) % 30];
            let section: SectionData = data.sections[i];
            let nextSection: SectionData = data.sections[(i + 1) % 30];

            section.outer.joinedLevels.push(previousSection.outer.index);
            section.outer.joinedLevels.push(nextSection.outer.index);

            for (let j: number = 0; j < section.levels.length; j++) {
                section.levels[j].joinedLevels.push(previousSection.levels[j].index);
                section.levels[j].joinedLevels.push(nextSection.levels[j].index);
            }
        }

        return data;
    }
}