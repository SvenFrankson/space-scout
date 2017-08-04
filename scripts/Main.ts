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
  public static Level: ILevel;

  constructor(canvasElement: string) {
    Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    Main.Canvas.addEventListener("click", () => {
      Main.OnClick();
    });
    Main.Engine = new BABYLON.Engine(Main.Canvas, true);
    BABYLON.Engine.ShadersRepository = "./shaders/";
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

    Main.MenuCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
    Main.Scene.activeCamera = Main.MenuCamera;
    Main.MenuCamera.setPosition(new BABYLON.Vector3(- 160, 80, -160));

    let skybox: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("skyBox", {size:2000.0}, Main.Scene);
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
}

window.addEventListener("DOMContentLoaded", () => {
  let game : Main = new Main("render-canvas");
  game.createScene();
  game.animate();

  Intro.RunIntro();

  let player: SpaceShip = new SpaceShip("Player", Main.Scene);
  Main.GameCamera = new SpaceShipCamera(BABYLON.Vector3.Zero(), Main.Scene, player);
  Main.GameCamera.attachSpaceShipControl(Main.Canvas);
  Main.GameCamera.setEnabled(false);
  player.initialize(
    "spaceship",
    () => {
      let playerControl: SpaceShipInputs = new SpaceShipInputs(player, Main.Scene);
      player.attachControler(playerControl);
      playerControl.attachControl(Main.Canvas);
    }
  );

  SpaceShipFactory.AddSpaceShipToScene(
    {
      name: "Voyoslov",
      url: "spaceship",
      x: 0, y: 0, z: 30,
      team: 0,
      role: ISquadRole.WingMan
    },
    Main.Scene
  );
});
