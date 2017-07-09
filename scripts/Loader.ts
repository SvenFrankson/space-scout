class Loader {

  private static _loadedStatics: Array<Array<BABYLON.AbstractMesh>> = [];

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
            mesh.material = Loader._loadMaterial(name, scene);
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

  private static _loadMaterial(name: string, scene: BABYLON.Scene): BABYLON.StandardMaterial {
    let material: BABYLON.StandardMaterial = new BABYLON.StandardMaterial(name, scene);
    material.specularColor.copyFromFloats(0.5, 0.5, 0.5);
    material.bumpTexture = new BABYLON.Texture("./datas/" + name + "-bump.png", scene);
    material.ambientTexture = new BABYLON.Texture("./datas/" + name + "-ao.png", scene);
    return material;
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

  public static AddStaticIntoScene(
    name: string,
    scene: BABYLON.Scene,
    x: number,
    y: number,
    z: number,
    s: number = 1,
    rX: number = 0,
    rY: number = 0,
    rZ: number = 0,
    callback?: () => void
  ): void {
    if (Loader._loadedStatics[name]) {
      Loader._cloneStaticIntoScene(
        Loader._loadedStatics[name],
        x, y, z,
        s,
        rX, rY, rZ,
        callback
      );
    } else {
      Loader._loadStatic(
        name,
        scene,
        (loadedMeshes: Array<BABYLON.AbstractMesh>) => {
          Loader._cloneStaticIntoScene(
            loadedMeshes,
            x, y, z,
            s,
            rX, rY, rZ,
            callback
          );
        }
      );
    }
  }
}
