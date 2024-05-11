const DataCenterClient = require("../interfaces/datacenter-interface.js");
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests

class _PerformiveDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const { group = "Support", subject, body } = data;

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
            Accept: "application/json",
            "X-Auth-Token": `${this.apiKey}`,
          },
        }
      );

      // Handle the response based on the Performive API's specific codes and structure
      if (response.status === 200 || response.status === 201) {
        console.log(response.data);
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Creating ticket:`,
          error.response.data.message
        );

        if (error.response.status === 400) {
          console.error(
            `400 Error Creating ticket:`,
            error.response.data.reason
          );
          throw new Error(`Error: ${error.response.data.reason}`);
        } else if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.message
          );
          throw new Error(`401 Unauthorized Error: ${response.data.reason}`);
        } else {
          // Handle other unexpected errors
          throw new Error(`Failed to create ticket: ${error.message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error creating ticket: No response received");
        throw new Error("Network Error: Could not create ticket");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error creating ticket:", error);
        throw error;
      }
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tickets/${ticketId}`, {
        headers: {
          Accept: "application/json",
          "X-Auth-Token": `${this.apiKey}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        if (response.data.success === true) {
          console.log(`Fetched Performive Ticket #${ticketId}:`, response.data);
          console.log(response);
          return response.data;
        } else {
          console.error(`Error: ${response.data.message}`);
          throw new Error(`Error: ${response.data.message}`);
        }
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Creating ticket:`,
          error.response.data.message
        );

        if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.reason
          );
          throw new Error(
            `401 Unauthorized Error: ${error.response.data.reason}`
          );
        } else {
          // Handle other unexpected errors
          throw new Error(`Failed to retrieve ticket: ${error.message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error retrieving ticket: No response received");
        throw new Error("Network Error: Could not retrieve ticket");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error retrieving ticket:", error);
        throw error;
      }
    }
  }
}

module.exports = _PerformiveDataCenterAdapter;
