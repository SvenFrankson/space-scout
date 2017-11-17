class VertexDataLoader {

    public static instance: VertexDataLoader;

    public scene: BABYLON.Scene;
    private _data: Map<string, BABYLON.VertexData>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this._data = new Map<string, BABYLON.VertexData>();
        VertexDataLoader.instance = this;
    }
}