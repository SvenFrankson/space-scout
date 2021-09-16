class Obstacle {
  public static ChunckSize: number = 20;
  public static SphereInstances: BABYLON.BoundingSphere[][][][] = [];
  public static BoxInstances: BABYLON.BoundingBox[][][][] = [];

  public static SphereInstancesFromPosition(position: BABYLON.Vector3) {
    let xChunck: number = Math.floor(position.x / Obstacle.ChunckSize);
    let yChunck: number = Math.floor(position.y / Obstacle.ChunckSize);
    let zChunck: number = Math.floor(position.z / Obstacle.ChunckSize);

    let spheres: BABYLON.BoundingSphere[] = [];
    for (let x: number = xChunck - 1; x <= xChunck + 1; x++) {
      for (let y: number = yChunck - 1; y <= yChunck + 1; y++) {
        for (let z: number = zChunck - 1; z <= zChunck + 1; z++) {
          if (Obstacle.SphereInstances[x]) {
            if (Obstacle.SphereInstances[x][y]) {
              if (Obstacle.SphereInstances[x][y][z]) {
                spheres.push(...Obstacle.SphereInstances[x][y][z]);
              }
            }
          }
        }
      }
    }
    return spheres;
  }

  public static PushSphere(sphere: BABYLON.BoundingSphere): void {
    let xChunck: number = Math.floor(sphere.centerWorld.x / Obstacle.ChunckSize);
    let yChunck: number = Math.floor(sphere.centerWorld.y / Obstacle.ChunckSize);
    let zChunck: number = Math.floor(sphere.centerWorld.z / Obstacle.ChunckSize);

    if (!Obstacle.SphereInstances[xChunck]) {
      Obstacle.SphereInstances[xChunck] = [];
    }
    if (!Obstacle.SphereInstances[xChunck][yChunck]) {
      Obstacle.SphereInstances[xChunck][yChunck] = [];
    }
    if (!Obstacle.SphereInstances[xChunck][yChunck][zChunck]) {
      Obstacle.SphereInstances[xChunck][yChunck][zChunck] = [];
    }
    Obstacle.SphereInstances[xChunck][yChunck][zChunck].push(sphere);
  }
}
