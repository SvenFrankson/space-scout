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
}
