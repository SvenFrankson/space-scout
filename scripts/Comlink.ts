class Comlink {

  private static _lineCount: number = 0;

  public static Display(
    sender: string,
    line: string,
    hexColor: string = "ffffff",
    delay: number = 10000
  ): void {
    let id: string = "com-link-line-" + Comlink._lineCount;
    Comlink._lineCount++;
    $("#com-link").append(
      "<div id='" + id + "' class='row'>" +
        "<div class='col-xs-2 no-click'>[" + sender + "]</div>" +
        "<div class='col-xs-10 no-click'>" + line + "</div>" +
      "</div>"
    );
    $("#" + id).css("color", "#" + hexColor);
    setTimeout(
      () => {
        $("#" + id).remove();
      },
      delay
    );
    while ($("#com-link").children().length > 4) {
      $("#com-link").children().get(0).remove();
    }
  }
}
