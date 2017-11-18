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
	public static MenuCamera: BABYLON.FreeCamera;
	public static GameCamera: SpaceShipCamera;
	public static Level: ILevel;

	constructor(canvasElement: string) {
		Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Main.Canvas.addEventListener("click", () => {
			Main.OnClick();
		});
		Main.Engine = new BABYLON.Engine(Main.Canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
	}
	
	createSceneSimple(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.resize();

		let sun: BABYLON.DirectionalLight = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.36, 0.06, -0.96), Main.Scene);
		sun.intensity = 0.8;
		let cloud: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(0.07, 0.66, 0.75), Main.Scene);
		cloud.intensity = 0.3;
		cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
		cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);

		//Main.MenuCamera = new BABYLON.FreeCamera("MenuCamera", BABYLON.Vector3.Zero(), Main.Scene);
		//Main.Scene.activeCamera = Main.MenuCamera;

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
	}

	createScene(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.resize();

		let sun: BABYLON.DirectionalLight = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.36, 0.06, -0.96), Main.Scene);
		sun.intensity = 0.8;
		let cloud: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(0.07, 0.66, 0.75), Main.Scene);
		cloud.intensity = 0.3;
		cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
		cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);

		// Main.MenuCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
		// Main.Scene.activeCamera = Main.MenuCamera;
		// Main.MenuCamera.setPosition(new BABYLON.Vector3(- 160, 80, -160));

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

	public static OnClick(): void {
		if (Main.State === State.Ready) {
			Main.Play();
		}
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
		Layout.GameLayout();
		Main.Scene.activeCamera = Main.GameCamera;
		Main.Level.OnGameStart();
		Main.playStart = (new Date()).getTime();
	}

	public static GameOver(): void {
		Main.State = State.GameOver;
		Layout.GameOverLayout();
	}

	private static _tmpPlayer: SpaceShip;
	public static TMPCreatePlayer(): void {
		Main._tmpPlayer = new SpaceShip("Player", Main.Scene);
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
	public static TMPCreateWingMan(): void {
		SpaceShipFactory.AddSpaceShipToScene(
			{
				name: "Voyoslov",
				url: "spaceship",
				x: 0, y: 0, z: 30,
				team: 0,
				role: ISquadRole.WingMan
			},
			Main.Scene,
			(spaceShip: SpaceShip) => {
				Main._tmpWingMan = spaceShip;
			}
		);
	}
	public static TMPResetWingMan(): void {
		Main._tmpWingMan.position.copyFromFloats(0, 0, 30);
		Main._tmpWingMan.rotationQuaternion = BABYLON.Quaternion.Identity();
	}
}

window.addEventListener("DOMContentLoaded", () => {
	let game: Main = new Main("render-canvas");
	game.createSceneSimple();
	game.animate();

	new MeshLoader(Main.Scene);

	let data: StationData = Test.TestDataTwo();
	console.log(data);
	let station: Station = new Station();
	station.load(data);
	let playerCharacter: Character = new Character(station);
	let playerCamera: PlayerCamera = new PlayerCamera(playerCharacter, Main.Scene);
	station.instantiate(
		Main.Scene,
		() => {
			station.sections[0].instantiate(
				0,
				() => {
					playerCharacter.setXYH(4, 4, 2);
					playerCharacter.instantiate();
					playerCharacter.setSection(station.sections[0]);

					let playerControl: PlayerControler = new PlayerControler(playerCamera);
					playerControl.attachControl(Main.Canvas);
				
					let stationLoadManager: StationLoadManager = new StationLoadManager(playerCharacter);
				}
			);
		}
	);

	/*
	Menu.RegisterToUI();
	Intro.RunIntro();
	Main.TMPCreatePlayer();
	Main.TMPCreateWingMan();
	*/
});
