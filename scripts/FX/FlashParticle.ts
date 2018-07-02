class FlashParticle extends BABYLON.Mesh {

    private _timer: number = 0;

    constructor(
        name: string,
        scene: BABYLON.Scene,
        public size: number,
        public lifespan: number
    ) {
        super(name, scene);
        let template = BABYLON.MeshBuilder.CreatePlane("template", {size: 1}, scene);
        let data = BABYLON.VertexData.ExtractFromMesh(template);
        data.applyToMesh(this);
        template.dispose();
        let material = new BABYLON.StandardMaterial(name + "-material", scene);
        material.diffuseTexture = new BABYLON.Texture("./datas/textures/" + name + ".png", scene);
        material.diffuseTexture.hasAlpha = true;
        material.specularColor.copyFromFloats(0, 0, 0);
        material.emissiveTexture = material.diffuseTexture;
        this.material = material;
        this.scaling.copyFromFloats(0, 0, 0);
        this.layerMask = 1;
    }

    public destroy(): void {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }

    public flash(
        position: BABYLON.Vector3
    ) {
        if (this._timer > 0) {
            return;
        }
        this.position.copyFrom(position);
        this.scaling.copyFromFloats(0, 0, 0);
        this.getScene().onBeforeRenderObservable.add(this._update);
    }

    public _update = () => {
        this._timer += this.getScene().getEngine().getDeltaTime() / 1000;
        let s = this.size * this._timer / (this.lifespan / 2);
        let target: BABYLON.Vector3;
        if (Main.Scene.activeCameras && Main.Scene.activeCameras[0]) {
            target = Main.Scene.activeCameras[0].position;
        }
        else {
            target = Main.Scene.activeCamera.position;
        }
        if (this.parent) {
            target = target.clone();
            let invParentWorld = this.parent.getWorldMatrix().clone().invert();
            BABYLON.Vector3.TransformCoordinatesToRef(target, invParentWorld, target);
        }
        this.lookAt(target);
        if (this._timer < this.lifespan / 2) {
            this.scaling.copyFromFloats(s, s, s);
            return;
        }
        else {
            this.scaling.copyFromFloats(this.size, this.size, this.size);
            if (this._timer > this.lifespan) {
                this._timer = 0;
                this.scaling.copyFromFloats(0, 0, 0);
                this.getScene().onBeforeRenderObservable.removeCallback(this._update);
            }
        }
    }
}