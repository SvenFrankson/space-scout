class Intersection {


  public static SphereSphere(
    sphere0: BABYLON.BoundingSphere,
    sphere1: BABYLON.BoundingSphere
  ): number {
    let distance: number = BABYLON.Vector3.Distance(sphere0.centerWorld, sphere1.centerWorld);
    return sphere0.radiusWorld + sphere1.radiusWorld - distance;
  }

  public static BoxSphere(
    box: BABYLON.BoundingBox,
    sphere: BABYLON.BoundingSphere,
    directionFromBox: BABYLON.Vector3
  ): number {
    let vector: BABYLON.Vector3 = BABYLON.Vector3.Clamp(sphere.centerWorld, box.minimumWorld, box.maximumWorld);
    let num: number = BABYLON.Vector3.Distance(sphere.centerWorld, vector);
    directionFromBox.copyFrom(sphere.centerWorld);
    directionFromBox.subtractInPlace(vector);
    return (sphere.radiusWorld - num);
  }
}
