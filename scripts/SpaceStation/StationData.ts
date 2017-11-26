class EasyGUID {
    private static _current: number = 0;

    public static GetNewGUID(): number {
        EasyGUID._current++;
        return EasyGUID._current;
    }
}

class MetroLineData {
    public name: string;
    public index: number;
    public path: BABYLON.Vector3[] = [];
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
    public lines: MetroLineData[] = [];
}

class Test {

    public static ConnectLevels(level1: LevelData, level2: LevelData): void {
        level1.joinedLevels.push(level2.index);
        level2.joinedLevels.push(level1.index);
    }

    public static ConnectSections(section1: SectionData, section2: SectionData): void {
        Test.ConnectLevels(section1.outer, section2.outer);
        Test.ConnectLevels(section1.levels[0], section2.levels[0]);
        Test.ConnectLevels(section1.levels[1], section2.levels[1]);
    }

    public static TestDataTwo(): StationData {
        let data: StationData = new StationData();
        data.name = "TestTwo";
        data.index = EasyGUID.GetNewGUID();
        data.lines[0] = new MetroLineData();
        data.lines[0].name = "MetroLine-0"
        data.lines[0].index = EasyGUID.GetNewGUID();
        data.lines[0].path = [
            new BABYLON.Vector3(-1.5214, 199.39, -13.066),
            new BABYLON.Vector3(1.4907, 198.2007, -26.0936),
            new BABYLON.Vector3(1.5, 195.6295, -41.5823),
            new BABYLON.Vector3(1.5, 190.2113, -61.8034),
            new BABYLON.Vector3(1.5, 182.7091, -81.3473),
            new BABYLON.Vector3(1.5, 173.2051, -100),
            new BABYLON.Vector3(1.5, 161.8034, -117.5571),
            new BABYLON.Vector3(1.5, 148.629, -133.8261),
            new BABYLON.Vector3(1.5, 133.8261, -148.629),
            new BABYLON.Vector3(1.5, 117.5571, -161.8034),
            new BABYLON.Vector3(1.5, 100, -173.2051),
            new BABYLON.Vector3(1.5, 81.3473, -182.7091),
            new BABYLON.Vector3(1.5, 61.8034, -190.2113),
            new BABYLON.Vector3(1.5, 41.5823, -195.6295),
            new BABYLON.Vector3(1.5, 20.9057, -198.9044),
            new BABYLON.Vector3(1.5, 0, -200),
            new BABYLON.Vector3(1.5, -20.9057, -198.9044),
            new BABYLON.Vector3(1.5, -41.5823, -195.6295),
            new BABYLON.Vector3(1.5, -61.8034, -190.2113),
            new BABYLON.Vector3(1.5, -81.3474, -182.7091),
            new BABYLON.Vector3(1.5, -100, -173.2051),
            new BABYLON.Vector3(1.5, -117.5571, -161.8034),
            new BABYLON.Vector3(1.5, -133.8261, -148.629),
            new BABYLON.Vector3(1.5, -148.629, -133.8261),
            new BABYLON.Vector3(1.5, -161.8034, -117.5571),
            new BABYLON.Vector3(1.5, -173.2051, -100),
            new BABYLON.Vector3(1.5, -182.7091, -81.3473),
            new BABYLON.Vector3(1.5, -190.2113, -61.8034),
            new BABYLON.Vector3(1.5, -195.6295, -41.5823),
            new BABYLON.Vector3(1.5033, -198.2007, -26.0936),
            new BABYLON.Vector3(4.2298, -199.2822, -14.1952),
            new BABYLON.Vector3(14.1952, -199.2822, -4.2298),
            new BABYLON.Vector3(26.0936, -198.2007, -1.5033),
            new BABYLON.Vector3(41.5823, -195.6295, -1.5),
            new BABYLON.Vector3(61.8034, -190.2113, -1.5),
            new BABYLON.Vector3(81.3473, -182.709, -1.5),
            new BABYLON.Vector3(100, -173.205, -1.5),
            new BABYLON.Vector3(117.5571, -161.8033, -1.5),
            new BABYLON.Vector3(133.8261, -148.6289, -1.5),
            new BABYLON.Vector3(148.629, -133.8261, -1.5),
            new BABYLON.Vector3(161.8034, -117.557, -1.5),
            new BABYLON.Vector3(173.2051, -100, -1.5),
            new BABYLON.Vector3(182.7091, -81.3473, -1.5),
            new BABYLON.Vector3(190.2113, -61.8034, -1.5),
            new BABYLON.Vector3(195.6295, -41.5823, -1.5),
            new BABYLON.Vector3(198.9044, -20.9057, -1.5),
            new BABYLON.Vector3(200, 0, -1.5),
            new BABYLON.Vector3(198.9044, 20.9057, -1.5),
            new BABYLON.Vector3(195.6295, 41.5823, -1.5),
            new BABYLON.Vector3(190.2113, 61.8034, -1.5),
            new BABYLON.Vector3(182.7091, 81.3473, -1.5),
            new BABYLON.Vector3(173.2051, 100, -1.5),
            new BABYLON.Vector3(161.8034, 117.557, -1.5),
            new BABYLON.Vector3(148.629, 133.8261, -1.5),
            new BABYLON.Vector3(133.8261, 148.6289, -1.5),
            new BABYLON.Vector3(117.5571, 161.8034, -1.5),
            new BABYLON.Vector3(100, 173.205, -1.5),
            new BABYLON.Vector3(81.3473, 182.7091, -1.5),
            new BABYLON.Vector3(61.8034, 190.2113, -1.5),
            new BABYLON.Vector3(41.5823, 195.6295, -1.5),
            new BABYLON.Vector3(26.0936, 198.2007, -1.5),
            new BABYLON.Vector3(13.066, 199.39, 1.5214),
            new BABYLON.Vector3(1.5213, 199.39, 13.066),
            new BABYLON.Vector3(-1.4907, 198.2007, 26.0936),
            new BABYLON.Vector3(-1.5, 195.6295, 41.5823),
            new BABYLON.Vector3(-1.5, 190.2113, 61.8034),
            new BABYLON.Vector3(-1.5, 182.7091, 81.3473),
            new BABYLON.Vector3(-1.5, 173.2051, 100),
            new BABYLON.Vector3(-1.5, 161.8034, 117.5571),
            new BABYLON.Vector3(-1.5, 148.6289, 133.8261),
            new BABYLON.Vector3(-1.5, 133.8261, 148.629),
            new BABYLON.Vector3(-1.5, 117.557, 161.8034),
            new BABYLON.Vector3(-1.5, 100, 173.2051),
            new BABYLON.Vector3(-1.5, 81.3473, 182.7091),
            new BABYLON.Vector3(-1.5, 61.8034, 190.2113),
            new BABYLON.Vector3(-1.5, 41.5823, 195.6295),
            new BABYLON.Vector3(-1.5, 20.9057, 198.9044),
            new BABYLON.Vector3(-1.5, 0, 200),
            new BABYLON.Vector3(-1.5, -20.9057, 198.9044),
            new BABYLON.Vector3(-1.5, -41.5823, 195.6295),
            new BABYLON.Vector3(-1.5, -61.8034, 190.2113),
            new BABYLON.Vector3(-1.5, -81.3474, 182.7091),
            new BABYLON.Vector3(-1.5, -100, 173.2051),
            new BABYLON.Vector3(-1.5, -117.5571, 161.8034),
            new BABYLON.Vector3(-1.5, -133.8261, 148.629),
            new BABYLON.Vector3(-1.5, -148.629, 133.8261),
            new BABYLON.Vector3(-1.5, -161.8034, 117.5571),
            new BABYLON.Vector3(-1.5, -173.205, 100),
            new BABYLON.Vector3(-1.5, -182.7091, 81.3473),
            new BABYLON.Vector3(-1.5, -190.2113, 61.8034),
            new BABYLON.Vector3(-1.5, -195.6295, 41.5823),
            new BABYLON.Vector3(-1.5033, -198.2007, 26.0936),
            new BABYLON.Vector3(-4.2298, -199.2822, 14.1952),
            new BABYLON.Vector3(-14.1952, -199.2822, 4.2298),
            new BABYLON.Vector3(-26.0936, -198.2007, 1.5033),
            new BABYLON.Vector3(-41.5823, -195.6295, 1.5),
            new BABYLON.Vector3(-61.8034, -190.2113, 1.5),
            new BABYLON.Vector3(-81.3473, -182.7091, 1.5),
            new BABYLON.Vector3(-100, -173.2051, 1.5),
            new BABYLON.Vector3(-117.5571, -161.8034, 1.5),
            new BABYLON.Vector3(-133.8261, -148.629, 1.5),
            new BABYLON.Vector3(-148.629, -133.8261, 1.5),
            new BABYLON.Vector3(-161.8034, -117.5571, 1.5),
            new BABYLON.Vector3(-173.2051, -100, 1.5),
            new BABYLON.Vector3(-182.7091, -81.3474, 1.5),
            new BABYLON.Vector3(-190.2113, -61.8034, 1.5),
            new BABYLON.Vector3(-195.6295, -41.5823, 1.5),
            new BABYLON.Vector3(-198.9044, -20.9057, 1.5),
            new BABYLON.Vector3(-200, 0, 1.5),
            new BABYLON.Vector3(-198.9044, 20.9057, 1.5),
            new BABYLON.Vector3(-195.6295, 41.5823, 1.5),
            new BABYLON.Vector3(-190.2113, 61.8034, 1.5),
            new BABYLON.Vector3(-182.7091, 81.3473, 1.5),
            new BABYLON.Vector3(-173.2051, 100, 1.5),
            new BABYLON.Vector3(-161.8034, 117.557, 1.5),
            new BABYLON.Vector3(-148.629, 133.8261, 1.5),
            new BABYLON.Vector3(-133.8261, 148.629, 1.5),
            new BABYLON.Vector3(-117.5571, 161.8034, 1.5),
            new BABYLON.Vector3(-100, 173.2051, 1.5),
            new BABYLON.Vector3(-81.3473, 182.7091, 1.5),
            new BABYLON.Vector3(-61.8034, 190.2113, 1.5),
            new BABYLON.Vector3(-41.5823, 195.6295, 1.5),
            new BABYLON.Vector3(-26.0936, 198.2007, 1.5),
            new BABYLON.Vector3(-13.066, 199.39, -1.5214)
        ];

        /*
        data.lines[1] = new MetroLineData();
        data.lines[1].name = "MetroLine-1"
        data.lines[1].index = EasyGUID.GetNewGUID();
        data.lines[1].path = [
            new BABYLON.Vector3(-4.2298, 199.2822, -14.1952),
            new BABYLON.Vector3(-14.1952, 199.2822, -4.2298),
            new BABYLON.Vector3(-26.0936, 198.2007, -1.5033),
            new BABYLON.Vector3(-41.5823, 195.6295, -1.5),
            new BABYLON.Vector3(-61.8034, 190.2113, -1.5),
            new BABYLON.Vector3(-81.3473, 182.7091, -1.5),
            new BABYLON.Vector3(-100, 173.2051, -1.5),
            new BABYLON.Vector3(-117.5571, 161.8034, -1.5),
            new BABYLON.Vector3(-133.8261, 148.629, -1.5),
            new BABYLON.Vector3(-148.629, 133.8261, -1.5),
            new BABYLON.Vector3(-161.8034, 117.557, -1.5),
            new BABYLON.Vector3(-173.2051, 100, -1.5),
            new BABYLON.Vector3(-182.7091, 81.3473, -1.5),
            new BABYLON.Vector3(-190.2113, 61.8034, -1.5),
            new BABYLON.Vector3(-195.6295, 41.5823, -1.5),
            new BABYLON.Vector3(-198.9044, 20.9057, -1.5),
            new BABYLON.Vector3(-200, 0, -1.5),
            new BABYLON.Vector3(-198.9044, -20.9057, -1.5),
            new BABYLON.Vector3(-195.6295, -41.5823, -1.5),
            new BABYLON.Vector3(-190.2113, -61.8034, -1.5),
            new BABYLON.Vector3(-182.7091, -81.3474, -1.5),
            new BABYLON.Vector3(-173.2051, -100, -1.5),
            new BABYLON.Vector3(-161.8034, -117.5571, -1.5),
            new BABYLON.Vector3(-148.629, -133.8261, -1.5),
            new BABYLON.Vector3(-133.8261, -148.629, -1.5),
            new BABYLON.Vector3(-117.5571, -161.8034, -1.5),
            new BABYLON.Vector3(-100, -173.2051, -1.5),
            new BABYLON.Vector3(-81.3473, -182.7091, -1.5),
            new BABYLON.Vector3(-61.8034, -190.2113, -1.5),
            new BABYLON.Vector3(-41.5823, -195.6295, -1.5),
            new BABYLON.Vector3(-26.0936, -198.2007, -1.5),
            new BABYLON.Vector3(-13.066, -199.39, 1.5214),
            new BABYLON.Vector3(-1.5214, -199.39, 13.066),
            new BABYLON.Vector3(1.4907, -198.2007, 26.0936),
            new BABYLON.Vector3(1.5, -195.6295, 41.5823),
            new BABYLON.Vector3(1.5, -190.2113, 61.8034),
            new BABYLON.Vector3(1.5, -182.7091, 81.3473),
            new BABYLON.Vector3(1.5, -173.205, 100),
            new BABYLON.Vector3(1.5, -161.8034, 117.5571),
            new BABYLON.Vector3(1.5, -148.629, 133.8261),
            new BABYLON.Vector3(1.5, -133.8261, 148.629),
            new BABYLON.Vector3(1.5, -117.5571, 161.8034),
            new BABYLON.Vector3(1.5, -100, 173.2051),
            new BABYLON.Vector3(1.5, -81.3474, 182.7091),
            new BABYLON.Vector3(1.5, -61.8034, 190.2113),
            new BABYLON.Vector3(1.5, -41.5823, 195.6295),
            new BABYLON.Vector3(1.5, -20.9057, 198.9044),
            new BABYLON.Vector3(1.5, 0, 200),
            new BABYLON.Vector3(1.5, 20.9057, 198.9044),
            new BABYLON.Vector3(1.5, 41.5823, 195.6295),
            new BABYLON.Vector3(1.5, 61.8034, 190.2113),
            new BABYLON.Vector3(1.5, 81.3473, 182.7091),
            new BABYLON.Vector3(1.5, 100, 173.2051),
            new BABYLON.Vector3(1.5, 117.557, 161.8034),
            new BABYLON.Vector3(1.5, 133.8261, 148.629),
            new BABYLON.Vector3(1.5, 148.6289, 133.8261),
            new BABYLON.Vector3(1.5, 161.8034, 117.5571),
            new BABYLON.Vector3(1.5, 173.2051, 100),
            new BABYLON.Vector3(1.5, 182.7091, 81.3473),
            new BABYLON.Vector3(1.5, 190.2113, 61.8034),
            new BABYLON.Vector3(1.5, 195.6295, 41.5823),
            new BABYLON.Vector3(1.5033, 198.2007, 26.0936),
            new BABYLON.Vector3(4.2298, 199.2822, 14.1952),
            new BABYLON.Vector3(14.1952, 199.2822, 4.2298),
            new BABYLON.Vector3(26.0936, 198.2007, 1.5033),
            new BABYLON.Vector3(41.5823, 195.6295, 1.5),
            new BABYLON.Vector3(61.8034, 190.2113, 1.5),
            new BABYLON.Vector3(81.3473, 182.7091, 1.5),
            new BABYLON.Vector3(100, 173.205, 1.5),
            new BABYLON.Vector3(117.5571, 161.8034, 1.5),
            new BABYLON.Vector3(133.8261, 148.6289, 1.5),
            new BABYLON.Vector3(148.629, 133.8261, 1.5),
            new BABYLON.Vector3(161.8034, 117.557, 1.5),
            new BABYLON.Vector3(173.2051, 100, 1.5),
            new BABYLON.Vector3(182.7091, 81.3473, 1.5),
            new BABYLON.Vector3(190.2113, 61.8034, 1.5),
            new BABYLON.Vector3(195.6295, 41.5823, 1.5),
            new BABYLON.Vector3(198.9044, 20.9057, 1.5),
            new BABYLON.Vector3(200, 0, 1.5),
            new BABYLON.Vector3(198.9044, -20.9057, 1.5),
            new BABYLON.Vector3(195.6295, -41.5823, 1.5),
            new BABYLON.Vector3(190.2113, -61.8034, 1.5),
            new BABYLON.Vector3(182.7091, -81.3473, 1.5),
            new BABYLON.Vector3(173.2051, -100, 1.5),
            new BABYLON.Vector3(161.8034, -117.557, 1.5),
            new BABYLON.Vector3(148.629, -133.8261, 1.5),
            new BABYLON.Vector3(133.8261, -148.6289, 1.5),
            new BABYLON.Vector3(117.5571, -161.8033, 1.5),
            new BABYLON.Vector3(100, -173.205, 1.5),
            new BABYLON.Vector3(81.3473, -182.709, 1.5),
            new BABYLON.Vector3(61.8034, -190.2113, 1.5),
            new BABYLON.Vector3(41.5823, -195.6295, 1.5),
            new BABYLON.Vector3(26.0936, -198.2007, 1.5),
            new BABYLON.Vector3(13.066, -199.39, -1.5213),
            new BABYLON.Vector3(1.5213, -199.39, -13.066),
            new BABYLON.Vector3(-1.4907, -198.2007, -26.0936),
            new BABYLON.Vector3(-1.5, -195.6295, -41.5823),
            new BABYLON.Vector3(-1.5, -190.2113, -61.8034),
            new BABYLON.Vector3(-1.5, -182.7091, -81.3473),
            new BABYLON.Vector3(-1.5, -173.2051, -100),
            new BABYLON.Vector3(-1.5, -161.8034, -117.5571),
            new BABYLON.Vector3(-1.5, -148.629, -133.8261),
            new BABYLON.Vector3(-1.5, -133.8261, -148.629),
            new BABYLON.Vector3(-1.5, -117.5571, -161.8034),
            new BABYLON.Vector3(-1.5, -100, -173.2051),
            new BABYLON.Vector3(-1.5, -81.3474, -182.7091),
            new BABYLON.Vector3(-1.5, -61.8034, -190.2113),
            new BABYLON.Vector3(-1.5, -41.5823, -195.6295),
            new BABYLON.Vector3(-1.5, -20.9057, -198.9044),
            new BABYLON.Vector3(-1.5, 0, -200),
            new BABYLON.Vector3(-1.5, 20.9057, -198.9044),
            new BABYLON.Vector3(-1.5, 41.5823, -195.6295),
            new BABYLON.Vector3(-1.5, 61.8034, -190.2113),
            new BABYLON.Vector3(-1.5, 81.3473, -182.7091),
            new BABYLON.Vector3(-1.5, 100, -173.2051),
            new BABYLON.Vector3(-1.5, 117.5571, -161.8034),
            new BABYLON.Vector3(-1.5, 133.8261, -148.629),
            new BABYLON.Vector3(-1.5, 148.629, -133.8261),
            new BABYLON.Vector3(-1.5, 161.8034, -117.5571),
            new BABYLON.Vector3(-1.5, 173.2051, -100),
            new BABYLON.Vector3(-1.5, 182.7091, -81.3473),
            new BABYLON.Vector3(-1.5, 190.2113, -61.8034),
            new BABYLON.Vector3(-1.5, 195.6295, -41.5823),
            new BABYLON.Vector3(-1.5033, 198.2007, -26.0936)
        ]
        */
        
        let rotationMatrixZero: BABYLON.Matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, 12 / 180 * Math.PI);
        let rotationMatrix: BABYLON.Matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, 6 / 180 * Math.PI);

        let hubTop: SectionData = new SectionData();
        hubTop.name = "Section-" + 0;
        hubTop.index = EasyGUID.GetNewGUID();
        hubTop.outer = {
            name: "hub-outer",
            index: EasyGUID.GetNewGUID(),
            level: -1,
            joinedLevels: []
        };
        hubTop.levels = [
            {
                name: "hub-level-0",
                index: EasyGUID.GetNewGUID(),
                level: 0,
                joinedLevels: []
            },
            {
                name: "hub-level-1",
                index: EasyGUID.GetNewGUID(),
                level: 1,
                joinedLevels: []
            }
        ];
        hubTop.position = new BABYLON.Vector3(0, 200, 0);
        hubTop.rotation = new BABYLON.Vector3(0, 0, 0);
        data.sections[0] = hubTop;

        let hubBottom: SectionData = new SectionData();
        hubBottom.name = "Section-" + 0;
        hubBottom.index = EasyGUID.GetNewGUID();
        hubBottom.outer = {
            name: "hub-outer",
            index: EasyGUID.GetNewGUID(),
            level: -1,
            joinedLevels: []
        };
        hubBottom.levels = [
            {
                name: "hub-level-0",
                index: EasyGUID.GetNewGUID(),
                level: 0,
                joinedLevels: []
            },
            {
                name: "hub-level-1",
                index: EasyGUID.GetNewGUID(),
                level: 1,
                joinedLevels: []
            }
        ];
        hubBottom.position = new BABYLON.Vector3(0, -200, 0);
        hubBottom.rotation = new BABYLON.Vector3(Math.PI, Math.PI / 2, 0);
        data.sections[1] = hubBottom;

        for (let j: number = 0; j < 4; j++) {
            if (j === 1) {
                rotationMatrixZero = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, 12 / 180 * Math.PI);
                rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, 6 / 180 * Math.PI);
            }
            if (j === 2) {
                rotationMatrixZero = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, - 12 / 180 * Math.PI);
                rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, - 6 / 180 * Math.PI);
            }
            if (j === 3) {
                rotationMatrixZero = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, - 12 / 180 * Math.PI);
                rotationMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, - 6 / 180 * Math.PI);
            }
            for (let i: number = 0; i < 27; i++) {
                let index = i + 2 + j * 27;
                let section: SectionData = new SectionData();
                section.name = "Section-" + i;
                section.index = EasyGUID.GetNewGUID();
                section.outer = {
                    name: "way-outer",
                    index: EasyGUID.GetNewGUID(),
                    level: -1,
                    joinedLevels: []
                };
                section.levels = [
                    {
                        name: "way-level-0",
                        index: EasyGUID.GetNewGUID(),
                        level: 0,
                        joinedLevels: []
                    },
                    {
                        name: "way-level-1",
                        index: EasyGUID.GetNewGUID(),
                        level: 1,
                        joinedLevels: []
                    }
                ];
                if (i === 0) {
                    section.position = BABYLON.Vector3.TransformCoordinates(data.sections[0].position, rotationMatrixZero);
                } else {
                    section.position = BABYLON.Vector3.TransformCoordinates(data.sections[index - 1].position, rotationMatrix);
                }
                if (j === 0) {
                    section.rotation = new BABYLON.Vector3(12 / 180 * Math.PI + i * (6 / 180 * Math.PI), 0, 0);
                } else if (j === 1) {
                    let flip = 1;
                    if (i % 2 === 0) {
                        flip = -1;
                    }
                    let rY = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, flip * Math.PI / 2);
                    let rZ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, 12 / 180 * Math.PI + i * (6 / 180 * Math.PI));
                    section.rotation = rZ.multiply(rY).toEulerAngles();
                } else if (j === 2) {
                    section.rotation = new BABYLON.Vector3(- 12 / 180 * Math.PI - i * (6 / 180 * Math.PI), 0, 0);
                } else if (j === 3) {
                    let flip = 1;
                    if (i % 2 === 0) {
                        flip = -1;
                    }
                    let rY = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, flip * Math.PI / 2);
                    let rZ = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, - 12 / 180 * Math.PI - i * (6 / 180 * Math.PI));
                    section.rotation = rZ.multiply(rY).toEulerAngles();
                }
                data.sections[index] = section;
            }
    
            Test.ConnectSections(hubTop, data.sections[2 + j * 27])
            Test.ConnectSections(hubBottom, data.sections[28 + j * 27])
    
            for (let i: number = 0; i < 26; i++) {
                Test.ConnectSections(data.sections[2 + i + j * 27], data.sections[2 + i + 1 + j * 27]);
            }
        }

        return data;
    }

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