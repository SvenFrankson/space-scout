class Route {

    public static async route(): Promise<void> {
        let hash = window.location.hash.slice(1) || "home";
        if (hash === "home") {
            Home.Start();
        }
        if (hash === "level-0") {
            Level0.Start();
        }
        if (hash === "test") {
            await Demo.Start();
            $("#page").hide();
			Main.Play();
        }
    }
}