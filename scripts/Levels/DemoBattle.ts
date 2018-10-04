class DemoBattle {

    private static _demoCamera: BABYLON.ArcRotateCamera;
    private static _targetSpaceshipCamera: SpaceShip;

    public static async Start(): Promise<void> {
        DemoBattle._demoCamera = new BABYLON.ArcRotateCamera("demoCamera", 1, 1, 100, BABYLON.Vector3.Zero(), Main.Scene);
        DemoBattle._demoCamera.attachControl(Main.Canvas);
        DemoBattle._demoCamera.minZ = 0.5;
        DemoBattle._demoCamera.maxZ = 2000;
        DemoBattle._demoCamera.layerMask = 1 | 2;

        /*
        let depthMap = Main.Scene.enableDepthRenderer(DemoBattle._demoCamera).getDepthMap();
        var postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, DemoBattle._demoCamera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", Main.Engine.getRenderWidth());
            effect.setFloat("height", Main.Engine.getRenderHeight());
        };
        */
        
        Main.Scene.activeCamera = DemoBattle._demoCamera;

        new Spawner(0, Main.Scene, new BABYLON.Vector3(0, 0, 50), BABYLON.Quaternion.Identity());
        new Spawner(0, Main.Scene, new BABYLON.Vector3(20, 0, 60), BABYLON.Quaternion.Identity());
        new Spawner(0, Main.Scene, new BABYLON.Vector3(- 20, 0, 60), BABYLON.Quaternion.Identity());
        new Spawner(0, Main.Scene, new BABYLON.Vector3(0, 10, 70), BABYLON.Quaternion.Identity());
        new Spawner(0, Main.Scene, new BABYLON.Vector3(0, - 10, 70), BABYLON.Quaternion.Identity());
        new Spawner(1, Main.Scene, new BABYLON.Vector3(0, 0, -50), BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        new Spawner(1, Main.Scene, new BABYLON.Vector3(20, 0, -60), BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        new Spawner(1, Main.Scene, new BABYLON.Vector3(- 20, 0, -60), BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        new Spawner(1, Main.Scene, new BABYLON.Vector3(0, 10, -70), BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
        new Spawner(1, Main.Scene, new BABYLON.Vector3(0, - 10, -70), BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI));
    }
}