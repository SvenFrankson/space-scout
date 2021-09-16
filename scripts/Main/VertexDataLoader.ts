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
                let xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        // Typical action to be performed when the document is ready:
                        let rawData = JSON.parse(xhr.responseText);
                        let data = new BABYLON.VertexData();
                        data.positions = rawData.meshes[0].positions;
                        data.indices = rawData.meshes[0].indices;
                        data.normals = rawData.meshes[0].normals;
                        data.uvs = rawData.meshes[0].uvs;
                        data.colors = rawData.meshes[0].colors;
                        this._vertexDatas.set(name, data);
                        resolve(this._vertexDatas.get(name));
                     }
                }
                xhr.open("get", "./datas/vertexData/" + name + ".babylon", true);
                xhr.send();
            }
        )
    }

    public async getColorized(
        name: string, 
		baseColor: string,
        detailColor: string
    ): Promise<BABYLON.VertexData> {
        let baseColor3 = BABYLON.Color3.FromHexString(baseColor);
		let detailColor3 = BABYLON.Color3.FromHexString(detailColor);
        let data = VertexDataLoader.clone(await VertexDataLoader.instance.get(name));
        if (data.colors) {
			for (let i = 0; i < data.colors.length / 4; i++) {
				let r = data.colors[4 * i];
				let g = data.colors[4 * i + 1];
				let b = data.colors[4 * i + 2];
				if (r === 1 && g === 0 && b === 0) {
					data.colors[4 * i] = detailColor3.r;
					data.colors[4 * i + 1] = detailColor3.g;
					data.colors[4 * i + 2] = detailColor3.b;
				}
				else if (r === 1 && g === 1 && b === 1) {
					data.colors[4 * i] = baseColor3.r;
					data.colors[4 * i + 1] = baseColor3.g;
					data.colors[4 * i + 2] = baseColor3.b;
				}
				else if (r === 0.502 && g === 0.502 && b === 0.502) {
					data.colors[4 * i] = baseColor3.r * 0.5;
					data.colors[4 * i + 1] = baseColor3.g * 0.5;
					data.colors[4 * i + 2] = baseColor3.b * 0.5;
				}
			}
        }
        else {
            let colors: number[] = [];
            for (let i = 0; i < data.positions.length / 3; i++) {
                colors[4 * i] = baseColor3.r;
                colors[4 * i + 1] = baseColor3.g;
                colors[4 * i + 2] = baseColor3.b;
                colors[4 * i + 3] = 1;
            }
            data.colors = colors;
        }
        return data;
    }
}