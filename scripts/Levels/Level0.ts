class Level0 implements ILevel {

	public static Start(): void {
		$.ajax(
			{
				url : "./pages/level.html",
				success: (data) => {
					$("#page").fadeOut(
						500,
						"linear",
						() => {
							document.getElementById("page").innerHTML = data;
							$("#page").fadeIn(
								500,
								"linear",
								async () => {
									await Main.TMPCreatePlayer();
									await Main.TMPCreateWingMan();
									await Main.TMPCreateWingMan();
									await Main.TMPCreateWingMan();
									await Main.TMPCreateRogue();
									await Main.TMPCreateRogue();
									await Main.TMPCreateRogue();
									Loader.LoadScene("level-0", Main.Scene);
								}
							);
						}
					)
				}
			}
		);
	}

	public introDialogs: string[] = [
		"- Jack, your squad should now be reaching the zone.",
		"- Our drones dropped four beacons here.",
		"- Find and activate the beacons, so we can analyze their data.",
		"- The beacons should appear on your radar. Good luck, stay safe !"
	];

	public tipDialogs: string[] = [
		"- Ok captain. Driving a SpaceShip for dummies.",
		"- Lesson 1 - Use your mouse to rotate the ship.",
		"- Lesson 2 - Press W to accelerate.",
		"- Lesson 3 - Press A or D key to do a barrel-roll.",
		"- Lesson 4 - Press Q or E to assign task to your squad.",
		"- Lesson 5 - Upgrade to Premium Account to unlock blasters.",
		"- And... That's it. Let's find the beacons."
	];

	public dialogs: string[] = [
		"- First beacon activated. Analysis completed. Non-relevant. Three left. Keep on.",
		"- Second beacon activated. Analysis completed. All clear. Two left. Keep on.",
		"- Third beacon activated. Analysis completed. Corrupted data. One left. Keep on.",
		"- Fourth beacon activated. Analysis completed. Got it ! That's all we needed. Mission accomplished !",
		"- Well done Jack ! Get back to base. Over."
	];

	public LoadLevel(scene: BABYLON.Scene): void {
		let beaconMasterName: string = "beacon";
		let beaconMaster: BABYLON.AbstractMesh = Loader.LoadedStatics.get(beaconMasterName)[0];
		if (beaconMaster instanceof BABYLON.Mesh) {
			let instances: BABYLON.InstancedMesh[] = beaconMaster.instances;
			for (let i: number = 0; i < instances.length; i++) {
				let b: BABYLON.InstancedMesh = instances[i];
				let emit: BeaconEmiter = new BeaconEmiter("Emiter-" + i, scene);
				emit.initialize();
				emit.position.copyFrom(b.position);
				emit.rotation.copyFrom(b.rotation);
				let beaconCheck: () => void = () => {
					if (!emit.activated) {
						for (let i: number = 0; i < SpaceShipControler.Instances.length; i++) {
							let spaceShip: SpaceShipControler = SpaceShipControler.Instances[i];
							if (BABYLON.Vector3.DistanceSquared(spaceShip.position, b.position) < Config.activationSqrRange) {
								emit.activate();
								scene.unregisterBeforeRender(beaconCheck);
								HUDComlink.display(
									this.dialogs[BeaconEmiter.activatedCount - 1]
								);
								if (BeaconEmiter.activatedCount === 4) {
									this.Win();
								}
							}
						}
					}
				};
				scene.registerBeforeRender(
					beaconCheck
				);
			}
		}
		$("#play-button").on("pointerup", () => {
			Main.Play();
		});
	}

	public OnGameStart(): void {
		let delay: number = 1000;
		for (let i: number = 0; i < this.introDialogs.length; i++) {
			setTimeout(
				() => {
					HUDComlink.display(this.introDialogs[i]);
				},
				delay
			);
			delay += 6000;
		}
		for (let i: number = 0; i < this.tipDialogs.length; i++) {
			setTimeout(
				() => {
					HUDComlink.display(this.tipDialogs[i]);
				},
				delay
			);
			delay += 3000;
		}
	}

	public Win(): void {
		let time: number = (new Date()).getTime() - Main.playStart;
		setTimeout(
			() => {
				HUDComlink.display(this.dialogs[4]);
				setTimeout(
					() => {
						$("#game-over-time-value").text((time / 1000).toFixed(0) + " sec");
						Main.GameOver();
					},
					5000
				);
			},
			5000
		);
	}

	public UnLoadLevel(): void {
		BeaconEmiter.DisposeAll();
	}
}
