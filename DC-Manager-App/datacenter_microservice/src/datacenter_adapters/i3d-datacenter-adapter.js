const DataCenterClient = require("../interfaces/datacenter-interface.js");
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests
const fs = require("fs"); // Assuming you need fs for handling file attachments

class _I3dDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const {
      title,
      content,
      department = "Service Desk",
      category = "Bare-metal",
      attachmentIds = [],
    } = data;

    try {
      const requestBody = {
        // Map data to the format required by the 100TB API
        title,
        content,
        category,
        department,
        attachmentIds,
      };

      const response = await axios.post(
        `${this.baseUrl}/tickets`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "PRIVATE-TOKEN": `${this.apiKey}`,
          },
        }
      );

      // Handle the response based on the 100TB API's specific codes and structure
      if (response.status === 200 || response.status === 201) {
        console.log(response);
        return response.data;
      } else {
        if (response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            response.data.message
          );
        } else if (response.status === 422) {
          if (response.data.errors[0].property === "title") {
            console.error("422 Unprocessable Entity: Subject is required");
            throw new Error(
              `Error: ${response.data.errors[0].property} ${response.data.errors[0].message}`
            );
          } else if (response.data.errors[0].property === "content") {
            console.error("422 Unprocessable Entity: Body is required");
            throw new Error(
              `Error: ${response.data.errors[0].property} ${response.data.errors[0].message}`
            );
          }
          console.error(
            "422 Unprocessable Entity, Response Message:",
            `${response.data.errors[0].property} ${response.data.errors[0].message}`
          );
        } else {
          // Handle errors based on the response status code and message
          console.error(
            `${response.status} Error creating i3D ticket:`,
            response.data
          );
          throw new Error(
            `${response.status} Failed to i3D create ticket: ${response.data.message}`
          );
        }
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error creating i3D ticket:", error.message);
      throw error;
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tickets/${ticketId}`, {
        headers: {
          Accept: "application/json",
          "PRIVATE-TOKEN": `${this.apiKey}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched i3D Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
        return response.data;
      } else {
        if (response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            response.data.errorMessage
          );
          throw new Error(
            `${response.status} Failed to retrieve i3D ticket: ${response.data.errorMessage}`
          );
        } else if (response.status === 404) {
          if (response.data.errorCode === 10012) {
            console.error(
              "404 Not Found Error, Response Message:",
              response.data.errorMessage
            );
            throw new Error(
              `Error: Ticket ID type most likely invalid, ${response.data.errorMessage}`
            );
          } else if (response.data.errorCode === 10001) {
            console.error(
              `${response.status} Error retrieving ticket:`,
              response.data.errorMessage
            );
            throw new Error(`Ticket not found: ${ticketId}`);
          }
        } else {
          // Handle errors based on the response status code and message
          console.error(
            `${response.status} Error retrieving i3D ticket:`,
            response.data
          );
          throw new Error(
            `${response.status} Failed to retrieve i3D ticket: ${response.data}`
          );
        }
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error retrieving i3D ticket:", error.message);
      throw error;
    }
  }
}

module.exports = _I3dDataCenterAdapter;
