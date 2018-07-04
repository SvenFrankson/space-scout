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
        Demo._bodyIndex = Math.floor(Math.random() * 3);
        Demo._wingsIndex = Math.floor(Math.random() * 3);
        Demo._baseColor = new BABYLON.Color3(1, 1, 1);
        Demo._detailColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        Demo._CreateUI();
        Demo._UpdateUI();

        await Demo._ResetSpaceship();
    }

    private static _shootLoop: number;
    private static _woundLood: number;

    private static async _ResetSpaceship(): Promise<void> {
        clearInterval(Demo._shootLoop);
        clearInterval(Demo._woundLood);
        if (this._demoSpaceship) {
            this._demoSpaceship.destroy();
        }
        
        let spaceshipData = await SpaceshipLoader.instance.get("arrow-1");
        Demo._demoSpaceship = new SpaceShip(spaceshipData, Main.Scene);
        Demo._demoSpaceship.name = "Demo";
        await Demo._demoSpaceship.initialize(
            {
                type: "root",
                name: "body-" + (Demo._bodyIndex + 1).toFixed(0),
                children: [
                    {
                        type: "wingL",
                        name: "wing-" + (Demo._wingsIndex + 1).toFixed(0),
                        children: [
                            {
                                type: "weapon",
                                name: "canon-1"
                            }
                        ]
                    },
                    {
                        type: "wingR",
                        name: "wing-" + (Demo._wingsIndex + 1).toFixed(0),
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
            Demo._baseColor.toHexString(),
            Demo._detailColor.toHexString()
        );
        let spaceshipAI = new DefaultAI(Demo._demoSpaceship, ISquadRole.Default, 0, Main.Scene, [new BABYLON.Vector3(60, 0, 60), new BABYLON.Vector3(-60, 0, -60)]);
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

    private static _bodyButtons: BABYLON.GUI.Button[] = [];
    private static _wingsButtons: BABYLON.GUI.Button[] = [];
    private static _bodyIndex: number = 0;
    private static _wingsIndex: number = 0;
    private static _baseColor: BABYLON.Color3;
    private static _detailColor: BABYLON.Color3;

    private static _CreateUI(): void {
        let size = 60;

        let bodyTitle = new BABYLON.GUI.TextBlock("bodyTitle", "Body");
        bodyTitle.width = "250px";
        bodyTitle.height = size + "px";
        bodyTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        bodyTitle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        bodyTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        bodyTitle.left = size + "px";
        bodyTitle.top = "30px";
        bodyTitle.color = "white";
        bodyTitle.fontSize = (size * 0.8).toFixed(0) + "px";
        bodyTitle.fontFamily = "Oneday";
        Main.GuiTexture.addControl(bodyTitle);

        for (let i = 0; i < 3; i++) {
            let bodyButton = BABYLON.GUI.Button.CreateSimpleButton("body-" + i.toFixed(0), (i + 1).toFixed(0));
            bodyButton.width = size + "px";
            bodyButton.height = size + "px";
            bodyButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            bodyButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            bodyButton.left = (290 + i * 70) + "px";
            bodyButton.top = "30px";
            bodyButton.color = "white";
            bodyButton.fontSize = (size * 0.8).toFixed(0) + "px";
            bodyButton.fontFamily = "Oneday";
            bodyButton.cornerRadius = 5;
            bodyButton.thickness = 2;
            Main.GuiTexture.addControl(bodyButton);
            Demo._bodyButtons[i] = bodyButton;
            let index = i;
            bodyButton.onPointerUpObservable.add(
                () => {
                    this._bodyIndex = index;
                    this._UpdateUI();
                    this._ResetSpaceship();
                }
            )
        }
        
        let wingTitle = new BABYLON.GUI.TextBlock("wingTitle", "Wings");
        wingTitle.width = "250px";
        wingTitle.height = size + "px";
        wingTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        wingTitle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        wingTitle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        wingTitle.left = size + "px";
        wingTitle.top = "100px";
        wingTitle.color = "white";
        wingTitle.fontSize = (size * 0.8).toFixed(0) + "px";
        wingTitle.fontFamily = "Oneday";
        Main.GuiTexture.addControl(wingTitle);

        for (let i = 0; i < 4; i++) {
            let wingButton = BABYLON.GUI.Button.CreateSimpleButton("body-" + i.toFixed(0), (i + 1).toFixed(0));
            wingButton.width = size + "px";
            wingButton.height = size + "px";
            wingButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            wingButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            wingButton.left = (290 + i * 70) + "px";
            wingButton.top = "100px";
            wingButton.color = "white";
            wingButton.fontSize = (size * 0.8).toFixed(0) + "px";
            wingButton.fontFamily = "Oneday";
            wingButton.cornerRadius = 5;
            wingButton.thickness = 2;
            Main.GuiTexture.addControl(wingButton);
            Demo._wingsButtons[i] = wingButton;
            let index = i;
            wingButton.onPointerUpObservable.add(
                () => {
                    this._wingsIndex = index;
                    this._UpdateUI();
                    this._ResetSpaceship();
                }
            )
        }
        
        let color1Title = new BABYLON.GUI.TextBlock("color1Title", "Color-1");
        color1Title.width = "250px";
        color1Title.height = size + "px";
        color1Title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        color1Title.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        color1Title.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        color1Title.left = size + "px";
        color1Title.top = "205px";
        color1Title.color = "white";
        color1Title.fontSize = (size * 0.8).toFixed(0) + "px";
        color1Title.fontFamily = "Oneday";
        Main.GuiTexture.addControl(color1Title);

        let colorPicker = new BABYLON.GUI.ColorPicker("color1Picker");
        colorPicker.width = (size * 2).toFixed(0) + "px";
        colorPicker.height = (size * 2).toFixed(0) + "px";
        colorPicker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        colorPicker.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        colorPicker.left = "290px";
        colorPicker.top = "170px";
        colorPicker.color = "white";
        colorPicker.fontFamily = "Oneday";
        colorPicker.value = Demo._baseColor;
        Main.GuiTexture.addControl(colorPicker);
        let throttle1: number = NaN;
        colorPicker.onValueChangedObservable.add(
            (color) => {
                Demo._baseColor = color;
                clearTimeout(throttle1);
                throttle1 = setTimeout(
                    () => {
                        this._ResetSpaceship();
                    },
                    200
                );
            }
        )
        
        let color2 = new BABYLON.GUI.TextBlock("color2", "Color-2");
        color2.width = "250px";
        color2.height = size + "px";
        color2.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        color2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        color2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        color2.left = size + "px";
        color2.top = "345px";
        color2.color = "white";
        color2.fontSize = (size * 0.8).toFixed(0) + "px";
        color2.fontFamily = "Oneday";
        Main.GuiTexture.addControl(color2);

        let color2Picker = new BABYLON.GUI.ColorPicker("color2Picker");
        color2Picker.width = (size * 2).toFixed(0) + "px";
        color2Picker.height = (size * 2).toFixed(0) + "px";
        color2Picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        color2Picker.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        color2Picker.left = "290px";
        color2Picker.top = "310px";
        color2Picker.color = "white";
        color2Picker.fontFamily = "Oneday";
        color2Picker.value = Demo._detailColor;
        Main.GuiTexture.addControl(color2Picker);
        let throttle2: number = NaN;
        color2Picker.onValueChangedObservable.add(
            (color) => {
                Demo._detailColor = color;
                clearTimeout(throttle2);
                throttle2 = setTimeout(
                    () => {
                        this._ResetSpaceship();
                    },
                    200
                );
            }
        )
    }

    private static _UpdateUI(): void {
        this._bodyButtons.forEach(
            (b, index) => {
                if (index === Demo._bodyIndex) {
                    b.color = "black";
                    b.background = "white";
                }
                else {
                    b.color = "white";
                    b.background = "black";
                }
            }
        );
        this._wingsButtons.forEach(
            (b, index) => {
                if (index === Demo._wingsIndex) {
                    b.color = "black";
                    b.background = "white";
                }
                else {
                    b.color = "white";
                    b.background = "black";
                }
            }
        );
    }
}