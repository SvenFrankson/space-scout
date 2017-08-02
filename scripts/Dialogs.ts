class Dialogs {

  private static neutralCommands: string[] =
    [
      "- Copy that.",
      "- Loud and clear, I'm on it.",
      "- I'll check it for you captain.",
      "- Affirmative.",
      "- Roger. Wilco."
    ];

  public static randomNeutralCommand(): string {
    let index: number = Math.floor(Math.random() * Dialogs.neutralCommands.length);
    return Dialogs.neutralCommands[index];
  }
}
