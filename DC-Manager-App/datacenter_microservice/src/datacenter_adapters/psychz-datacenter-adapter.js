const DataCenterClient = require("../interfaces/datacenter-interface.js");
require("dotenv").config({ path: "../../../.env" });
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests
const fs = require("fs"); // Assuming you need fs for handling file attachments

const access_username = process.env.PSYCHZ_ACCESS_USERNAME;

class _PsychzDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const {
      department_id = "2",
      subject,
      message,
      priority = "0",
      service_id = "0",
      attach = [],
    } = data;

    try {
      const requestBody = {
        // Map data to the format required by the Psychz API
        access_token: `${this.apiKey}`,
        access_username: access_username,
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
            "Accept": "application/json",
          },
        }
      );

      // Handle the response based on the Psychz API's specific codes and structure
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
          `${response.status} Error creating Psychz ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to create Psychz ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error creating Psychz ticket:", error.message);
      throw error;
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await axios.get(`${this.baseUrl}/tickets_detail?access_token=${this.apiKey}&access_username=${access_username}&ticket_id=${ticketId}`, {
        headers: {
            'accept': 'application/json'
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched Psychz Ticket #${ticketId}:`, response.data);
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
          `${response.status} Error retrieving Psychz ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to retrieve Psychz ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error retrieving Psychz ticket:", error.message);
      throw error;
    }
  }
}

module.exports = _PsychzDataCenterAdapter;
