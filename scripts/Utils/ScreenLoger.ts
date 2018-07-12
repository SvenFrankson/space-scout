class ScreenLogerLine extends BABYLON.GUI.TextBlock {

    public lifetime: number = 0;

    constructor(
        text: string,
        public duration: number = 30,
        screenLogger: ScreenLoger
    ) {
        super("text-line", "\t" + text);
        this.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.height = "0px";
        this.top = "0px";
        this.paddingLeft = screenLogger.lineHeight + "px";
        this.fontSize = Math.floor(this.heightInPixels * 0.8) + "px";
        this.fontFamily = "Courier New";
        this.color = screenLogger.color;
        //this.outlineColor = screenLogger.outlineColor;
        //this.outlineWidth = 3;
        screenLogger.guiTexture.addControl(this);
    }
}

class ScreenLoger {

    public static instance: ScreenLoger;
    public maxLines: number = 10;
    public lines: ScreenLogerLine[] = [];
    public lineHeight: number = 18;
    public color: string = "white";
    public outlineColor: string = "black";
    public slideDuration: number = 0.2;

    constructor(
        public scene: BABYLON.Scene,
        public guiTexture: BABYLON.GUI.AdvancedDynamicTexture
    ) {
        ScreenLoger.instance = this;
        scene.onBeforeRenderObservable.add(this._update);
        this.maxLines = Math.floor(guiTexture.getSize().height / this.lineHeight * 0.6 - 2)
        this.log("Max lines = " + this.maxLines);
    }

    public log(text: string, duration?: number): void {
        this.lines.splice(0, 0, new ScreenLogerLine(text, duration, this));
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
        let y = - this.lineHeight;
        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            if (line.lifetime < this.slideDuration) {
                line.height = Math.round(this.lineHeight * line.lifetime / this.slideDuration) + "px";
                line.fontSize = Math.floor(line.heightInPixels * 0.8) + "px";
            }
            else if (line.lifetime > line.duration - this.slideDuration) {
                line.height = Math.round(this.lineHeight * (line.duration - line.lifetime) / this.slideDuration) + "px";
                line.fontSize = Math.floor(line.heightInPixels * 0.8) + "px";
            }
            else if (line.heightInPixels !== this.lineHeight) {
                line.height = this.lineHeight + "px";
                line.fontSize = Math.floor(line.heightInPixels * 0.8) + "px";
            }
            line.top = y + "px";
            y -= line.heightInPixels;
        }
    }
}