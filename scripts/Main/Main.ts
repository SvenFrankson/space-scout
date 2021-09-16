/// <reference path="../../lib/babylon.d.ts"/>

class Main {

	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
	public scene: BABYLON.Scene;

    public async initialize(canvasId: string): Promise<void> {

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
		this.scene = new BABYLON.Scene(this.engine);

		let light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(1, 3, 2), this.scene);
		
		let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, this.scene);
		skybox.rotation.y = Math.PI / 2;
		skybox.infiniteDistance = true;
		let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
		skyboxMaterial.backFaceCulling = false;
		let skyboxTexture = new BABYLON.CubeTexture(
			"./assets/skyboxes/sky",
			this.scene,
			["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
		skyboxMaterial.reflectionTexture = skyboxTexture;
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skybox.material = skyboxMaterial;

		let hud = new Hud();
		hud.initialize();
		hud.resize(0.8);

		let playerControler = new PlayerControler();
		playerControler.initialize(hud, this.scene, this.canvas);

		new SpaceShipFactory(this.scene);
		new SpaceshipLoader(this.scene);
		new VertexDataLoader(this.scene);

		let spaceshipData = await SpaceshipLoader.instance.get("arrow-1");
        let _demoSpaceship = new Spaceship(spaceshipData, this.scene);
		_demoSpaceship.setControler(playerControler);
        _demoSpaceship.name = "Demo";
        await _demoSpaceship.initialize(
            {
                type: "root",
                name: "body-1",
                children: [
                    {
                        type: "wingL",
                        name: "wing-1",
                        children: [
                            {
                                type: "weapon",
                                name: "canon-1"
                            }
                        ]
                    },
                    {
                        type: "wingR",
                        name: "wing-1",
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
            "#FFFFFF",
			"#FF0000"
        );

		let camera = new SpaceshipCamera(this.scene);
		camera.spaceship = _demoSpaceship;

		for (let i = 0; i < 100; i++) {
			let r = Math.random() * 5 + 1;
			let asteroid = BABYLON.MeshBuilder.CreateSphere("asteroid-" + i, { diameter: 2 * r }, this.scene);
			asteroid.position.x = Math.random() * 1000 - 500 ;
			asteroid.position.y = Math.random() * 200 - 100 ;
			asteroid.position.z = Math.random() * 1000 - 500 ;
		}
	}
	
    public animate(): void {
		let fpsInfoElement = document.getElementById("fps-info");
		let meshesInfoTotalElement = document.getElementById("meshes-info-total");
		let meshesInfoNonStaticUniqueElement = document.getElementById("meshes-info-nonstatic-unique");
		let meshesInfoStaticUniqueElement = document.getElementById("meshes-info-static-unique");
		let meshesInfoNonStaticInstanceElement = document.getElementById("meshes-info-nonstatic-instance");
		let meshesInfoStaticInstanceElement = document.getElementById("meshes-info-static-instance");
        this.engine.runRenderLoop(() => {
			this.scene.render();
			fpsInfoElement.innerText = this.engine.getFps().toFixed(0) + " fps";
			let uniques = this.scene.meshes.filter(m => { return !(m instanceof BABYLON.InstancedMesh); });
			let uniquesNonStatic = uniques.filter(m => { return !m.isWorldMatrixFrozen; });
			let uniquesStatic = uniques.filter(m => { return m.isWorldMatrixFrozen; });
			let instances = this.scene.meshes.filter(m => { return m instanceof BABYLON.InstancedMesh; });
			let instancesNonStatic = instances.filter(m => { return !m.isWorldMatrixFrozen; });
			let instancesStatic = instances.filter(m => { return m.isWorldMatrixFrozen; });
			meshesInfoTotalElement.innerText = this.scene.meshes.length.toFixed(0).padStart(4, "0");
			meshesInfoNonStaticUniqueElement.innerText = uniquesNonStatic.length.toFixed(0).padStart(4, "0");
			meshesInfoStaticUniqueElement.innerText = uniquesStatic.length.toFixed(0).padStart(4, "0");
			meshesInfoNonStaticInstanceElement.innerText = instancesNonStatic.length.toFixed(0).padStart(4, "0");
			meshesInfoStaticInstanceElement.innerText = instancesStatic.length.toFixed(0).padStart(4, "0");
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}

window.addEventListener("load", async () => {
	let main: Main = new Main();
	await main.initialize("render-canvas");
	main.animate();
})