const DataCenterClient = require("../interfaces/datacenter-interface.js");
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests
const fs = require("fs"); // Assuming you need fs for handling file attachments

class _InapDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const { priority, shortDescription, description } = data;

    try {
      const requestBody = {
        // Map data to the format required by the INAP API
        priority,
        shortDescription,
        description,
      };

      const response = await axios.post(
        `${this.baseUrl}/support-cases`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      // Handle the response based on the INAP API's specific codes and structure
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
          // Handle specific 400 errors based on the message
          if (error.response.data.message === "shortDescription is required") {
            throw new Error("Error: Missing Ticket Subject");
          } else if (
            error.response.data.message === "description is required"
          ) {
            throw new Error("Error: Missing Ticket Body");
          } else {
            // Handle other 400 errors with a generic message
            throw new Error(
              `Failed to create ticket: ${error.response.data.message}`
            );
          }
        } else if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `401 Error Failed to create ticket: ${error.response.data.message}`
          );
        } else if (error.response.status === 500) {
          console.error(
            "500 Internal Server Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `500 Error Failed to create ticket: ${error.response.data.message}`
          );
        } else {
          // Handle other unexpected errors
          throw new Error(`Failed to create ticket: ${error.response}`);
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
      const response = await axios.get(
        `${this.baseUrl}/support-cases/${ticketId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched INAP Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
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

        if (error.response.status === 401) {
          // Handle specific 400 errors based on the message
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `401 Error Failed to create ticket: ${error.response.data.message}`
          );
        } else if (error.response.status === 403) {
          console.error(
            "403 Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `403 Error Failed to retrieve ticket: ${error.response.data.message}`
          );
        } else if (error.response.status === 404) {
          console.error(
            "404 Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `404 Error Failed to retrieve ticket: ${error.response.data.message}`
          );
        } else if (error.response.status === 500) {
          console.error(
            "500 Internal Server Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `500 Error Failed to create ticket: ${error.response.data.message}`
          );
        } else {
          // Handle other unexpected errors
          throw new Error(`Failed to create ticket: ${error.response}`);
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
}

module.exports = _InapDataCenterAdapter;
