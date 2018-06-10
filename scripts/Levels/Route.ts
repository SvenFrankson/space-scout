class Route {

    public static route(): void {
        let hash = window.location.hash.slice(1) || "home";
        if (hash === "home") {
            Home.Start();
        }
        if (hash === "level-0") {
            Level0.Start();
        }
    }
}