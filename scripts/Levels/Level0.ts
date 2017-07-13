class Level0 implements ILevel {

  public LoadLevel(): void {
    // do nothing
  }

  public OnGameStart(): void {
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[0], 10000);
      },
      3000
    );
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[1], 10000);
      },
      16000
    );
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[2], 10000);
      },
      29000
    );
    setTimeout(
      () => {
        Comlink.Display(Dialogs.tipsCommands[3], 10000);
      },
      42000
    );
  }
}
