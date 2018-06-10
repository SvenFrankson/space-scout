interface IMaterialData {
    diffuseColor: string;
    specularColor: string;
    emissiveColor: string;
    diffuseTexture: string;
    emissiveTexture: string;
}

class MaterialLoader {

    public static instance: MaterialLoader;

    public scene: BABYLON.Scene;
    private _materials: Map<string, BABYLON.PBRSpecularGlossinessMaterial>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this._materials = new Map<string, BABYLON.PBRSpecularGlossinessMaterial>();
        MaterialLoader.instance = this;
    }

    public async get(name: string): Promise<BABYLON.PBRSpecularGlossinessMaterial> {
        if (this._materials.get(name)) {
            return this._materials.get(name);
        }
        return new Promise<BABYLON.PBRSpecularGlossinessMaterial> (
            (resolve) => {
                $.getJSON(
                    "./datas/materials/" + name + ".json",
                    (rawData: IMaterialData) => {
                        let material = new BABYLON.PBRSpecularGlossinessMaterial(name, this.scene);
                        if (rawData.diffuseColor) {
                            material.diffuseColor = BABYLON.Color3.FromHexString(rawData.diffuseColor);
                        }
                        if (rawData.specularColor) {
                            material.specularColor = BABYLON.Color3.FromHexString(rawData.specularColor);
                        }
                        if (rawData.emissiveColor) {
                            material.emissiveColor = BABYLON.Color3.FromHexString(rawData.emissiveColor);
                        }
                        if (rawData.diffuseTexture) {
                            material.diffuseTexture = new BABYLON.Texture("./datas/textures/" + rawData.diffuseTexture, this.scene);
                            material.diffuseTexture.hasAlpha = true;
                        }
                        if (rawData.emissiveTexture) {
                            material.emissiveTexture = new BABYLON.Texture("./datas/textures/" + rawData.emissiveTexture, this.scene);
                        }
                        this._materials.set(name, material);
                        resolve(this._materials.get(name));
                    }
                )
            }
        )
    }
}