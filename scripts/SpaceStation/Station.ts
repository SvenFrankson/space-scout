class Station {

    public name: string = "NewStation";
    public index: number;
    public sections: StationSection[] = [];
    public lines: MetroLine[] = [];
    public scene: BABYLON.Scene;

    constructor() {}

    public load(data: StationData, callback?: () => void): void {
        this.name = data.name;
        this.index = data.index;

        for (let i: number = 0; i < data.sections.length; i++) {
            let section: StationSection = new StationSection(this);
            section.load(data.sections[i]);
            this.sections[i] = section;
        }

        for (let i: number = 0; i < data.lines.length; i++) {
            let line: MetroLine = new MetroLine();
            line.load(data.lines[i]);
            this.lines[i] = line;
            let t0 = 0;
            if (i === 0) {
                t0 = 450;
            }
            let metro1 = new Metro(line, t0);
            metro1.instantiate();
        }
    }

    public instantiate(scene: BABYLON.Scene, callback?: () => void): void {
        this.scene = scene;
        let sections: StationSection[] = [];
        for (let i: number = 0; i < this.sections.length; i++) {
           sections.push(this.sections[i]);
        }
        StationSection.InstantiateRecursively(sections, -1, callback);
    }
}