class RandomGenerator {
  public static Level1(): void {
    console.log(".");
    let data: {}[] = [];
    let arcR: number = 1000;
    let d: number = 100;
    let r: number = 300;
    let count: number = 1000;
    let l: number = arcR + d + r;
    let cX: number = - arcR / Math.sqrt(2);
    let cZ: number = cX;
    let minSqrRadius: number = (d + arcR) * (d + arcR);
    let maxSqrRadius: number = l * l;
    let position: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    while (data.length < 4) {
      position.copyFromFloats(
        Math.random() * l,
        Math.random() * r - r / 2,
        Math.random() * l
      );
      let sqrRadius: number = (position.x) * (position.x) + (position.z) * (position.z);
      if ((sqrRadius > minSqrRadius) && (sqrRadius < maxSqrRadius)) {
        data.push(
          {
            name: "beacon",
            x: parseFloat((position.x + cX).toFixed(2)),
            y: parseFloat((position.y).toFixed(2)),
            z: parseFloat((position.z + cZ).toFixed(2)),
            s: 1,
            rX: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
            rY: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
            rZ: parseFloat((Math.random() * Math.PI * 2).toFixed(2))
          }
        );
      }
    }
    while (data.length < count) {
      position.copyFromFloats(
        Math.random() * l,
        Math.random() * r - r / 2,
        Math.random() * l
      );
      let sqrRadius: number = (position.x) * (position.x) + (position.z) * (position.z);
      if ((sqrRadius > minSqrRadius) && (sqrRadius < maxSqrRadius)) {
        data.push(
          {
            name: "asteroid-2",
            x: parseFloat((position.x + cX).toFixed(2)),
            y: parseFloat((position.y).toFixed(2)),
            z: parseFloat((position.z + cZ).toFixed(2)),
            s: parseFloat((Math.random() * 7 + 0.5).toFixed(2)),
            rX: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
            rY: parseFloat((Math.random() * Math.PI * 2).toFixed(2)),
            rZ: parseFloat((Math.random() * Math.PI * 2).toFixed(2))
          }
        );
      }
    }
    console.log(JSON.stringify(data));
  }
}
