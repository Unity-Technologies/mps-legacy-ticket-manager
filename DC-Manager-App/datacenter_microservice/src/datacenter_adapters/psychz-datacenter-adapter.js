const DataCenterClient = require("../interfaces/datacenter-interface.js");
require("dotenv").config({ path: "../../../.env" });
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests
const fs = require("fs"); // Assuming you need fs for handling file attachments

// const access_username = process.env.PSYCHZ_ACCESS_USERNAME;

class _PsychzDataCenterAdapter extends DataCenterClient {
  constructor(config, access_username) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
    this.access_username = access_username;
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const {
      department_id = "2",
      subject,
      message,
      priority = "0",
      service_id = "0",
      attach,
    } = data;

    try {
      const requestBody = {
        // Map data to the format required by the Psychz API
        access_token: `${this.apiKey}`,
        access_username: `${this.access_username}`,
        department_id,
        subject,
        message,
        priority,
        service_id,
        attach,
      };

      const response = await axios.post(
        `${this.baseUrl}/ticket_create`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Handle the response based on the Psychz API's specific codes and structure
      if (response.status === 200 || response.status === 201) {
        console.log(response);
        console.log(response.data);
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Creating ticket:`,
          error.response.data
        );

        if (error.response.status === 400) {
          // Handle specific 400 errors based on the message
          if (error.response.data.error.errors[0].field === "subject") {
            throw new Error("Error: Missing Ticket Subject");
          } else if (
            error.response.data.error.errors[0].field === "department_id"
          ) {
            throw new Error("Error: Missing Ticket department_id");
          } else if (error.response.data.error.errors[0].field === "message") {
            throw new Error("Error: Missing Ticket message");
          } else {
            // Handle other 400 errors with a generic message
            throw new Error(
              `Failed to create ticket: ${error.response.data.message}`
            );
          }
        } else if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.error.errors[0].description
          );
          throw new Error(
            `Failed to create ticket: ${error.response.data.error.errors[0].description}`
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
        `${this.baseUrl}/tickets_detail?access_token=${this.apiKey}&access_username=${this.access_username}&ticket_id=${ticketId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched Psychz Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
        console.log(response.data.data);
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Retrieving ticket:`,
          error.response.data.error
        );

        if (error.response.status === 400) {
          if (error.response.data.error.errors[0].field === "ticket_id") {
            throw new Error(`400 Ticket ID Type Invalid: ${error.response.data.error.errors[0].description}`);
          } else if (
            error.response.data.error.errors[0].field === "access_username"
          ) {
            throw new Error(`400 Access Username Invalid: ${error.response.data.error.errors[0].description}`);
          } else {
            // Handle other 400 errors with a generic message
            throw new Error(
              `Failed to create ticket: ${error.response.data.error}`
            );
          }
        } else if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.error.errors[0].description
          );
          throw new Error(
            `Failed to retrieve ticket: ${error.response.data.error.errors[0].description}`
          );
        } else if (
          error.response.data.status === 404 ||
          error.response.status === 404
        ) {
          console.error(
            `${error.response.status} Error retrieving ticket:`,
            error.response.data.error.errors[0].description
          );
          throw new Error(`Ticket not found: ${ticketId}`); // Informative message for 404
        } else {
          // Handle other unexpected errors
          throw new Error(`Failed to retrieve ticket: ${error.response}`);
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

module.exports = _PsychzDataCenterAdapter;
