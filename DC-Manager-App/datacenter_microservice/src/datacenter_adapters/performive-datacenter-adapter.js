const DataCenterClient = require("../interfaces/datacenter-interface.js");
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests

class _PerformiveDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const {
        group = "Support",
        subject,
        body,
    } = data;

    try {
      const requestBody = {
        // Map data to the format required by the Performive API
        group,
        subject,
        body,
      };

      const response = await axios.post(
        `${this.baseUrl}/tickets`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            'X-Auth-Token': `${this.apiKey}`,
          },
        }
      );

      // Handle the response based on the Performive API's specific codes and structure
      if (response.status === 200 || response.status === 201) {
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
          `${response.status} Error creating Performive ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to create Performive ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error creating Performive ticket:", error.message);
      throw error;
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tickets/${ticketId}`, {
        headers: {
          "Accept": "application/json",
          "X-Auth-Token": `${this.apiKey}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched Performive Ticket #${ticketId}:`, response);
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
          `${response.status} Error retrieving Performive ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to retrieve Performive ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error retrieving Performive ticket:", error.message);
      throw error;
    }
  }
}

module.exports = _PerformiveDataCenterAdapter;
