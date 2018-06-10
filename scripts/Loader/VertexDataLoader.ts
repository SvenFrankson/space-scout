class VertexDataLoader {

    public static instance: VertexDataLoader;

    public scene: BABYLON.Scene;
    private _vertexDatas: Map<string, BABYLON.VertexData>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this._vertexDatas = new Map<string, BABYLON.VertexData>();
        VertexDataLoader.instance = this;
    }

    public async get(name: string): Promise<BABYLON.VertexData> {
        if (this._vertexDatas.get(name)) {
            return this._vertexDatas.get(name);
        }
        return new Promise<BABYLON.VertexData> (
            (resolve) => {
                $.getJSON(
                    "./datas/vertexData/" + name + ".babylon",
                    (rawData) => {
                        let data = new BABYLON.VertexData();
                        data.positions = rawData.meshes[0].positions;
                        data.indices = rawData.meshes[0].indices;
                        data.uvs = rawData.meshes[0].uvs;
                        this._vertexDatas.set(name, data);
                        resolve(this._vertexDatas.get(name));
                    }
                )
            }
        )
    }
}