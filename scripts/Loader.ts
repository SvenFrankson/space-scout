interface IScene {
  cinematic: ICinematic;
  statics: IStatic[];
}

interface IStatic {
  name: string;
  x: number;
  y: number;
  z: number;
  s?: number;
  rX?: number;
  rY?: number;
  rZ?: number;
}

interface ICinematic {
  xCam: number;
  yCam: number;
  zCam: number;
  frames: ICinematicFrame[];
}

interface ICinematicFrame {
  htmlId: string;
  delay: number;
}

class Loader {

  private static _overrideDelay: number = 10;
  private static _loadedStatics: Array<Array<BABYLON.AbstractMesh>> = [];

  public static LoadScene(name: string, scene: BABYLON.Scene, callback?: () => void): void {
    Main.Level = new Level0();
    $.ajax(
      {
        url: "./datas/scenes/" + name + ".json",
        success: (data: IScene) => {
          Main.Scene.activeCamera = Main.MenuCamera;
          Main.MenuCamera.setPosition(new BABYLON.Vector3(data.cinematic.xCam, data.cinematic.yCam, data.cinematic.zCam));
          Loader.RunCinematic(data.cinematic);
          Loader._loadSceneData(
            data,
            scene,
            () => {
              Main.Level.LoadLevel();
              if (callback) {
                callback();
              }
            }
          );
        }
      }
    );
  }

  public static RunCinematic(data: ICinematic, frameIndex: number = 0): void {
    if (data.frames[frameIndex - 1]) {
      let lastId: string = data.frames[frameIndex - 1].htmlId;
      $("#" + lastId).hide();
    }
    if (data.frames[frameIndex]) {
      let currentId: string = data.frames[frameIndex].htmlId;
      $("#" + currentId).show();
      setTimeout(
        () => {
          Loader.RunCinematic(data, frameIndex + 1);
        },
        Loader._overrideDelay?Loader._overrideDelay:data.frames[frameIndex].delay
      );
    } else {
      $("#play-frame").show();
      Main.State = State.Ready;
    }
  }

  public static _loadSceneData(data: IScene, scene: BABYLON.Scene, callback?: () => void): void {
    Loader.AddStaticsIntoScene(data.statics, scene, callback, 20);
  }

  private static _loadStatic(
    name: string,
    scene: BABYLON.Scene,
    callback?: (loadedMeshes: Array<BABYLON.AbstractMesh>) => void
  ): void {
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./datas/" + name + ".babylon",
      "",
      scene,
      (
        meshes: Array<BABYLON.AbstractMesh>,
        particleSystems: Array<BABYLON.ParticleSystem>,
        skeletons: Array<BABYLON.Skeleton>
      ) => {
        Loader._loadedStatics[name] = [];
        for (let i: number = 0; i < meshes.length; i++) {
          if (meshes[i] instanceof BABYLON.Mesh) {
            let mesh: BABYLON.Mesh = meshes[i] as BABYLON.Mesh;
            Loader._loadedStatics[name].push(mesh);
            Loader._loadMaterial(mesh.material, name, scene);
            for (let j: number = 0; j < mesh.instances.length; j++) {
              Loader._loadedStatics[name].push(mesh.instances[j]);
              mesh.instances[j].isVisible = false;
              mesh.instances[j].isPickable = false;
            }
            mesh.isVisible = false;
            mesh.isPickable = false;
          }
        }
        if (callback) {
          callback(Loader._loadedStatics[name]);
        }
      }
    );
  }

  private static _loadMaterial(material: BABYLON.Material, name: string, scene: BABYLON.Scene): void {
    if (material instanceof BABYLON.StandardMaterial) {
      material.bumpTexture = new BABYLON.Texture("./datas/" + name + "-bump.png", scene);
      material.ambientTexture = new BABYLON.Texture("./datas/" + name + "-ao.png", scene);
    }
  }

  private static _cloneStaticIntoScene(
    sources: Array<BABYLON.AbstractMesh>,
    x: number,
    y: number,
    z: number,
    s: number = 1,
    rX: number = 0,
    rY: number = 0,
    rZ: number = 0,
    callback?: () => void
  ): void {
    let instance: BABYLON.AbstractMesh;
    for (let i: number = 0; i < sources.length; i++) {
      if (sources[i] instanceof BABYLON.Mesh) {
        let source: BABYLON.Mesh = sources[i] as BABYLON.Mesh;
        instance = source.createInstance(source.name);
        instance.position.copyFromFloats(x, y, z);
        instance.rotation.copyFromFloats(rX, rY, rZ);
        instance.scaling.copyFromFloats(s, s, s);
        instance.computeWorldMatrix();
        instance.freezeWorldMatrix();
        if (source.name[0] === "S") {
          let radius: string = source.name.substring(2);
          instance.getBoundingInfo().boundingSphere.radius = parseFloat(radius);
          instance.getBoundingInfo().boundingSphere.radiusWorld = parseFloat(radius) * s;
        }
        Obstacle.SphereInstances.push(instance.getBoundingInfo().boundingSphere);
      } else if (sources[i] instanceof BABYLON.InstancedMesh) {
        let source: BABYLON.InstancedMesh = sources[i] as BABYLON.InstancedMesh;
        instance = source.sourceMesh.createInstance(source.name);
        instance.position.copyFromFloats(x, y, z);
        instance.rotation.copyFromFloats(rX, rY, rZ);
        instance.computeWorldMatrix();
        instance.freezeWorldMatrix();
        Obstacle.SphereInstances.push(instance.getBoundingInfo().boundingSphere);
      }
    }
    if (callback) {
      callback();
    }
  }

  public static AddStaticsIntoScene(
    datas: IStatic[],
    scene: BABYLON.Scene,
    callback?: () => void,
    delay: number = 0,
    index: number = 0
  ): void {
    if (datas[index]) {
      Loader.AddStaticIntoScene(
        datas[index],
        scene,
        () => {
          setTimeout(
            () => {
              Loader.AddStaticsIntoScene(datas, scene, callback, delay, index + 1);
            },
            delay
          );
        }
      );
    } else {
      if (callback) {
        callback();
      }
    }
  }

  public static AddStaticIntoScene(
    data: IStatic,
    scene: BABYLON.Scene,
    callback?: () => void
  ): void {
    if (Loader._loadedStatics[data.name]) {
      Loader._cloneStaticIntoScene(
        Loader._loadedStatics[data.name],
        data.x, data.y, data.z,
        data.s,
        data.rX, data.rY, data.rZ,
        callback
      );
    } else {
      Loader._loadStatic(
        data.name,
        scene,
        (loadedMeshes: Array<BABYLON.AbstractMesh>) => {
          Loader._cloneStaticIntoScene(
            loadedMeshes,
            data.x, data.y, data.z,
            data.s,
            data.rX, data.rY, data.rZ,
            callback
          );
        }
      );
    }
  }
}
