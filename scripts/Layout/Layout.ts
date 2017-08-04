class Layout {
  private static _focalLength: JQuery;
  public static get focalLength(): JQuery {
    if (!Layout._focalLength) {
      Layout._focalLength = $("#focal-length");
    }
    return Layout._focalLength;
  }

  private static _targets: JQuery;
  public static get targets(): JQuery {
    if (!Layout._targets) {
      Layout._targets = $(".target");
    }
    return Layout._targets;
  }

  private static _target1: JQuery;
  public static get target1(): JQuery {
    if (!Layout._target1) {
      Layout._target1 = $("#target1");
    }
    return Layout._target1;
  }

  private static _mapIcons: JQuery;
  public static get mapIcons(): JQuery {
    if (!Layout._mapIcons) {
      Layout._mapIcons = $(".map-icon");
    }
    return Layout._mapIcons;
  }

  private static _panelRight: JQuery;
  public static get panelRight(): JQuery {
    if (!Layout._panelRight) {
      Layout._panelRight = $("#panel-right");
    }
    return Layout._panelRight;
  }

  private static _speedDisplay: JQuery;
  public static get speedDisplay(): JQuery {
    if (!Layout._speedDisplay) {
      Layout._speedDisplay = $("speed-display");
    }
    return Layout._speedDisplay;
  }

  private static _objectiveRadar: JQuery;
  public static get objectiveRadar(): JQuery {
    if (!Layout._objectiveRadar) {
      Layout._objectiveRadar = $("#objective-radar");
    }
    return Layout._objectiveRadar;
  }

  private static _comLink: JQuery;
  public static get comLink(): JQuery {
    if (!Layout._comLink) {
      Layout._comLink = $("#com-link");
    }
    return Layout._comLink;
  }

  private static _teamPanel: JQuery;
  public static get teamPanel(): JQuery {
    if (!Layout._teamPanel) {
      Layout._teamPanel = $("#team-panel");
    }
    return Layout._teamPanel;
  }

  private static _frames: JQuery;
  public static get frames(): JQuery {
    if (!Layout._frames) {
      Layout._frames = $(".frame");
    }
    return Layout._frames;
  }

  private static _cinematicFrame: JQuery;
  public static get cinematicFrame(): JQuery {
    if (!Layout._cinematicFrame) {
      Layout._cinematicFrame = $("#cinematic-frame");
    }
    return Layout._cinematicFrame;
  }

  private static _cinematicFrameTitle: JQuery;
  public static get cinematicFrameTitle(): JQuery {
    if (!Layout._cinematicFrameTitle) {
      Layout._cinematicFrameTitle = $("#cinematic-frame-title");
    }
    return Layout._cinematicFrameTitle;
  }

  private static _cinematicFrameLocationDate: JQuery;
  public static get cinematicFrameLocationDate(): JQuery {
    if (!Layout._cinematicFrameLocationDate) {
      Layout._cinematicFrameLocationDate = $("#cinematic-frame-location-date");
    }
    return Layout._cinematicFrameLocationDate;
  }

  private static _gameOverFrame: JQuery;
  public static get gameOverFrame(): JQuery {
    if (!Layout._gameOverFrame) {
      Layout._gameOverFrame = $("#game-over-frame");
    }
    return Layout._gameOverFrame;
  }

  private static _mainMenu: JQuery;
  public static get mainMenu(): JQuery {
    if (!Layout._mainMenu) {
      Layout._mainMenu = $("#main-menu");
    }
    return Layout._mainMenu;
  }

  private static _playButton: JQuery;
  public static get playButton(): JQuery {
    if (!Layout._playButton) {
      Layout._playButton = $("#play-button");
    }
    return Layout._playButton;
  }

  private static _skipButton: JQuery;
  public static get skipButton(): JQuery {
    if (!Layout._skipButton) {
      Layout._skipButton = $("#skip-button");
    }
    return Layout._skipButton;
  }

  private static HideAll(): void {
    Layout.focalLength.hide();
    Layout.targets.hide();
    Layout.mapIcons.hide();
    Layout.panelRight.hide();
    Layout.speedDisplay.hide();
    Layout.objectiveRadar.hide();
    Layout.comLink.hide();
    Layout.teamPanel.hide();
    Layout.frames.hide();
    Layout.mainMenu.hide();
    Layout.playButton.hide();
    Layout.skipButton.hide();
  }

  public static Resize(): void {
    let w: number = Main.Canvas.width;
    let h: number = Main.Canvas.height;
    let size: number = Math.min(w, h);
    Layout.frames.css("width", size * 0.8);
    Layout.frames.css("height", size * 0.8);
    Layout.frames.css("bottom", h / 2 - size * 0.8 / 2);
    Layout.frames.css("left", w / 2 - size * 0.8 / 2);

    Layout.target1.css("width", size * 0.9 + "px");
    Layout.target1.css("height", size * 0.9 + "px");
    Layout.target1.css("top", Main.Canvas.height / 2 - size * 0.9 / 2);
    Layout.target1.css("left", Main.Canvas.width / 2 - size * 0.9 / 2);

    Layout.panelRight.css("width", size / 3 + "px");
    Layout.panelRight.css("height", size / 3 + "px");
    Layout.panelRight.css("top", Main.Canvas.height - size / 3);
    Layout.panelRight.css("left", Main.Canvas.width - size / 3);

    Layout.speedDisplay.css("width", size / 3 + "px");
    Layout.speedDisplay.css("height", size / 3 + "px");
    Layout.speedDisplay.css("top", Main.Canvas.height - size / 3);
    Layout.speedDisplay.css("left", Main.Canvas.width - size / 3);

    Layout.objectiveRadar.css("width", size / 2 * 0.8 + "px");
    Layout.objectiveRadar.css("height", size / 2 * 0.8 + "px");
    Layout.objectiveRadar.css("top", size / 2 * 0.1);
    Layout.objectiveRadar.css("left", size / 2 * 0.1);
  }

  public static IntroLayout(): void {
    Layout.HideAll();
    Layout.cinematicFrame.show();
    Layout.skipButton.show();
    Layout.cinematicFrameLocationDate.hide();
    Layout.cinematicFrameTitle.show();
  }

  public static CinematicLayout(): void {
    Layout.HideAll();
    Layout.cinematicFrame.show();
    Layout.skipButton.show();
    Layout.cinematicFrameLocationDate.show();
    Layout.cinematicFrameTitle.hide();
  }

  public static ReadyLayout(): void {
    Layout.HideAll();
    Layout.playButton.show();
  }

  public static GameOverLayout(): void {
    Layout.HideAll();
    Layout.gameOverFrame.show();
  }

  public static GameLayout(): void {
    Layout.HideAll();
    Layout.focalLength.show();
    Layout.targets.show();
    Layout.mapIcons.show();
    Layout.panelRight.show();
    Layout.speedDisplay.show();
    Layout.objectiveRadar.show();
    Layout.comLink.show();
    Layout.teamPanel.show();
  }
}
