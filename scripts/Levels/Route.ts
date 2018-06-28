class Route {

    public static async route(): Promise<void> {
        let hash = window.location.hash.slice(1) || "home";
        if (hash === "home") {
            Home.Start();
        }
        if (hash === "level-0") {
            Level0.Start();
        }
        if (hash === "test") {
            let testCam = new BABYLON.ArcRotateCamera("testCamera", 1, 1, 10, BABYLON.Vector3.Zero(), Main.Scene);
            testCam.attachControl(Main.Canvas);
            testCam.minZ = 0.5;
            testCam.maxZ = 2000;
            testCam.layerMask = 1 | 2;
            testCam.wheelPrecision = 20;

            let depthMap = Main.Scene.enableDepthRenderer(testCam).getDepthMap();
            var postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, testCam);
            postProcess.onApply = (effect) => {
                effect.setTexture("depthSampler", depthMap);
                effect.setFloat("width", Main.Engine.getRenderWidth());
                effect.setFloat("height", Main.Engine.getRenderHeight());
            };
            
            Main.Scene.activeCamera = testCam;
            let test = new BABYLON.TransformNode("test", Main.Scene);
            Main.Scene.onBeforeRenderObservable.add(
                () => {
                    test.rotation.y += 0.01;
                }
            )
            let wingIndex = Math.floor(Math.random() * 3 + 1).toFixed(0);
            let bodyIndex = Math.floor(Math.random() * 2 + 1).toFixed(0);
            let detailColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

            let spaceshipData = await SpaceshipLoader.instance.get("arrow-1");
            let spaceShip: SpaceShip = new SpaceShip(spaceshipData, Main.Scene);
            spaceShip.name = "Demo";
            await spaceShip.initialize(
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
                        }
                    ]
                },
                "#ffffff",
                detailColor.toHexString()
            );
            let spaceshipAI = new DefaultAI(spaceShip, ISquadRole.Default, 0, Main.Scene, [new BABYLON.Vector3(40, 0, 40), new BABYLON.Vector3(-40, 0, -40)]);
            spaceShip.attachControler(spaceshipAI);

            let drone = new RepairDrone(Main.Scene);
            drone.initialize();
            drone.parent = spaceShip;
            drone.position.x -= 1.5;
            drone.position.y += 1.5;
            drone.position.z -= 1.5;
            setInterval(
                () => {
                    drone.unFold();
                },
                8000
            );
            setTimeout(
                () => {
                    setInterval(
                        () => {
                            drone.fold();
                        },
                        8000
                    );
                },
                4000
            )

            RuntimeUtils.NextFrame(
                Main.Scene,
                () => {
                    spaceShip.trailMeshes.forEach(
                        (t) => {
                            t.foldToGenerator();
                        }
                    )
                }
            );

            testCam.setTarget(spaceShip);

            setInterval(
                () => {
                    spaceShip.shoot(spaceShip.localZ);
                },
                200
            );
        
            $("#page").hide();
			Main.Play();
        }
    }
}