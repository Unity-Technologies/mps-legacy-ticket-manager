import {
  initClient,
  handleDataCenterChange,
  addFormEventListeners,
} from "./ui.js";
import { fetchUserData, fetchTicketId } from "./zendeskData.js";

document.addEventListener("DOMContentLoaded", function () {
  window.client = initClient(); // Attach client to the global window object

  fetchUserData(window.client);
  fetchTicketId(window.client);
  addFormEventListeners();

  document
    .querySelector("#data-center")
    .addEventListener("change", function () {
      handleDataCenterChange(window.client);
    });
});
