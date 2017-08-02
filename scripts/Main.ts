/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/jquery.d.ts"/>

enum State {
  Menu,
  Ready,
  Game
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

    let sun: BABYLON.DirectionalLight = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.93, 0.06, 0.36), Main.Scene);
    sun.intensity = 0.8;
    let cloud: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(-0.75, 0.66, 0.07), Main.Scene);
    cloud.intensity = 0.3;
    cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
    cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);

    Main.MenuCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
    Main.Scene.activeCamera = Main.MenuCamera;
    Main.MenuCamera.setPosition(new BABYLON.Vector3(160, 80, -160));

    let skybox: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, Main.Scene);
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
    let w: number = Main.Canvas.width;
    let h: number = Main.Canvas.height;
    let size: number = Math.min(w, h);
    $("#cinematic-frame").css("width", size * 0.8);
    $("#cinematic-frame").css("height", size * 0.8);
    $("#cinematic-frame").css("bottom", h / 2 - size * 0.8 / 2);
    $("#cinematic-frame").css("left", w / 2 - size * 0.8 / 2);

    $("#target1").css("width", size * 0.9 + "px");
    $("#target1").css("height", size * 0.9 + "px");
    $("#target1").css("top", Main.Canvas.height / 2 - size * 0.9 / 2);
    $("#target1").css("left", Main.Canvas.width / 2 - size * 0.9 / 2);

    $("#panel-right").css("width", size / 3 + "px");
    $("#panel-right").css("height", size / 3 + "px");
    $("#panel-right").css("top", Main.Canvas.height - size / 3);
    $("#panel-right").css("left", Main.Canvas.width - size / 3);

    $("#speed-display").css("width", size / 3 + "px");
    $("#speed-display").css("height", size / 3 + "px");
    $("#speed-display").css("top", Main.Canvas.height - size / 3);
    $("#speed-display").css("left", Main.Canvas.width - size / 3);

    $("#objective-radar").css("width", size / 2 * 0.8 + "px");
    $("#objective-radar").css("height", size / 2 * 0.8 + "px");
    $("#objective-radar").css("top", size / 2 * 0.1);
    $("#objective-radar").css("left", size / 2 * 0.1);
  }

  public static OnClick(): void {
    if (Main.State === State.Ready) {
      Main.Play();
    }
  }

  public static Play(): void {
    Main.State = State.Game;
    $("#focal-length").show();
    $("#target1").show();
    $("#target2").show();
    $("#target3").show();
    $("#panel-right").show();
    $("#team-panel").show();
    $("#speed-display").show();
    $("#objective-radar").show();
    $(".map-icon").show();
    $("#play-frame").hide();
    Main.Scene.activeCamera = Main.GameCamera;
    Main.Level.OnGameStart();
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
