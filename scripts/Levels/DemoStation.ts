class DemoStation {

    private static _demoCamera: BABYLON.ArcRotateCamera;

    public static async Start(): Promise<void> {
        DemoStation._demoCamera = new BABYLON.ArcRotateCamera("demoCamera", 1, 1, 10, BABYLON.Vector3.Zero(), Main.Scene);
        DemoStation._demoCamera.attachControl(Main.Canvas);
        DemoStation._demoCamera.minZ = 0.5;
        DemoStation._demoCamera.maxZ = 2000;
        DemoStation._demoCamera.layerMask = 1 | 2;
        DemoStation._demoCamera.wheelPrecision = 20;

        let depthMap = Main.Scene.enableDepthRenderer(DemoStation._demoCamera).getDepthMap();
        var postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, DemoStation._demoCamera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", Main.Engine.getRenderWidth());
            effect.setFloat("height", Main.Engine.getRenderHeight());
        };
        
        Main.Scene.activeCamera = DemoStation._demoCamera;

        let block = new Block();
        block.size.copyFromFloats(15, 8, 10);
        let way = new Way(new BABYLON.Vector3(7, 1, 10), "north", 3, 5, 10);
        let way2 = new Way(new BABYLON.Vector3(15, 1, 6), "east", 3, 4, 8);
        let block2 = new Block();
        block2.position.copyFromFloats(3, 0, 20);
        block2.size.copyFromFloats(10, 12, 6);
        let block3 = new Block();
        block3.position.copyFromFloats(23, 0, 2);
        block3.size.copyFromFloats(10, 12, 10);
        block.instantiate(Main.Scene);
        block2.instantiate(Main.Scene);
        block3.instantiate(Main.Scene);
        way.instantiate(Main.Scene);
        way2.instantiate(Main.Scene);
    }
}