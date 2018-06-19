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
            let detailColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            let body = await SpaceShipFactory.LoadSpaceshipPart("body-1", Main.Scene, "#ffffff", detailColor.toHexString());
            body.parent = test;
            let wingIndex = (Math.random() * 2 + 1).toFixed(0);
            let wingL = await SpaceShipFactory.LoadSpaceshipPart("wing-" + wingIndex, Main.Scene, "#ffffff", detailColor.toHexString());
            wingL.parent = body;
            wingL.position.copyFromFloats(- 0.55, 0, -0.4);
            let wingR = await SpaceShipFactory.LoadSpaceshipPart("wing-" + wingIndex, Main.Scene, "#ffffff", detailColor.toHexString());
            wingR.parent = body;
            wingR.position.copyFromFloats(0.55, 0, -0.4);
            wingR.scaling.x = -1;
            let canonL = await SpaceShipFactory.LoadSpaceshipPart("canon-1", Main.Scene, "#ffffff", detailColor.toHexString());
            canonL.parent = wingL;
            canonL.position.copyFromFloats(- 0.94, 0.06, - 0.1);
            let canonR = await SpaceShipFactory.LoadSpaceshipPart("canon-1", Main.Scene, "#ffffff", detailColor.toHexString());
            canonR.parent = wingR;
            canonR.position.copyFromFloats(- 0.94, 0.06, - 0.1);
            let engine = await SpaceShipFactory.LoadSpaceshipPart("engine-1", Main.Scene, "#ffffff", detailColor.toHexString());
            engine.parent = body;
            engine.position.copyFromFloats(0, 0, -1);
            $("#page").hide();
        }
    }
}