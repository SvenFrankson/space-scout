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

    BABYLON.SceneLoader.ImportMesh(
      "",
      "./datas/roids1.babylon",
      "",
      Main.Scene,
      (
        meshes: Array<BABYLON.AbstractMesh>,
        particleSystems: Array<BABYLON.ParticleSystem>,
        skeletons: Array<BABYLON.Skeleton>
      ) => {
        let base: BABYLON.Mesh = meshes[0] as BABYLON.Mesh;
        base.isVisible = false;
        let roids1Material: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("Roids1", Main.Scene);
        roids1Material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        roids1Material.bumpTexture = new BABYLON.Texture("./datas/roids1_normals.png", Main.Scene);
        roids1Material.ambientTexture = new BABYLON.Texture("./datas/roids1_ao.png", Main.Scene);
        base.material = roids1Material;
        for (let i: number = 0; i < 50; i++) {
          let clone: BABYLON.InstancedMesh = base.createInstance("Clone" + i);
          clone.position.x = 100 * Math.random() - 50;
          clone.position.y = 20 * Math.random() - 10;
          clone.position.z = 100 * Math.random() - 50;
          clone.rotation.x = 100 * Math.random() - 50;
          clone.rotation.y = 20 * Math.random() - 10;
          clone.rotation.z = 100 * Math.random() - 50;
          let scaling: number = 1.5 * Math.random() + 0.5;
          clone.scaling.copyFromFloats(scaling, scaling, scaling);
          Obstacle.SphereInstances.push(clone.getBoundingInfo().boundingSphere);
        }
      }
    );

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
