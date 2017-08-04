class Menu {
  public static RunLevel1(): void {
    Loader.LoadScene("level-0", Main.Scene);
  }

  public static ShowMenu(): void {
    //
  }

  public static HideMenu(): void {
    //
  }

  public static RegisterToUI(): void {
    $("#game-over-continue").on(
      "click",
      (e: MouseEvent) => {
        Main.Menu();
      }
    );
    $("#level-0").on(
      "click",
      (e: MouseEvent) => {
        Loader.LoadScene("level-0", Main.Scene);
      }
    );
  }
}
