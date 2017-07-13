class Dialogs {
  private static tipsCommands: string[][] =
    [
      ["- Sir, you may pilot using your mouse.", "- Move cursor around, the ship should follow, Sir."],
      ["- Sir, you may accelerate using W.", "- And brake by pressing S, Sir."],
      ["- Sir, assign tasks to your squad using E or R.", "- Check top-left Team-panel for supervision, Sir."],
      ["- Sir, use A and D to roll.", "- Do a barrel-roll, Sir."]
    ];

  public static randomTipsCommand(): string[] {
    let index: number = Math.floor(Math.random() * Dialogs.tipsCommands.length);
    return Dialogs.tipsCommands[index];
  }

  private static neutralCommands: string[][] =
    [
      ["- Copy that."],
      ["- Loud and clear, I'm on it."],
      ["- I'll check it for you captain."],
      ["- Affirmative."],
      ["- Roger. Wilco."]
    ];

  public static randomNeutralCommand(): string[] {
    let index: number = Math.floor(Math.random() * Dialogs.neutralCommands.length);
    return Dialogs.neutralCommands[index];
  }
}
