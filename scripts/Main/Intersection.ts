interface IIntersectionInfo {
  intersect: boolean;
  depth: number;
  point?: BABYLON.Vector3;
  direction?: BABYLON.Vector3;
}

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

  private static _v: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  public static MeshSphere(mesh: BABYLON.Mesh, sphere: BABYLON.BoundingSphere): IIntersectionInfo {
    // quick check mesh boundingSphere.
    if (!BABYLON.BoundingSphere.Intersects(mesh.getBoundingInfo().boundingSphere, sphere)) {
      return {
        intersect: false,
        depth: 0
      };
    }
    let intersection: IIntersectionInfo = {
      intersect: false,
      depth: 0
    };
    let depth: number = 0;
    let vertex: BABYLON.Vector3 = Intersection._v;
    let world: BABYLON.Matrix = mesh.getWorldMatrix();
    let vertices: Array<number> | Float32Array = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    let normals: Array<number> | Float32Array = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
    for (let i: number = 0; i < vertices.length / 3; i++) {
      vertex.copyFromFloats(vertices[3 * i], vertices[3 * i + 1], vertices[3 * i + 2]);
      BABYLON.Vector3.TransformCoordinatesToRef(vertex, world, vertex);
      depth = sphere.radiusWorld - BABYLON.Vector3.Distance(sphere.centerWorld, vertex);
      if (depth > intersection.depth) {
        intersection.intersect = true;
        intersection.depth = depth;
        if (!intersection.point) {
          intersection.point = BABYLON.Vector3.Zero();
        }
        if (!intersection.direction) {
          intersection.direction = BABYLON.Vector3.Zero();
        }
        intersection.point.copyFrom(vertex);
        intersection.direction.copyFromFloats(normals[3 * i], normals[3 * i + 1], normals[3 * i + 2]);
        BABYLON.Vector3.TransformNormalToRef(intersection.direction, world, intersection.direction);
      }
    }
    return intersection;
  }
}
