class Comlink {

  private static _lineCount: number = 0;

  public static Display(lines: string[], delay: number = 5000): void {
    for (let i: number = 0; i < lines.length; i++) {
      let id: string = "com-link-line-" + Comlink._lineCount;
      Comlink._lineCount++;
      $("#com-link").append("<div id='" + id + "'>" + lines[i] + "</div>");
      setTimeout(
        () => {
          $("#" + id).remove();
        },
        delay
      );
    }
    while ($("#com-link").children().length > 4) {
      $("#com-link").children().get(0).remove();
    }
  }
}
