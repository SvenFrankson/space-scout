/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/jquery.d.ts"/>

enum State {
	Menu,
	Ready,
	Game,
	GameOver
};

class Main {

	private static _state: State = State.Menu;
	public static get State(): State {
		return Main._state;
	}
	public static set State(v: State) {
		Main._state = v;
	}
	public static Canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
	public static Light: BABYLON.HemisphericLight;
	public static MenuCamera: BABYLON.ArcRotateCamera;
	public static GameCamera: SpaceShipCamera;
	public static GUICamera: BABYLON.FreeCamera;
	public static Level: ILevel
	public static GuiTexture: BABYLON.GUI.AdvancedDynamicTexture;
	public static Loger: ScreenLoger;
	public static EnvironmentTexture: BABYLON.CubeTexture;

	constructor(canvasElement: string) {
		Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Main.Engine = new BABYLON.Engine(Main.Canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
	}

	createScene(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.resize();

		Main.GuiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("hud");
		Main.GuiTexture.layer.layerMask = 2;
		Main.GuiTexture.idealWidth = 1920;

		Main.Loger = new ScreenLoger(Main.Scene, Main.GuiTexture);

		let sun: BABYLON.DirectionalLight = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.4, - 0.4, -0.4), Main.Scene);
		sun.intensity = 1;
		
		let cloud: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(0.07, 0.66, 0.75), Main.Scene);
		cloud.intensity = 0.6;
		cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
		cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);

		Main.MenuCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
		Main.Scene.activeCamera = Main.MenuCamera;
		Main.MenuCamera.setPosition(new BABYLON.Vector3(- 3, 3, -3));
		Main.MenuCamera.attachControl(Main.Canvas);

		Main.GUICamera = new BABYLON.FreeCamera("GUICamera", BABYLON.Vector3.Zero(), Main.Scene);
		Main.GUICamera.minZ = 0.5;
		Main.GUICamera.maxZ = 2000;
		Main.GUICamera.layerMask = 2;

		BABYLON.Effect.ShadersStore["EdgeFragmentShader"] = `
			#ifdef GL_ES
			precision highp float;
			#endif
			varying vec2 vUV;
			uniform sampler2D textureSampler;
			uniform sampler2D depthSampler;
			uniform float 		width;
			uniform float 		height;
			void make_kernel(inout vec4 n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h));
				n[1] = texture2D(tex, coord + vec2(0.0, -h));
				n[2] = texture2D(tex, coord + vec2(  w, -h));
				n[3] = texture2D(tex, coord + vec2( -w, 0.0));
				n[4] = texture2D(tex, coord);
				n[5] = texture2D(tex, coord + vec2(  w, 0.0));
				n[6] = texture2D(tex, coord + vec2( -w, h));
				n[7] = texture2D(tex, coord + vec2(0.0, h));
				n[8] = texture2D(tex, coord + vec2(  w, h));
			}
			void main(void) 
			{
				vec4 d = texture2D(depthSampler, vUV);
				float depth = d.r * (2000.0 - 0.5) + 0.5;
				vec4 n[9];
				make_kernel( n, textureSampler, vUV );
				vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
				vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
				vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
				float threshold = 0.4 + max((depth - 10.) / 30., 0.);
				if (max(sobel.r, max(sobel.g, sobel.b)) < threshold) {
					gl_FragColor = n[4];
				} else {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				}
			}
		`;

		/*
		let testLight = new BABYLON.PointLight("testLight", BABYLON.Vector3.One().scale(0.5), Main.Scene);
		testLight.intensity = 5;
		testLight.range = 100;
		Main.Scene.registerBeforeRender(
			() => {
				testLight.position.copyFrom(Main.MenuCamera.position);
			}
		)
		*/

		let skybox: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, Main.Scene);
		skybox.layerMask = 1;
		skybox.rotation.y = Math.PI / 2;
		skybox.infiniteDistance = true;
		let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
		skyboxMaterial.backFaceCulling = false;
		Main.EnvironmentTexture = new BABYLON.CubeTexture(
			"./datas/skyboxes/green-nebulae",
			Main.Scene,
			["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
		skyboxMaterial.reflectionTexture = Main.EnvironmentTexture;
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skybox.material = skyboxMaterial;

		new VertexDataLoader(Main.Scene);
		new MaterialLoader(Main.Scene);
		new SpaceshipLoader(Main.Scene);
	}

	public animate(): void {
		Main.Engine.runRenderLoop(() => {
			Main.Scene.render();
		});

		window.addEventListener("resize", () => {
			this.resize();
		});
	}

	public resize(): void {
		Main.Engine.resize();
		Layout.Resize();
	}

	public static Menu(): void {
		Main.State = State.Menu;
		Loader.UnloadScene();
		if (Main.Level) {
			Main.Level.UnLoadLevel();
		}
		Main.TMPResetPlayer();
		Main.TMPResetWingMan();
		Main.Scene.activeCamera = Main.MenuCamera;
		Main.GameCamera.ResetPosition();
		Layout.MenuLayout();
	}

	public static playStart: number = 0;
	public static Play(): void {
		Main.State = State.Game;
		$("#page").hide(500, "linear");
		//Main.Scene.activeCameras = [Main.GameCamera, Main.GUICamera];
		if (Main.Level) {
			Main.Level.OnGameStart();
		}
		Main.playStart = (new Date()).getTime();
	}

	public static GameOver(): void {
		Main.State = State.GameOver;
		Layout.GameOverLayout();
	}

	private static PlayerMesh;
	private static _tmpPlayer: SpaceShip;
	public static async TMPCreatePlayer(): Promise<void> {
		let spaceshipData = await SpaceshipLoader.instance.get("scout-2");
		Main._tmpPlayer = new SpaceShip(spaceshipData, Main.Scene);
		Main.GameCamera = new SpaceShipCamera(BABYLON.Vector3.Zero(), Main.Scene, Main._tmpPlayer);
		Main.GameCamera.attachSpaceShipControl(Main.Canvas);
		Main.GameCamera.setEnabled(false);
		Main.GameCamera.minZ = 0.5;
		Main.GameCamera.maxZ = 2000;
		Main.GameCamera.layerMask = 1;
		
		let depthMap = Main.Scene.enableDepthRenderer(Main.GameCamera).getDepthMap();
		var postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, Main.GameCamera);
		postProcess.onApply = (effect) => {
			effect.setTexture("depthSampler", depthMap);
			effect.setFloat("width", Main.Engine.getRenderWidth());
			effect.setFloat("height", Main.Engine.getRenderHeight());
		};

		Main.GUICamera.parent = Main.GameCamera;

		Main.Scene.activeCameras = [Main.GameCamera, Main.GUICamera];

		Main.PlayerMesh = await Main._tmpPlayer.initialize(spaceshipData.model, "#ffffff", "#00ff00");
		let playerControl: SpaceShipInputs = new SpaceShipInputs(Main._tmpPlayer, Main.Scene);
		Main._tmpPlayer.attachControler(playerControl);
		playerControl.attachControl(Main.Canvas);
	}
	public static TMPResetPlayer(): void {
		Main._tmpPlayer.position.copyFromFloats(0, 0, 0);
		Main._tmpPlayer.rotationQuaternion = BABYLON.Quaternion.Identity();
	}

	private static _tmpWingMan: SpaceShip;
	public static async TMPCreateWingMan(): Promise<SpaceShip> {
		return SpaceShipFactory.AddSpaceShipToScene(
			{
				name: "Wingman",
				url: "scout-1",
				x: -100 + 200 * Math.random(), y: -50 + 100 * Math.random(), z: 200,
				team: 0,
				role: ISquadRole.Default
			},
			Main.Scene
		);
	}
	public static TMPResetWingMan(): void {
		Main._tmpWingMan.position.copyFromFloats(0, 0, 30);
		Main._tmpWingMan.rotationQuaternion = BABYLON.Quaternion.Identity();
	}

	private static _tmpRogue: SpaceShip;
	public static async TMPCreateRogue(): Promise<SpaceShip> {
		return SpaceShipFactory.AddSpaceShipToScene(
			{
				name: "Rogue",
				url: "arrow-1",
				x: -100 + 200 * Math.random(), y: -50 + 100 * Math.random(), z: 200,
				team: 1,
				role: ISquadRole.Default
			},
			Main.Scene
		);
	}
	public static TMPResetRogue(): void {
		Main._tmpRogue.position.copyFromFloats(0, 0, 100);
		Main._tmpRogue.rotationQuaternion = BABYLON.Quaternion.Identity();
	}
}

window.addEventListener("DOMContentLoaded", async () => {
	let game: Main = new Main("render-canvas");
	game.createScene();
	game.animate();

	window.addEventListener("hashchange", Route.route);
	return Route.route();

	/*
	Home.RegisterToUI();
	Intro.RunIntro();
	await Main.TMPCreatePlayer();
	await Main.TMPCreateWingMan();
	await Main.TMPCreateWingMan();
	await Main.TMPCreateWingMan();
	await Main.TMPCreateWingMan();
	await Main.TMPCreateRogue();
	await Main.TMPCreateRogue();
	await Main.TMPCreateRogue();
	await Main.TMPCreateRogue();
	Loader.LoadScene("level-0", Main.Scene);
	*/
});