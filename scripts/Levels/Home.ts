class Home {

	public static Start(): void {
		$.ajax(
			{
				url : "./pages/menu.html",
				success: (data) => {
					$("#page").fadeOut(
						500,
						"linear",
						() => {
							document.getElementById("page").innerHTML = data;
							$("#page").fadeIn(500);
						}
					)
				}
			}
		);
	}
}
