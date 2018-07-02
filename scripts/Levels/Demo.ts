class Demo {

    private static _demoCamera: BABYLON.ArcRotateCamera;
    private static _demoSpaceship: SpaceShip;

    public static async Start(): Promise<void> {
        Demo._demoCamera = new BABYLON.ArcRotateCamera("demoCamera", 1, 1, 10, BABYLON.Vector3.Zero(), Main.Scene);
        Demo._demoCamera.attachControl(Main.Canvas);
        Demo._demoCamera.minZ = 0.5;
        Demo._demoCamera.maxZ = 2000;
        Demo._demoCamera.layerMask = 1 | 2;
        Demo._demoCamera.wheelPrecision = 20;

        let depthMap = Main.Scene.enableDepthRenderer(Demo._demoCamera).getDepthMap();
        var postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, Demo._demoCamera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", Main.Engine.getRenderWidth());
            effect.setFloat("height", Main.Engine.getRenderHeight());
        };
        
        Main.Scene.activeCamera = Demo._demoCamera;
        await Demo._ResetSpaceship();
        setInterval(
            () => {
                Demo._ResetSpaceship();
            },
            5000
        )
    }

    private static _shootLoop: number;
    private static _woundLood: number;

    private static async _ResetSpaceship(): Promise<void> {
        clearInterval(Demo._shootLoop);
        clearInterval(Demo._woundLood);
        if (this._demoSpaceship) {
            this._demoSpaceship.destroy();
        }

        let wingIndex = Math.floor(Math.random() * 3 + 1).toFixed(0);
        let bodyIndex = Math.floor(Math.random() * 3 + 1).toFixed(0);
        let detailColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        let spaceshipData = await SpaceshipLoader.instance.get("arrow-1");
        Demo._demoSpaceship = new SpaceShip(spaceshipData, Main.Scene);
        Demo._demoSpaceship.name = "Demo";
        await Demo._demoSpaceship.initialize(
            {
                type: "root",
                name: "body-" + bodyIndex,
                children: [
                    {
                        type: "wingL",
                        name: "wing-" + wingIndex,
                        children: [
                            {
                                type: "weapon",
                                name: "canon-1"
                            }
                        ]
                    },
                    {
                        type: "wingR",
                        name: "wing-" + wingIndex,
                        children: [
                            {
                                type: "weapon",
                                name: "canon-1"
                            }
                        ]
                    },
                    {
                        type: "engine",
                        name: "engine-1"
                    },
                    {
                        type: "drone",
                        name: "repair-drone"
                    }
                ]
            },
            "#ffffff",
            detailColor.toHexString()
        );
        let spaceshipAI = new DefaultAI(Demo._demoSpaceship, ISquadRole.Default, 0, Main.Scene, [new BABYLON.Vector3(40, 0, 40), new BABYLON.Vector3(-40, 0, -40)]);
        Demo._demoSpaceship.attachControler(spaceshipAI);

        RuntimeUtils.NextFrame(
            Main.Scene,
            () => {
                Demo._demoSpaceship.trailMeshes.forEach(
                    (t) => {
                        t.foldToGenerator();
                    }
                )
            }
        );

        Demo._demoCamera.setTarget(Demo._demoSpaceship);
        Demo._demoCamera.alpha = 1;
        Demo._demoCamera.beta = 1;
        Demo._demoCamera.radius = 10;

        Demo._shootLoop = setInterval(
            () => {
                Demo._demoSpaceship.shoot(Demo._demoSpaceship.localZ);
            },
            200
        );

        Demo._demoSpaceship.hitPoint -= 5 * Math.random();
        Demo._woundLood = setInterval(
            () => {
                Demo._demoSpaceship.hitPoint -= 5 * Math.random();
            },
            10000
        );
    }
}