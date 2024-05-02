const DataCenterClient = require("../interfaces/datacenter-interface.js");
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests
const fs = require("fs"); // Assuming you need fs for handling file attachments

class _VeliaDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const {
      subject,
      topic = "velianet-support",
      summary,
      message,
      files = [],
    } = data;

    try {
      const requestBody = {
        // Map data to the format required by the 100TB API
        subject,
        topic,
        summary,
        message,
        files,
      };

      const response = await axios.post(
        `${this.baseUrl}/ticket`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `${this.apiKey}`,
          },
        }
      );

      // Handle the response based on the 100TB API's specific codes and structure
      if (response.status === 200 || response.status === 201) {
        console.log(response);
        console.log(response.data);
        return response.data;
      } else if (response.status === 401) {
        console.error(
          "401 Unauthenticated Error, Response Message:",
          response.data.message
        );
      } else {
        // Handle errors based on the response status code and message
        console.error(
          `${response.status} Error creating Velia ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to Velia create ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error creating Velia ticket:", error.message);
      throw error;
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/ticket/${ticketId}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `${this.apiKey}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched Velia Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
        return response.data;
      } else if (response.status === 401) {
        console.error(
          "401 Unauthenticated Error, Response Message:",
          response.data.message
        );
      } else {
        // Handle errors based on the response status code and message
        console.error(
          `${response.status} Error retrieving Velia ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to retrieve Velia ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error retrieving Velia ticket:", error.message);
      throw error;
    }
  }
}

module.exports = _VeliaDataCenterAdapter;
