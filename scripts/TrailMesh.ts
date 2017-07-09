class TrailMesh extends BABYLON.Mesh {
  private _generator: BABYLON.Mesh;
  private _diameter: number = 0.5;
  private _length: number = 240;
  private _sectionPolygonPointsCount: number = 4;
  private _sectionVectors: Array<BABYLON.Vector3>;
  private _sectionNormalVectors: Array<BABYLON.Vector3>;

  constructor(name: string, generator: BABYLON.Mesh, scene: BABYLON.Scene) {
    super(name, scene);
    this._generator = generator;
    this._sectionVectors = [];
    this._sectionNormalVectors = [];
    for (let i: number = 0; i < this._sectionPolygonPointsCount; i++) {
      this._sectionVectors[i] = BABYLON.Vector3.Zero();
      this._sectionNormalVectors[i] = BABYLON.Vector3.Zero();
    }
    this._createMesh();
    scene.registerBeforeRender(() => {
      this.update();
    });
  }

  private _createMesh(): void {
    let data: BABYLON.VertexData = new BABYLON.VertexData();
    let positions: Array<number> = [];
    let normals: Array<number> = [];
    let indices: Array<number> = [];

    let alpha: number = 2 * Math.PI / this._sectionPolygonPointsCount;
    for (let i: number = 0; i < this._sectionPolygonPointsCount; i++) {
      positions.push(
        Math.cos(i * alpha) * this._diameter,
        Math.sin(i * alpha) * this._diameter,
        0
      );
      normals.push(
        Math.cos(i * alpha),
        Math.sin(i * alpha),
        0
      );
    }
    for (let i: number = 1; i <= this._length; i++) {
      for (let j: number = 0; j < this._sectionPolygonPointsCount; j++) {
        positions.push(
          Math.cos(j * alpha) * this._diameter,
          Math.sin(j * alpha) * this._diameter,
          0
        );
        normals.push(
          Math.cos(j * alpha),
          Math.sin(j * alpha),
          0
        );
      }
      let l: number = positions.length / 3 - 2 * this._sectionPolygonPointsCount;
      for (let j: number = 0; j < this._sectionPolygonPointsCount - 1; j++) {
        indices.push(
          l + j,
          l + j + this._sectionPolygonPointsCount,
          l + j + this._sectionPolygonPointsCount + 1,
        );
        indices.push(
          l + j,
          l + j + this._sectionPolygonPointsCount + 1,
          l + j + 1
        );
      }
      indices.push(
        l + this._sectionPolygonPointsCount - 1,
        l + this._sectionPolygonPointsCount - 1 + this._sectionPolygonPointsCount,
        l + this._sectionPolygonPointsCount + 1,
      );
      indices.push(
        l + this._sectionPolygonPointsCount - 1,
        l + this._sectionPolygonPointsCount + 1,
        l + 1
      );
    }

    data.positions = positions;
    data.normals = normals;
    data.indices = indices;
    data.applyToMesh(this, true);
  }

  public update(): void {
    let positions: Array<number> | Float32Array = this.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    let normals: Array<number> | Float32Array = this.getVerticesData(BABYLON.VertexBuffer.NormalKind);

    for (let i: number = 3 * this._sectionPolygonPointsCount; i < positions.length; i++) {
      positions[i - 3 * this._sectionPolygonPointsCount] = positions[i];
    }
    for (let i: number = 3 * this._sectionPolygonPointsCount; i < normals.length; i++) {
      normals[i - 3 * this._sectionPolygonPointsCount] = normals[i];
    }
    let l: number = positions.length - 3 * this._sectionPolygonPointsCount;
    let alpha: number = 2 * Math.PI / this._sectionPolygonPointsCount;
    for (let i: number = 0; i < this._sectionPolygonPointsCount; i++) {
      this._sectionVectors[i].copyFromFloats(
         Math.cos(i * alpha) * this._diameter,
         Math.sin(i * alpha) * this._diameter,
         0
      );
      this._sectionNormalVectors[i].copyFromFloats(
         Math.cos(i * alpha),
         Math.sin(i * alpha),
         0
      );
      BABYLON.Vector3.TransformCoordinatesToRef(this._sectionVectors[i], this._generator.getWorldMatrix(), this._sectionVectors[i]);
      BABYLON.Vector3.TransformNormalToRef(this._sectionNormalVectors[i], this._generator.getWorldMatrix(), this._sectionNormalVectors[i]);
    }
    for (let i: number = 0; i < this._sectionPolygonPointsCount; i++) {
      positions[l + 3 * i] = this._sectionVectors[i].x;
      positions[l + 3 * i + 1] = this._sectionVectors[i].y;
      positions[l + 3 * i + 2] = this._sectionVectors[i].z;
    }
    this.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true, false);
    this.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true, false);
  }
}
