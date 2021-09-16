class SvgUtils {

    public static lineFromToPolar(a1: number, r1: number, a2: number, r2: number): string {
        a1 *= Math.PI / 180;
        a2 *= Math.PI / 180;

        let x1 = (Math.cos(a1) * r1).toFixed(0);
        let y1 = (- Math.sin(a1) * r1).toFixed(0);
        let x2 = (Math.cos(a2) * r2).toFixed(0);
        let y2 = (- Math.sin(a2) * r2).toFixed(0);

        return "M " + x1 + " " + y1 + " L " + x2 + " " + y2 + " ";
    }

    public static lineToPolar(a: number, r: number): string {
        a *= Math.PI / 180;

        let x = (Math.cos(a) * r).toFixed(0);
        let y = (- Math.sin(a) * r).toFixed(0);

        return "L " + x + " " + y + " ";
    }

    public static drawArc(fromA: number, toA: number, r: number, insertFirstPoint: boolean = true, clockwise: boolean = false): string {
        fromA *= Math.PI / 180;
        toA *= Math.PI / 180;
        
        while (fromA < 0) {
            fromA += 2 * Math.PI;
        }
        while (fromA >= 2 * Math.PI) {
            fromA -= 2 * Math.PI;
        }
        while (toA < 0) {
            toA += 2 * Math.PI;
        }
        while (toA >= 2 * Math.PI) {
            toA -= 2 * Math.PI;
        }

        let largeCircle = "0";
        if (!clockwise) {
            if (toA > fromA) {
                if (toA - fromA > Math.PI) {
                    largeCircle = "1";
                }
            }
            else if (toA < fromA) {
                if (fromA - toA < Math.PI) {
                    largeCircle = "1";
                }
            }
        }

        let x0 = (Math.cos(fromA) * r).toFixed(0);
        let y0 = (- Math.sin(fromA) * r).toFixed(0);
        let x1 = (Math.cos(toA) * r).toFixed(0);
        let y1 = (- Math.sin(toA) * r).toFixed(0);

        let arc = "";
        if (insertFirstPoint) {
            arc += "M " + x0 + " " + y0 + " ";
        }
        arc += "A " + r.toFixed(0) + " " + r.toFixed(0) + " 0 " + largeCircle + " " + (clockwise ? "1" : "0") + " " + x1 + " " + y1 + " ";

        return arc;
    }
}