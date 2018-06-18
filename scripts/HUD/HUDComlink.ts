class HUDComlinkLine {

    public lifetime: number = 0;
    public get height(): number {
        return this.imageBlock.heightInPixels;
    }
    public set height(v: number) {
        if (this.height == v) {
            return;
        }
        let trueV = BABYLON.Scalar.Clamp(v, this.height - 5, this.height + 5);

        this.avatarIconBlock.width = trueV + "px";
        this.avatarIconBlock.height = trueV + "px";
        this.avatarIconBlock.left = (this.hudComLink.left - trueV - this.hudComLink.lineHeight / 8) + "px";

        this.imageBlock.width = trueV + "px";
        this.imageBlock.height = trueV + "px";
        this.imageBlock.left = (this.hudComLink.left - trueV - this.hudComLink.lineHeight / 8) + "px";

        this.textBlock.height = Math.round(trueV / 2) + "px";
        this.textBlock.fontSize = Math.round(trueV / 2 * 0.8) + "px";
        this.textBlock.left = this.hudComLink.left + "px";
    }

    public get top(): number {
        return this.imageBlock.topInPixels;
    }
    public set top(v: number) {
        this.avatarIconBlock.top = v + "px";
        this.imageBlock.top = v + "px";
        this.textBlock.top = Math.round(v - this.height / 4) + "px";
    }

    private textBlock: BABYLON.GUI.TextBlock;
    private avatarIconBlock: BABYLON.GUI.Image;
    private imageBlock: BABYLON.GUI.Image;

    constructor(
        text: string,
        public duration: number = 30,
        public hudComLink: HUDComlink
    ) {
        this.avatarIconBlock = new BABYLON.GUI.Image("avatarIconBlock", "./datas/textures/hud/avatars/avatar-red.png");
        this.avatarIconBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.avatarIconBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.avatarIconBlock.top = "0px";
        this.avatarIconBlock.left = this.hudComLink.left + "px";
        this.avatarIconBlock.width = "0px";
        this.avatarIconBlock.height = "0px";

        this.imageBlock = new BABYLON.GUI.Image("imageBlock", "./datas/textures/hud/avatars/disrupter-" + Math.floor(Math.random() * 2 + 1) + ".png");
        this.imageBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.imageBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.imageBlock.top = "0px";
        this.imageBlock.left = this.hudComLink.left + "px";
        this.imageBlock.width = "0px";
        this.imageBlock.height = "0px";

        this.textBlock = new BABYLON.GUI.TextBlock("textBlock", text);
        this.textBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.textBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.textBlock.top = "0px";
        this.textBlock.height = "0px";
        this.textBlock.fontSize = "1px";
        this.textBlock.fontFamily = "Helvetica";
        this.textBlock.color = hudComLink.color;
        //this.outlineColor = screenLogger.outlineColor;
        //this.outlineWidth = 3;
        hudComLink.guiTexture.addControl(this.avatarIconBlock);
        hudComLink.guiTexture.addControl(this.imageBlock);
        hudComLink.guiTexture.addControl(this.textBlock);
    }

    public dispose(): void {
        this.avatarIconBlock.dispose();
        this.imageBlock.dispose();
        this.textBlock.dispose();
    }
}

class HUDComlink {

    public static instance: HUDComlink;
    public maxLines: number = 5;
    public lines: HUDComlinkLine[] = [];
    public lineHeight: number = 100;
    public color: string = "white";
    public outlineColor: string = "black";
    public slideDuration: number = 0.2;
    public left: number = 450;

    constructor(
        public scene: BABYLON.Scene,
        public guiTexture: BABYLON.GUI.AdvancedDynamicTexture
    ) {
        HUDComlink.instance = this;
        scene.onBeforeRenderObservable.add(this._update);
    }

    public static display(text: string, duration?: number): void {
        if (HUDComlink.instance) {
            HUDComlink.instance.display(text, duration);
        }
    }

    public display(text: string, duration?: number): void {
        this.lines.splice(0, 0, new HUDComlinkLine(text, duration, this));
    }

    public _update = () => {
        let dt = this.scene.getEngine().getDeltaTime() / 1000;
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].lifetime += dt;
        }
        let i = 0;
        while (i < this.lines.length) {
            let line = this.lines[i];
            if (line.lifetime > line.duration) {
                this.lines.splice(i, 1);
                line.dispose();
            }
            else {
                i++
            }
        }
        while (this.lines.length > this.maxLines) {
            let line = this.lines.pop();
            if (line) {
                line.dispose();
            }
        }
        let y = - this.lineHeight / 8;
        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            let currentLineHeight = this.lineHeight;
            if (i > 0) {
                currentLineHeight /= 2;
            }
            line.height = currentLineHeight;
            line.top = y;
            y -= Math.floor(line.height + this.lineHeight / 10);
        }
    }
}