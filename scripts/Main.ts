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
	public static Level: ILevel
	public static GuiTexture: BABYLON.GUI.AdvancedDynamicTexture;

	constructor(canvasElement: string) {
		Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Main.Engine = new BABYLON.Engine(Main.Canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
	}

	createScene(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.resize();

		Main.GuiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("hud");

		let sun: BABYLON.DirectionalLight = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.36, 0.06, -0.96), Main.Scene);
		sun.intensity = 0.8;
		let cloud: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(0.07, 0.66, 0.75), Main.Scene);
		cloud.intensity = 0.3;
		cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
		cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);

		Main.MenuCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
		Main.Scene.activeCamera = Main.MenuCamera;
		Main.MenuCamera.setPosition(new BABYLON.Vector3(- 160, 80, -160));

		let skybox: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, Main.Scene);
		skybox.rotation.y = Math.PI / 2;
		skybox.infiniteDistance = true;
		let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
			"./datas/skyboxes/green-nebulae",
			Main.Scene,
			["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
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
			BeaconEmiter.UpdateAllMapIcons();
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
		Main.Scene.activeCamera = Main.GameCamera;
		Main.Level.OnGameStart();
		Main.playStart = (new Date()).getTime();
	}

	public static GameOver(): void {
		Main.State = State.GameOver;
		Layout.GameOverLayout();
	}

	private static _tmpPlayer: SpaceShip;
	public static async TMPCreatePlayer(): Promise<void> {
		let spaceshipData = await SpaceshipLoader.instance.get("scout-2");
		Main._tmpPlayer = new SpaceShip(spaceshipData, Main.Scene);
		Main.GameCamera = new SpaceShipCamera(BABYLON.Vector3.Zero(), Main.Scene, Main._tmpPlayer);
		Main.GameCamera.attachSpaceShipControl(Main.Canvas);
		Main.GameCamera.setEnabled(false);
		Main._tmpPlayer.initialize(
			"spaceship",
			() => {
				let playerControl: SpaceShipInputs = new SpaceShipInputs(Main._tmpPlayer, Main.Scene);
				Main._tmpPlayer.attachControler(playerControl);
				playerControl.attachControl(Main.Canvas);
			}
		);
	}
	public static TMPResetPlayer(): void {
		Main._tmpPlayer.position.copyFromFloats(0, 0, 0);
		Main._tmpPlayer.rotationQuaternion = BABYLON.Quaternion.Identity();
	}

	private static _tmpWingMan: SpaceShip;
	public static async TMPCreateWingMan(): Promise<SpaceShip> {
		return SpaceShipFactory.AddSpaceShipToScene(
			{
				name: "Voyoslov",
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