class Intro {
  private static index: number = 0;
  private static texts: string[] = [
    "It's been more than a thousand year since the Buenos Aires Conference of May " +
    "4th 2028, when all nations of earth united their space programs in a common quest for the stars.",
    "Mankind boundaries has since been pushed away to extends no one had expected. " +
    "Less than a century after the first Titan's civilian settlement, an inhabited spacecraft revolved around Proxima Centauri in 2242.",
    "Encounters with evolved life forms occurred along the whole millennium, and most " +
    "galactic hubs are populated by several coexisting species.",
    "Unwearied, earthlings keep spreading through the galaxy, a few dozens light-years away from home."
  ];

  public static RunIntro(): void {
    Intro.index = -1;
    $("#cinematic-frame").show();
    $("#cinematic-frame-location").parent().hide();
    $("#cinematic-frame-date").parent().hide();
    $("#cinematic-frame-text").show();
    $("#skip-button").show();
    $("#skip-button").on(
      "click",
      () => {
        Intro.UpdateIntro();
      }
    );
    Intro.UpdateIntro();
  }

  private static _timeoutHandle: number = 0;
  private static UpdateIntro(): void {
    clearTimeout(Intro._timeoutHandle);
    Intro.index = Intro.index + 1;
    if (!Intro.texts[Intro.index]) {
      return Intro.CloseIntro();
    }
    console.log(".");
    $("#cinematic-frame-text").text(Intro.texts[Intro.index]);
    Intro._timeoutHandle = setTimeout(
      () => {
        Intro.UpdateIntro();
      },
      6000
    );
  }

  private static CloseIntro(): void {
    $("#cinematic-frame").hide();
    $("#cinematic-frame-location").parent().hide();
    $("#cinematic-frame-date").parent().hide();
    $("#cinematic-frame-text").hide();
    $("#skip-button").hide();
    $("#skip-button").off();
    Menu.RunLevel1();
  }
}
