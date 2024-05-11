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
            error.response.data.message
          );
          throw new Error(`Error: ${error.response.data.message}`);
        } else if (error.response.status === 422) {
          if (error.response.data.errors[0].property === "title") {
            console.error("422 Unprocessable Entity: Subject is required");
            throw new Error(
              `Error: ${error.response.data.errors[0].property} ${error.response.data.errors[0].message}`
            );
          } else if (error.response.data.errors[0].property === "content") {
            console.error("422 Unprocessable Entity: Body is required");
            throw new Error(
              `Error: ${error.response.data.errors[0].property} ${error.response.data.errors[0].message}`
            );
          }
          console.error(
            "422 Unprocessable Entity, Response Message:",
            `${error.response.data.errors[0].property} ${error.response.data.errors[0].message}`
          );
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
          "PRIVATE-TOKEN": `${this.apiKey}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched i3D Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Retrieving ticket:`,
          error.response.data.message
        );

        if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.errorMessage
          );
          throw new Error(
            `${error.response.status} Failed to retrieve i3D ticket: ${error.response.data.errorMessage}`
          );
        } else if (error.response.status === 404) {
          if (error.response.data.errorCode === 10012) {
            console.error(
              "404 Not Found Error, Response Message:",
              error.response.data.errorMessage
            );
            throw new Error(
              `Error: Ticket ID type most likely invalid, ${error.response.data.errorMessage}`
            );
          } else if (error.response.data.errorCode === 10001) {
            console.error(
              `${error.response.status} Error retrieving ticket:`,
              error.response.data.errorMessage
            );
            throw new Error(`Ticket not found: ${ticketId}`);
          }
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

module.exports = _I3dDataCenterAdapter;
