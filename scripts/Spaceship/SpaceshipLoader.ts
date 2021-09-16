interface ISpaceshipData {
    model: SpaceShipElement;
    stamina: number;
    enginePower: number;
    rollPower: number;
    yawPower: number;
    pitchPower: number;
    frontDrag: number;
    backDrag: number;
    rollDrag: number;
    yawDrag: number;
    pitchDrag: number;
    shootPower: number;
    shootCooldown: number;
    shootSpeed: number;
}

class SpaceshipLoader {

    public static instance: SpaceshipLoader;

    public scene: BABYLON.Scene;
    private _spaceshipDatas: Map<string, ISpaceshipData>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this._spaceshipDatas = new Map<string, ISpaceshipData>();
        SpaceshipLoader.instance = this;
    }

    public async get(name: string): Promise<ISpaceshipData> {
        if (this._spaceshipDatas.get(name)) {
            return this._spaceshipDatas.get(name);
        }
        return new Promise<ISpaceshipData> (
            (resolve) => {
                let xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        // Typical action to be performed when the document is ready:
                        let data = JSON.parse(xhr.responseText) as ISpaceshipData;
                        this._spaceshipDatas.set(name, data);
                        resolve(this._spaceshipDatas.get(name));
                     }
                }
                xhr.open("get", "./datas/spaceships/" + name + ".json", true);
                xhr.send();
            }
        )
    }
}