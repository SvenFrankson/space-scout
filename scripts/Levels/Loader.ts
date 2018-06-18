interface IScene {
	cinematic: ICinematic;
	statics: IStatic[];
}

interface IStatic {
	name: string;
	x: number;
	y: number;
	z: number;
	s?: number;
	rX?: number;
	rY?: number;
	rZ?: number;
}

interface ICinematic {
	location: string;
	date: string;
	xCam: number;
	yCam: number;
	zCam: number;
	frames: ICinematicFrame[];
}

interface ICinematicFrame {
	text: string;
	delay: number;
}

class Loader {

	private static async _sleep(delay: number): Promise<void> {
		return new Promise<void>(
			(resolve) => {
				setTimeout(
					resolve,
					delay
				);
			}
		)
	}

	public static LoadedStatics: Map<string, BABYLON.AbstractMesh[]> = new Map<string, BABYLON.AbstractMesh[]>();

	public static async LoadScene(name: string, scene: BABYLON.Scene): Promise<void> {
		Main.Level = new Level0();
		return new Promise<void>(
			(resolve) => {
				$.ajax(
					{
						url: "./datas/scenes/" + name + ".json",
						success: async (data: IScene) => {
							Main.Scene.activeCamera = Main.MenuCamera;
							Main.MenuCamera.position = new BABYLON.Vector3(data.cinematic.xCam, data.cinematic.yCam, data.cinematic.zCam);
							Loader.RunCinematic(data.cinematic);
							await Loader._loadSceneData(data, scene);
							await Main.Level.LoadLevel(scene);
							resolve();
						}
					}
				);
			}
		)
	}

	private static index: number = 0;
	public static RunCinematic(data: ICinematic): void {
		Loader.index = -1;
		Layout.CinematicLayout();
		$("#cinematic-frame-location").text(data.location);
		$("#cinematic-frame-date").text(data.date);
		$("#skip-button").on(
			"click",
			() => {
				Loader.UpdateCinematic(data);
			}
		);
		Loader.UpdateCinematic(data);
	}

	private static _timeoutHandle: number = 0;
	private static UpdateCinematic(data: ICinematic): void {
		clearTimeout(Loader._timeoutHandle);
		Loader.index = Loader.index + 1;
		if (!data.frames[Loader.index]) {
			return Loader.CloseCinematic();
		}
		$("#cinematic-frame-text").text(data.frames[Loader.index].text);
		Loader._timeoutHandle = setTimeout(
			() => {
				Loader.UpdateCinematic(data);
			},
			data.frames[Loader.index].delay
		);
	}

	private static CloseCinematic(): void {
		// note : This should actually be "Loading Layout", and auto skip once level is fully loaded.
		Layout.ReadyLayout();
	}

	public static async _loadSceneData(data: IScene, scene: BABYLON.Scene): Promise<void> {
		await Loader.AddStaticsIntoScene(data.statics, scene, Config.sceneLoaderDelay);
	}

	private static async _loadStatic(
		name: string,
		scene: BABYLON.Scene
	): Promise<BABYLON.AbstractMesh[]> {
		return new Promise<BABYLON.AbstractMesh[]>(
			(resolve) => {
				BABYLON.SceneLoader.ImportMesh(
					"",
					"./datas/" + name + ".babylon",
					"",
					scene,
					(
						meshes: Array<BABYLON.AbstractMesh>,
						particleSystems: Array<BABYLON.ParticleSystem>,
						skeletons: Array<BABYLON.Skeleton>
					) => {
						Loader.LoadedStatics.set(name, []);
						for (let i: number = 0; i < meshes.length; i++) {
							if (meshes[i] instanceof BABYLON.Mesh) {
								let mesh: BABYLON.Mesh = meshes[i] as BABYLON.Mesh;
								mesh.layerMask = 1;
								Loader.LoadedStatics.get(name).push(mesh);
								Loader._loadMaterial(mesh.material, name, scene);
								for (let j: number = 0; j < mesh.instances.length; j++) {
									Loader.LoadedStatics.get(name).push(mesh.instances[j]);
									mesh.instances[j].isVisible = false;
									mesh.instances[j].isPickable = false;
								}
								mesh.isVisible = false;
								mesh.isPickable = false;
							}
						}
						resolve(Loader.LoadedStatics.get(name));
					}
				);
			}
		)
	}

	private static _loadMaterial(material: BABYLON.Material, name: string, scene: BABYLON.Scene): void {
		if (material instanceof BABYLON.StandardMaterial) {
			material.bumpTexture = new BABYLON.Texture("./datas/" + name + "-bump.png", scene);
			material.ambientTexture = new BABYLON.Texture("./datas/" + name + "-ao.png", scene);
		}
	}

	private static _cloneStaticIntoScene(
		sources: Array<BABYLON.AbstractMesh>,
		x: number,
		y: number,
		z: number,
		s: number = 1,
		rX: number = 0,
		rY: number = 0,
		rZ: number = 0,
		callback?: () => void
	): void {
		let instance: BABYLON.AbstractMesh;
		for (let i: number = 0; i < sources.length; i++) {
			if (sources[i] instanceof BABYLON.Mesh) {
				let source: BABYLON.Mesh = sources[i] as BABYLON.Mesh;
				instance = source.createInstance(source.name);
				instance.layerMask = 1;
				instance.position.copyFromFloats(x, y, z);
				instance.rotation.copyFromFloats(rX, rY, rZ);
				instance.scaling.copyFromFloats(s, s, s);
				instance.computeWorldMatrix();
				instance.freezeWorldMatrix();
				if (source.name[0] === "S") {
					let radius: string = source.name.substring(2);
					instance.getBoundingInfo().boundingSphere.radius = parseFloat(radius);
					instance.getBoundingInfo().boundingSphere.radiusWorld = parseFloat(radius) * s;
				}
				Obstacle.PushSphere(instance.getBoundingInfo().boundingSphere);
			} else if (sources[i] instanceof BABYLON.InstancedMesh) {
				let source: BABYLON.InstancedMesh = sources[i] as BABYLON.InstancedMesh;
				instance = source.sourceMesh.createInstance(source.name);
				instance.layerMask = 1;
				instance.position.copyFromFloats(x, y, z);
				instance.rotation.copyFromFloats(rX, rY, rZ);
				instance.computeWorldMatrix();
				instance.freezeWorldMatrix();
			}
		}
		if (callback) {
			callback();
		}
	}

	public static async AddStaticsIntoScene(
		datas: IStatic[],
		scene: BABYLON.Scene,
		delay: number = 1
	): Promise<void> {
		for (let i = 0; i < datas.length; i++) {
			await Loader.AddStaticIntoScene(datas[i], scene);
			if (delay > 0) {
				await Loader._sleep(delay);
			}
		}
	}

	public static async AddStaticIntoScene(
		data: IStatic,
		scene: BABYLON.Scene
	): Promise<void> {
		if (Loader.LoadedStatics.get(data.name)) {
			Loader._cloneStaticIntoScene(
				Loader.LoadedStatics.get(data.name),
				data.x, data.y, data.z,
				data.s,
				data.rX, data.rY, data.rZ
			);
		} else {
			let loadedMeshes = await Loader._loadStatic(data.name, scene);
			Loader._cloneStaticIntoScene(loadedMeshes, data.x, data.y, data.z, data.s, data.rX, data.rY, data.rZ);
		}
	}

	public static UnloadScene(): void {
		Loader.LoadedStatics.forEach(
			(
				v: Array<BABYLON.AbstractMesh>,
				index: string
			) => {
				for (let i: number = 0; i < v.length; i++) {
					let m: BABYLON.AbstractMesh = v[i];
					if (m) {
						m.dispose();
					}
				}
			}
		);
		Loader.LoadedStatics = new Map<string, BABYLON.AbstractMesh[]>();
	}
}
