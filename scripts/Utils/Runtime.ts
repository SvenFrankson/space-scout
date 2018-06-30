class RuntimeUtils {

    public static StartCoroutine(coroutine: IterableIterator<any>) {
		ScreenLoger.instance.log("Start Coroutine");
		let step = () => {
			if (coroutine.next()) {
				return;
			}
			Main.Scene.onBeforeRenderObservable.removeCallback(step);
		}
		Main.Scene.onBeforeRenderObservable.add(step);
	}

	public static async RunCoroutine(coroutine: IterableIterator<any>): Promise<void> {
		ScreenLoger.instance.log("Run Coroutine");
		return new Promise<void> (
			(resolve) => {
				let step = () => {
					if (!coroutine.next().done) {
						return;
					}
					resolve();
					Main.Scene.onBeforeRenderObservable.removeCallback(step);
				}
				Main.Scene.onBeforeRenderObservable.add(step);
			}
		)
	}
    
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