let client; // Declare the client variable globally

document.addEventListener("DOMContentLoaded", function () {
  client = ZAFClient.init();

  client.invoke("resize", { width: "100%", height: "160px" });
});
