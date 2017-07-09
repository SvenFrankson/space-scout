/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/jquery.d.ts"/>

class Main {

  public static Canvas: HTMLCanvasElement;
  public static Engine: BABYLON.Engine;
  public static Scene: BABYLON.Scene;
  public static Light: BABYLON.HemisphericLight;

  constructor(canvasElement: string) {
    Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    Main.Engine = new BABYLON.Engine(Main.Canvas, true);
  }

  createScene(): void {
    Main.Scene = new BABYLON.Scene(Main.Engine);

    let sun: BABYLON.DirectionalLight = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.93, 0.06, 0.36), Main.Scene);
    sun.intensity = 0.8;
    let cloud: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Green", new BABYLON.Vector3(-0.75, 0.66, 0.07), Main.Scene);
    cloud.intensity = 0.3;
    cloud.diffuse.copyFromFloats(86 / 255, 255 / 255, 229 / 255);
    cloud.groundColor.copyFromFloats(255 / 255, 202 / 255, 45 / 255);

    let skybox: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, Main.Scene);
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

    Loader.AddStaticIntoScene("asteroid-2", Main.Scene, 0, 0, 20, 1, 0, 0, 0, () => {
      for (let i: number = 0; i < 100; i++) {
        Loader.AddStaticIntoScene(
          "asteroid-2",
          Main.Scene,
          Math.random() * 200 - 100,
          Math.random() * 20 - 10,
          Math.random() * 200 - 100,
          Math.random() * 4.5 + 0.5,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
      }
    });

    let w: number = Main.Canvas.width * 0.95;
    let h: number = Main.Canvas.height * 0.95;
    let size: number = Math.min(w, h);
    $("#target1").css("width", size + "px");
    $("#target1").css("height", size + "px");
    $("#target1").css("top", Main.Canvas.height / 2 - size / 2);
    $("#target1").css("left", Main.Canvas.width / 2 - size / 2);
  }

  public animate(): void {
    Main.Engine.runRenderLoop(() => {
      Main.Scene.render();
    });

    window.addEventListener("resize", () => {
      Main.Engine.resize();
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  let game : Main = new Main("render-canvas");
  game.createScene();
  game.animate();

  let player: SpaceShip = new SpaceShip("Player", Main.Scene);
  new SpaceShipCamera("Camera", BABYLON.Vector3.Zero(), Main.Scene, player);
  player.initialize(
    "./datas/spaceship.babylon",
    () => {
      player.attachControl(Main.Canvas);
    }
  );
});
