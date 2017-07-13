class Comlink {

  private static _clearHandle: number;

  public static Display(lines: string[], delay: number = 5000): void {
    if (!isNaN(Comlink._clearHandle)) {
      clearTimeout(Comlink._clearHandle);
    }
    let text: string = lines[0];
    for (let i: number = 1; i < lines.length; i++) {
      text += "<br/>" + lines[i];
    }
    $("#com-link").html(text);
    Comlink._clearHandle = setTimeout(
      () => {
        $("#com-link").html("");
      },
      delay
    );
  }
}
