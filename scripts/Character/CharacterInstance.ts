enum AnimationState {
    Idle,
    Walk,
    Run
}

class CharacterInstance extends BABYLON.Mesh {

    public character: Character;
    public mesh: BABYLON.Mesh;

    constructor(character: Character) {
        super(character.name, character.scene);
        this.character = character;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        BABYLON.SceneLoader.ImportMesh(
            "",
            "./datas/" + character.name + ".babylon",
            "",
            character.scene,
            (meshes) => {
                console.log(meshes.length);
                meshes.forEach(
                    (m) => {
                        if (m instanceof BABYLON.Mesh) {
                            this.mesh = m;
                            this.mesh.parent = this;
                            this.mesh.skeleton.enableBlending(120);
                            this.idle();
                        }
                    }
                )
            }
        );
    }

    private _currentAnimationState: AnimationState = AnimationState.Idle;
    public idle(): void {
        if (this.character && this.mesh) {
            this._currentAnimationState = AnimationState.Idle;
            this.character.scene.beginAnimation(this.mesh.skeleton, 1, 60, true, 1);
        }
    }
    
    public walk(): void {
        if (this.character && this.mesh) {
            this._currentAnimationState = AnimationState.Walk;
            this.character.scene.beginAnimation(this.mesh.skeleton, 61, 116, true, 1);
        }
    }
    
    public run(): void {
        if (this.character && this.mesh) {
            this._currentAnimationState = AnimationState.Run;
            this.character.scene.beginAnimation(this.mesh.skeleton, 117, 141, true, 1);
        }
    }

    public updateAnimation(speed: number): void {
        if (this._currentAnimationState === AnimationState.Idle) {
            if (speed > 1) {
                this.walk();
            }
        } else if (this._currentAnimationState === AnimationState.Walk) {
            if (speed < 1) {
                this.idle();
            } else if (speed > 2) {
                this.run();
            }
        } else if (this._currentAnimationState === AnimationState.Run) {
            if (speed < 2) {
                this.walk();
            }
        }
    } 
}