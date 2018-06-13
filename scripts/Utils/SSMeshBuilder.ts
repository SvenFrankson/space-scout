class SSMeshBuilder {

    public static CreateZCircleMesh(radius: number, scene: BABYLON.Scene, color?: BABYLON.Color4, updatable?: boolean, instance?: BABYLON.LinesMesh): BABYLON.LinesMesh {
        let points: BABYLON.Vector3[] = [];
        let colors: BABYLON.Color4[] = [];
        if (!color) {
            color = new BABYLON.Color4(1, 1, 1, 1);
        }
        for (let i = 0; i <= 32; i++) {
            points.push(
                new BABYLON.Vector3(
                    radius * Math.cos(i / 32 * Math.PI * 2),
                    radius * Math.sin(i / 32 * Math.PI * 2),
                    0
                )
            );
            colors.push(color);
        }
        return BABYLON.MeshBuilder.CreateLines(
            "zcircle",
            {
                points: points,
                colors: colors,
                updatable: updatable,
                instance: instance
            },
            scene
        );
    }

    public static CreateZRailMesh(
        radiusIn: number, radiusOut: number,
        alphaMin: number, alphaMax: number,
        tesselation: number,
        scene: BABYLON.Scene, color?: BABYLON.Color4, updatable?: boolean, instance?: BABYLON.LinesMesh
    ): BABYLON.LinesMesh {
        let alphaLength = alphaMax - alphaMin;
        let count = Math.round(alphaLength * 64 / (Math.PI * 2));
        if (count < 1) {
            return BABYLON.MeshBuilder.CreateLines(
                "zcircle",
                {
                    points: [],
                    colors: [],
                    updatable: updatable,
                    instance: instance
                },
                scene
            ); 
        }
        let step = alphaLength / count;
        let points: BABYLON.Vector3[] = [];
        let colors: BABYLON.Color4[] = [];
        if (!color) {
            color = new BABYLON.Color4(1, 1, 1, 1);
        }
        for (let i = 0; i <= count; i++) {
            points.push(
                new BABYLON.Vector3(
                    radiusIn * Math.cos(alphaMin + i * step),
                    radiusIn * Math.sin(alphaMin + i * step),
                    0
                )
            );
            colors.push(color);
        }
        for (let i = count; i >= 0; i--) {
            points.push(
                new BABYLON.Vector3(
                    radiusOut * Math.cos(alphaMin + i * step),
                    radiusOut * Math.sin(alphaMin + i * step),
                    0
                )
            );
            colors.push(color);
        }
        points.push(points[0]);
        colors.push(colors[0]);
        return BABYLON.MeshBuilder.CreateLines(
            "zcircle",
            {
                points: points,
                colors: colors,
                updatable: updatable,
                instance: instance
            },
            scene
        );
    }
}