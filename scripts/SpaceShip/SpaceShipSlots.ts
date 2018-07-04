interface SpaceShipElement {
    type: string;
    name: string;
    children?: SpaceShipElement[];
}

class SpaceShipSlot {

    constructor(
        public name: string,
        public pos: BABYLON.Vector3,
        public rot: BABYLON.Vector3,
        public mirror: boolean = false
    ) {

    }
}

class SpaceShipSlots {

    private static _instance: SpaceShipSlots;
    private static get instance(): SpaceShipSlots {
        if (!SpaceShipSlots._instance) {
            SpaceShipSlots._instance = new SpaceShipSlots();
        }
        return SpaceShipSlots._instance;
    }
    private _slots: Map<string, SpaceShipSlot[]>;

    constructor() {
        this._slots = new Map<string, SpaceShipSlot[]>();
        this._slots.set(
            "body-1",
            [
                new SpaceShipSlot("engine", new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, 0)),
                new SpaceShipSlot("wingL", new BABYLON.Vector3(- 0.55, 0, -0.4), new BABYLON.Vector3(0, 0, 0)),
                new SpaceShipSlot("wingR", new BABYLON.Vector3(0.55, 0, -0.4), new BABYLON.Vector3(0, 0, 0), true),
                new SpaceShipSlot("drone", new BABYLON.Vector3(0, 0.7, -0.4), new BABYLON.Vector3(0, 0, 0))
            ]
        );
        this._slots.set(
            "body-2",
            [
                new SpaceShipSlot("engine", new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, 0)),
                new SpaceShipSlot("wingL", new BABYLON.Vector3(- 0.48, 0, -0.27), new BABYLON.Vector3(0, 0, 0)),
                new SpaceShipSlot("wingR", new BABYLON.Vector3(0.48, 0, -0.27), new BABYLON.Vector3(0, 0, 0), true),
                new SpaceShipSlot("drone", new BABYLON.Vector3(0, 0.6, -0.6), new BABYLON.Vector3(0, 0, 0))
            ]
        );
        this._slots.set(
            "body-3",
            [
                new SpaceShipSlot("engine", new BABYLON.Vector3(0, 0, -0.7), new BABYLON.Vector3(0, 0, 0)),
                new SpaceShipSlot("wingL", new BABYLON.Vector3(- 0.55, 0, -0.37), new BABYLON.Vector3(0, 0, 0)),
                new SpaceShipSlot("wingR", new BABYLON.Vector3(0.55, 0, -0.37), new BABYLON.Vector3(0, 0, 0), true),
                new SpaceShipSlot("drone", new BABYLON.Vector3(0, 0.9, -0.34), new BABYLON.Vector3(0, 0, 0))
            ]
        );
        this._slots.set(
            "wing-1",
            [
                new SpaceShipSlot("weapon", new BABYLON.Vector3(- 1.23, 0.06, - 0.15), new BABYLON.Vector3(0, 0, 0))
            ]
        );
        this._slots.set(
            "wing-2",
            [
                new SpaceShipSlot("weapon", new BABYLON.Vector3(- 0.6, 0.12, 0), new BABYLON.Vector3(0, 0, 0.12))
            ]
        );
        this._slots.set(
            "wing-3",
            [
                new SpaceShipSlot("weapon", new BABYLON.Vector3(- 0.9, 0.05, 0.2), new BABYLON.Vector3(0, 0, Math.PI / 2))
            ]
        );
        this._slots.set(
            "wing-4",
            [
                new SpaceShipSlot("weapon", new BABYLON.Vector3(- 1.31, 0.1, 0.24), new BABYLON.Vector3(0, 0, Math.PI / 4))
            ]
        );
    }

    public static getSlot(elementName: string, slotName: string): SpaceShipSlot {
        let slots = SpaceShipSlots.instance._slots.get(elementName);
        if (slots) {
            return slots.find((s) => { return s.name === slotName; });
        }
    }
}