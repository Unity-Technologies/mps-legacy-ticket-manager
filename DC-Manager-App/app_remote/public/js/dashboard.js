import { initClient } from "./ui.js";

document.addEventListener("DOMContentLoaded", function () {
  window.client = initClient();

  window.client.invoke("resize", { width: "100%", height: "160px" });
});
