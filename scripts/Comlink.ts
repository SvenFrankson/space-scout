class Comlink {

  public static Display(lines: string[], delay: number = 5000): void {
    for (let i: number = 0; i < lines.length; i++) {
      $("#com-link").append("<div>" + lines[i] + "</div>");
    }
    while ($("#com-link").children().length > 4) {
      $("#com-link").children().get(0).remove();
    }
  }
}
