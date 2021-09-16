class Hud {

    public initialized: boolean = false;

    public clientWidth: number = 0;
    public clientHeight: number = 0;
    public centerX: number = 0;
    public centerY: number = 0;
    public size: number = 0;
    public reticleMaxRange: number = 0.65;
    public svgPerPixel: number = 1;

    public root: SVGSVGElement;
    public reticleRoot: SVGSVGElement;
    public rightGaugeForwardValue: SVGPathElement;
    public rightGaugeBackwardValue: SVGPathElement;
    public rightGaugeCursor: SVGPathElement;
    public leftGaugeValue: SVGPathElement;

    public strokeWidthLite: string = "2";
    public strokeWidth: string = "4";
    public strokeWidthHeavy: string = "6";

    constructor() {

    }

    public resize(sizeInPercent: number): void {
        if (!this.initialized) {
            return;
        }

        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.size = Math.floor(Math.min(this.clientWidth, this.clientHeight) * sizeInPercent);
        this.centerX = this.clientWidth * 0.5;
        this.centerY = this.clientHeight * 0.5;
        this.svgPerPixel = 2000 / this.size;

        [this.root, this.reticleRoot].forEach(e => {
            e.setAttribute("width", this.size.toFixed(0));
            e.setAttribute("height", this.size.toFixed(0));
    
            e.style.position = "fixed";
            e.style.left = ((this.clientWidth - this.size) * 0.5).toFixed(1) + "px";
            e.style.top = ((this.clientHeight - this.size) * 0.5).toFixed(1) + "px";
            e.style.width = this.size.toFixed(1) + "px";
            e.style.height = this.size.toFixed(1) + "px";
        });
    }

    public initialize(): void {
        this.root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.root.setAttribute("id", "hud-root");
        this.root.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.root.style.overflow = "visible";
        this.root.style.pointerEvents = "none";
        document.body.appendChild(this.root);

        /*
        let debugSquare = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        debugSquare.setAttribute("x", "-1000");
        debugSquare.setAttribute("y", "-1000");
        debugSquare.setAttribute("width", "2000");
        debugSquare.setAttribute("height", "2000");
        debugSquare.setAttribute("fill", "rgba(0, 0, 0, 50%)");
        debugSquare.setAttribute("stroke", "magenta");
        debugSquare.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(debugSquare);
        */

        let outterRing = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let outterRingD = SvgUtils.drawArc(30, 60, 820, true);
        outterRingD += SvgUtils.drawArc(30, 100, 850, true);
        outterRingD += SvgUtils.lineToPolar(100, 820);
        outterRingD += SvgUtils.drawArc(100, 135, 820, false);
        outterRingD += SvgUtils.drawArc(45, 110, 880, true);
        outterRingD += SvgUtils.lineToPolar(110, 850);
        outterRingD += SvgUtils.drawArc(110, 150, 850, false);
        outterRingD += SvgUtils.drawArc(80, 120, 910, true);
        outterRingD += SvgUtils.lineToPolar(120, 880);
        outterRingD += SvgUtils.drawArc(120, 150, 880, false);
        outterRingD += SvgUtils.drawArc(210, 240, 820, true);
        outterRingD += SvgUtils.drawArc(210, 280, 850, true);
        outterRingD += SvgUtils.lineToPolar(280, 820);
        outterRingD += SvgUtils.drawArc(280, 315, 820, false);
        outterRingD += SvgUtils.drawArc(225, 290, 880, true);
        outterRingD += SvgUtils.lineToPolar(290, 850);
        outterRingD += SvgUtils.drawArc(290, 330, 850, false);
        outterRingD += SvgUtils.drawArc(260, 300, 910, true);
        outterRingD += SvgUtils.lineToPolar(300, 880);
        outterRingD += SvgUtils.drawArc(300, 330, 880, false);

        outterRing.setAttribute("d", outterRingD);
        outterRing.setAttribute("fill", "none");
        outterRing.setAttribute("stroke", "white");
        outterRing.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(outterRing);

        this.rightGaugeForwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeForwardValueD = SvgUtils.drawArc(340, 30, 770, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(30, 930);
        rightGaugeForwardValueD += SvgUtils.drawArc(30, 340, 930, false, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
        this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
        this.rightGaugeForwardValue.setAttribute("fill", "rgba(255, 127, 0, 50%)");
        this.rightGaugeForwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeForwardValue);

        this.rightGaugeBackwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeBackwardValueD = SvgUtils.drawArc(330, 340, 770, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 930);
        rightGaugeBackwardValueD += SvgUtils.drawArc(340, 330, 930, false, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(330, 770);
        this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
        this.rightGaugeBackwardValue.setAttribute("fill", "rgba(0, 127, 255, 50%)");
        this.rightGaugeBackwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeBackwardValue);

        let rightGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeD = SvgUtils.drawArc(330, 30, 770, true);
        rightGaugeD += SvgUtils.lineToPolar(30, 930);
        rightGaugeD += SvgUtils.drawArc(30, 330, 930, false, true);
        rightGaugeD += SvgUtils.lineToPolar(330, 770);
        rightGaugeD += SvgUtils.lineFromToPolar(340, 770, 340, 930);
        rightGauge.setAttribute("d", rightGaugeD);
        rightGauge.setAttribute("fill", "none");
        rightGauge.setAttribute("stroke", "white");
        rightGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(rightGauge);

        let rightGaugeGraduations = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeGraduationsD = "";
        for (let i = 1; i < 12; i++) {
            let a = 330 + i * 5;
            rightGaugeGraduationsD += SvgUtils.lineFromToPolar(a, 880, a, 930);
        }
        rightGaugeGraduations.setAttribute("d", rightGaugeGraduationsD);
        rightGaugeGraduations.setAttribute("fill", "none");
        rightGaugeGraduations.setAttribute("stroke", "white");
        rightGaugeGraduations.setAttribute("stroke-width", this.strokeWidthLite);
        this.root.appendChild(rightGaugeGraduations);

        this.rightGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeCursorD = SvgUtils.drawArc(1, 359, 970, true, true);
        rightGaugeCursorD += SvgUtils.lineToPolar(0, 940);
        rightGaugeCursorD += SvgUtils.lineToPolar(1, 970);
        this.rightGaugeCursor.setAttribute("d", rightGaugeCursorD);
        this.rightGaugeCursor.setAttribute("fill", "none");
        this.rightGaugeCursor.setAttribute("stroke", "white");
        this.rightGaugeCursor.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(this.rightGaugeCursor);

        let leftGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let leftGaugeD = SvgUtils.drawArc(150, 210, 770, true);
        leftGaugeD += SvgUtils.lineToPolar(210, 930);
        leftGaugeD += SvgUtils.drawArc(210, 150, 930, false, true);
        leftGaugeD += SvgUtils.lineToPolar(150, 770);
        leftGauge.setAttribute("d", leftGaugeD);
        leftGauge.setAttribute("fill", "none");
        leftGauge.setAttribute("stroke", "white");
        leftGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(leftGauge);

        this.reticleRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.reticleRoot.setAttribute("id", "hud-target-root");
        this.reticleRoot.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.reticleRoot.style.overflow = "visible";
        this.reticleRoot.style.pointerEvents = "none";
        document.body.appendChild(this.reticleRoot);

        /*
        let debugSquare2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        debugSquare2.setAttribute("x", "-1000");
        debugSquare2.setAttribute("y", "-1000");
        debugSquare2.setAttribute("width", "2000");
        debugSquare2.setAttribute("height", "2000");
        debugSquare2.setAttribute("fill", "rgba(255, 0, 255, 50%)");
        this.reticleRoot.appendChild(debugSquare2);
        */

        let reticle = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let reticleD = SvgUtils.drawArc(300, 60, 100, true) + SvgUtils.drawArc(120, 240, 100, true);
        reticle.setAttribute("d", reticleD);
        reticle.setAttribute("fill", "none");
        reticle.setAttribute("stroke", "white");
        reticle.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticle);

        let reticleArmLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmLeft.setAttribute("x1", "0");
        reticleArmLeft.setAttribute("y1", "0");
        reticleArmLeft.setAttribute("x2", "-300");
        reticleArmLeft.setAttribute("y2", "0");
        reticleArmLeft.setAttribute("fill", "none");
        reticleArmLeft.setAttribute("stroke", "white");
        reticleArmLeft.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleArmLeft);

        let reticleArmRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmRight.setAttribute("x1", "0");
        reticleArmRight.setAttribute("y1", "0");
        reticleArmRight.setAttribute("x2", "300");
        reticleArmRight.setAttribute("y2", "0");
        reticleArmRight.setAttribute("fill", "none");
        reticleArmRight.setAttribute("stroke", "white");
        reticleArmRight.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleArmRight);

        let reticleArmBottom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmBottom.setAttribute("x1", "0");
        reticleArmBottom.setAttribute("y1", "0");
        reticleArmBottom.setAttribute("x2", "0");
        reticleArmBottom.setAttribute("y2", "200");
        reticleArmBottom.setAttribute("fill", "none");
        reticleArmBottom.setAttribute("stroke", "white");
        reticleArmBottom.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleArmBottom);

        let reticleEnd = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let reticleEndD = SvgUtils.drawArc(350, 10, 300, true);
        reticleEndD += SvgUtils.drawArc(355, 5, 200, true);
        reticleEndD += SvgUtils.drawArc(170, 190, 300, true);
        reticleEndD += SvgUtils.drawArc(175, 185, 200, true);
        reticleEndD += SvgUtils.drawArc(265, 275, 200, true);
        reticleEndD += SvgUtils.drawArc(265, 275, 100, true);
        reticleEnd.setAttribute("d", reticleEndD);
        reticleEnd.setAttribute("fill", "none");
        reticleEnd.setAttribute("stroke", "white");
        reticleEnd.setAttribute("stroke-width", this.strokeWidthLite);
        this.reticleRoot.appendChild(reticleEnd);
    
        this.initialized = true;
    }

    public setReticlePos(x: number, y: number): void {
        let dx = x * this.size * 0.5 * this.reticleMaxRange;
        let dy = y * this.size * 0.5 * this.reticleMaxRange;
        this.reticleRoot.style.left = ((this.clientWidth - this.size) * 0.5 + dx).toFixed(1) + "px";
        this.reticleRoot.style.top = ((this.clientHeight - this.size) * 0.5 + dy).toFixed(1) + "px";
        this.reticleRoot.style.clipPath = "circle(" + (this.size * 0.5 * this.reticleMaxRange + (100 + 4) / this.svgPerPixel).toFixed(0) + "px at " + (- dx + this.size * 0.5).toFixed(1) + "px " + (-dy + this.size * 0.5).toFixed(1) + "px)";
    }

    public setTargetSpeed(s: number): void {
        if (s > 0) {
            this.rightGaugeForwardValue.setAttribute("visibility", "visible");
            let a = 340 * (1 - s) + 390 * s;
            let rightGaugeForwardValueD = SvgUtils.drawArc(340, a, 770, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(a, 930);
            rightGaugeForwardValueD += SvgUtils.drawArc(a, 340, 930, false, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
            this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeForwardValue.setAttribute("visibility", "hidden");
        }
        if (s < 0) {
            this.rightGaugeBackwardValue.setAttribute("visibility", "visible");
            s = - s;
            let a = 340 * (1 - s) + 330 * s;
            let rightGaugeBackwardValueD = SvgUtils.drawArc(a, 340, 770, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 930);
            rightGaugeBackwardValueD += SvgUtils.drawArc(340, a, 930, false, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(a, 770);
            this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeBackwardValue.setAttribute("visibility", "hidden");
        }
        if (s === 0) {
            this.rightGaugeCursor.setAttribute("transform", "rotate(-340 0 0)");
        }
    }
}