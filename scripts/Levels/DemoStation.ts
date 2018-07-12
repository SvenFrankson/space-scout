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

        let block = new Block(new BABYLON.Vector3(20, 0, 20), 12, 3, 8);
        let blocks = [block];
        for (let i = 0; i < 4; i++) {
            let newBlocks: Block[] = [];
            for (let j = 0; j < blocks.length; j++) {
                newBlocks.push(...blocks[j].tryPop());
            }
            blocks = newBlocks;
        }
        Block.instances.forEach(
            async (b) => {
                await b.instantiate(Main.Scene);
                ScreenLoger.instance.log("Nubs count " + Nub.instances.length);
                Nub.instances.forEach(
                    async (n) => {
                        await n.instantiate(Main.Scene);
                    }
                )
            }
        )
        Way.instances.forEach(
            async (w) => {
                await w.instantiate(Main.Scene);
            }
        )
    }
}