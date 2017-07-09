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

    Main.Light = new BABYLON.HemisphericLight("AmbientLight",new BABYLON.Vector3(0, 1, 0), Main.Scene);
    Main.Light.diffuse = new BABYLON.Color3(1, 1, 1);
    Main.Light.specular = new BABYLON.Color3(0.5, 0.5, 0.5);

    let skybox: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("SkyBox", {size : 1000}, Main.Scene);
    skybox.infiniteDistance = true;
    let skyboxMaterial : BABYLON.StandardMaterial = new BABYLON.StandardMaterial("SkyBoxMaterial", Main.Scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skyboxMaterial.diffuseColor = BABYLON.Color3.Black();
    skyboxMaterial.specularColor = BABYLON.Color3.Black();
    skyboxMaterial.emissiveTexture = new BABYLON.Texture("./datas/stars.png", Main.Scene);

    Loader.AddStaticIntoScene("asteroid-2", Main.Scene, 0, 0, 20);
    Loader.AddStaticIntoScene("asteroid-2", Main.Scene, 0, 10, 20, 2);
    Loader.AddStaticIntoScene("asteroid-2", Main.Scene, 0, 30, 20, 4);
    Loader.AddStaticIntoScene("asteroid-2", Main.Scene, 0, 40, 20, 8);

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
