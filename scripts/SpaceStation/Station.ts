class Station {

    public name: string = "NewStation";
    public index: number;
    public sections: StationSection[] = [];
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