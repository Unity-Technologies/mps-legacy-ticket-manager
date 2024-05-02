const { query } = require("express");
const DataCenterClient = require("../interfaces/datacenter-interface.js");
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests

class _DatapacketDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const { message, subject = "HARDWARE_OTHER", priority } = data;

    const mutation = `mutation CreateSupportRequest($input: CreateSupportRequestInput!) {
        createSupportRequest(input: $input)
    }`;

    try {
      const variables = {
        // Map data to the format required by the Datapacket API
        input: { message, subject, priority },
      };

      const response = await axios.post(
        `${this.baseUrl}`,
        { query: mutation, variables },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      // Handle the response based on the Datapacket API's specific codes and structure
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
          `${response.status} Error creating Datapacket ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to create Datapacket ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error creating Datapacket ticket:", error.message);
      throw error;
    }
  }

  async getTicket(ticketId) {
    const query = `query SupportRequest($input: SupportRequestInput!) {
        supportRequest(input: $input) {
            id
            subject
            status
            createdAt
            updatedAt
            numberOfReplies
            lastReplyAt
            fullName
            email
            category
            posts {
                id
                contents
                createdAt
                email
                fullName
                postBy
            }
        }
    }`;

    const variables = {
      input: {
        id: ticketId,
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}`,
        {
          query,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched Datapacket Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
        console.log(response.data.data.supportRequest.posts)
        return response.data;
      } else if (response.status === 401) {
        console.error(
          "401 Unauthenticated Error, Response Message:",
          response.data.message
        );
      } else {
        // Handle errors based on the response status code and message
        console.error(
          `${response.status} Error retrieving Datapacket ticket:`,
          response.data.message
        );
        throw new Error(
          `${response.status} Failed to retrieve Datapacket ticket: ${response.data.message}`
        );
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error retrieving Datapacket ticket:", error.message);
      throw error;
    }
  }
}

module.exports = _DatapacketDataCenterAdapter;
