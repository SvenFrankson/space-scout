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
  private static pictures: string[] = [
    "./img/conference.png",
    "./img/sun.png",
    "./img/galaxy.png",
    "./img/spaceships.png"
  ];

  public static RunIntro(): void {
    Intro.index = -1;
    $("#cinematic-frame").show();
    $("#cinematic-frame-title").show();
    $("#cinematic-frame-location-date").hide();
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
    $("#cinematic-frame-text").text(Intro.texts[Intro.index]);
    $("#cinematic-frame-picture-img").attr("src", Intro.pictures[Intro.index]);
    Intro._timeoutHandle = setTimeout(
      () => {
        Intro.UpdateIntro();
      },
      6000
    );
  }

  private static CloseIntro(): void {
    $("#cinematic-frame").hide();
    $("#cinematic-frame-title").hide();
    $("#cinematic-frame-location-date").hide();
    $("#skip-button").hide();
    $("#skip-button").off();
    Menu.RunLevel1();
  }
}
