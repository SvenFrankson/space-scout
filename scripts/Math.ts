class SpaceMath {

  public static ProjectPerpendicularAt(v: BABYLON.Vector3, at: BABYLON.Vector3): BABYLON.Vector3 {
    let p: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    let k: number = (v.x * at.x + v.y * at.y + v.z * at.z);
    k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
    p.copyFrom(v);
    p.subtractInPlace(at.multiplyByFloats(k, k, k));
    return p;
  }

  public static Angle(from: BABYLON.Vector3, to: BABYLON.Vector3): number {
    let pFrom: BABYLON.Vector3 = BABYLON.Vector3.Normalize(from);
    let pTo: BABYLON.Vector3 = BABYLON.Vector3.Normalize(to);
    let angle: number = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
    return angle;
  }

  public static AngleFromToAround(from: BABYLON.Vector3, to: BABYLON.Vector3, around: BABYLON.Vector3): number {
    let pFrom: BABYLON.Vector3 = SpaceMath.ProjectPerpendicularAt(from, around).normalize();
    let pTo: BABYLON.Vector3 = SpaceMath.ProjectPerpendicularAt(to, around).normalize();
    let angle: number = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
    if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
      angle = -angle;
    }
    return angle;
  }

  public static CatmullRomPath(path: BABYLON.Vector3[]): void {
    let interpolatedPoints: BABYLON.Vector3[] = [];
    for (let i: number = 0; i < path.length; i++) {
      let p0 = path[(i - 1 + path.length) % path.length];
      let p1 = path[i];
      let p2 = path[(i + 1) % path.length];
      let p3 = path[(i + 2) % path.length];
      interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
    }
    for (let i: number = 0; i < interpolatedPoints.length; i++) {
      path.splice(2 * i + 1, 0, interpolatedPoints[i]);
    }
  }
}
