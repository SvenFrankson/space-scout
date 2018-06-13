class RuntimeUtils {
    
    public static NextFrame(scene: BABYLON.Scene, callback: () => void): void {
        let todoNextFrame = () => {
            callback();
            scene.unregisterAfterRender(todoNextFrame);
        }
        scene.registerAfterRender(todoNextFrame);
    }

    public static throttleTimeout: number = 0;
    public static throttleGroups: Map<string, number> = new Map<string, number>();
    public static Throttle(f: () => void, group: string, timeout: number = 1000) {
        let now = (new Date()).getTime();
        clearTimeout(RuntimeUtils.throttleTimeout);
        if (!RuntimeUtils.throttleGroups.has(group)) {
            f();
            RuntimeUtils.throttleGroups.set(group, now);
        }
        else {
            let lastCall = RuntimeUtils.throttleGroups.get(group);
            if (now - lastCall > timeout) {
                f();
                RuntimeUtils.throttleGroups.set(group, now);
            }
            else {
                RuntimeUtils.throttleTimeout = setTimeout(
                    () => {
                        f();
                        RuntimeUtils.throttleGroups.set(group, (new Date()).getTime());
                    },
                    timeout - (now - lastCall)
                );
            }
        }
    }
}