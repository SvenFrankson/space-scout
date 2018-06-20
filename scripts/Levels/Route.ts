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
            let testCam = new BABYLON.ArcRotateCamera("testCamera", 1, 1, 5, BABYLON.Vector3.Zero(), Main.Scene);
            testCam.attachControl(Main.Canvas);
            testCam.minZ = 0.5;
            testCam.maxZ = 2000;
            testCam.layerMask = 1;

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
            let wingIndex = Math.floor(Math.random() * 2 + 1).toFixed(0);
            let detailColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            SpaceShip.initializeRecursively(
                {
                    type: "root",
                    name: "body-1",
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
            $("#page").hide();
        }
    }
}