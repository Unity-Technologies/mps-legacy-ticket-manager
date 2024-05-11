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
        { query: mutation, variables: variables },
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
        if (response.data.data.createSupportRequest) {
          console.log(response);
          return response.data;
        } else {
          console.error(`Error: ${response.data.errors[0].message}`);
          throw new Error(`Error: ${response.data.errors[0].message}`);
        }
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Creating ticket:`,
          error.response.data.errors[0].message
        );

        if (error.response.status === 400) {
          // Handle specific 400 errors based on the message
          if (error.response.data.errors[0].message.includes("input.message")) {
            throw new Error("Error: Invalid Ticket Message");
          } else if (
            error.response.data.errors[0].message.includes("input.priority")
          ) {
            throw new Error("Error: Invalid Ticket Priority");
          } else if (
            error.response.data.errors[0].message.includes("input.subject")
          ) {
            throw new Error("Error: Invalid Ticket Subject");
          } else {
            // Handle other 400 errors with a generic message
            throw new Error(
              `Failed to create ticket: ${error.response.data.errors[0].message}`
            );
          }
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
          query: query,
          variables: variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        if (response.data.data != null) {
          console.log(`Fetched Datapacket Ticket #${ticketId}:`, response.data);
          // console.log(response.data.data.supportRequest.posts);
          return response.data.data;
        } else {
          console.error(`Error: ${response.data.errors[0].message}`);
          throw new Error(`Error: ${response.data.errors[0].message}`);
        }
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Creating ticket:`,
          error.response.data.errors[0].message
        );

        if (error.response.status === 400) {
          // Handle specific 400 errors based on the message
          if (error.response.data.errors[0].message.includes('invalid value null at "input.id"')) {
            throw new Error("Error: Ticket ID is null");
          } else if (
            error.response.data.errors[0].message.includes("Int cannot represent non-integer value")
          ) {
            throw new Error("Error: Ticket ID is a non-integer value");
          } else if (
            error.response.data.errors[0].message.includes('Field "id" of required type "Int!" was not provided')
          ) {
            throw new Error("Error: Ticket ID is empty");
          } else {
            // Handle other 400 errors with a generic message
            throw new Error(
              `Failed to retrieve ticket: ${error.response.data.errors[0].message}`
            );
          }
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

module.exports = _DatapacketDataCenterAdapter;
