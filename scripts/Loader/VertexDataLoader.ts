class VertexDataLoader {

    public static instance: VertexDataLoader;

    public scene: BABYLON.Scene;
    private _vertexDatas: Map<string, BABYLON.VertexData>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this._vertexDatas = new Map<string, BABYLON.VertexData>();
        VertexDataLoader.instance = this;
    }

    public static clone(data: BABYLON.VertexData): BABYLON.VertexData {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
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
                        data.normals = rawData.meshes[0].normals;
                        data.uvs = rawData.meshes[0].uvs;
                        data.colors = rawData.meshes[0].colors;
                        this._vertexDatas.set(name, data);
                        resolve(this._vertexDatas.get(name));
                    }
                )
            }
        )
    }
}