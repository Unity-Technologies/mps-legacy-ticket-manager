const axios = require("axios");
const config = require("../../../config/apiConfig");

const createTicket = async (ticketData) => {
  // Extract relevant data from the input argument
  const { message, subject = "HARDWARE_OTHER", priority } = ticketData;

  const mutation = `mutation CreateSupportRequest($input: CreateSupportRequestInput!) {
        createSupportRequest(input: $input)
    }`;

  try {
    const variables = {
      // Map data to the format required by the Datapacket API
      input: { message, subject, priority },
    };

    const response = await axios.post(
      `${config.datapacket.apiUrl}`,
      { query: mutation, variables: variables },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${config.datapacket.apiToken}`,
        },
      }
    );

    // Handle the response based on the Datapacket API's specific codes and structure
    if (response.status === 200 || response.status === 201) {
      if (response.data.data.createSupportRequest) {
        return response.data;
      }
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error creating DataPacket ticket:`,
        error.response.data.errors[0].message
      );

      if (error.response.status === 400) {
        // Handle specific 400 errors based on the message
        if (error.response.data.errors[0].message.includes("input.message")) {
          throw new Error(
            "Error creating DataPacket ticket: Invalid Ticket Message"
          );
        } else if (
          error.response.data.errors[0].message.includes("input.priority")
        ) {
          throw new Error(
            "Error creating DataPacket ticket: Invalid Ticket Priority"
          );
        } else if (
          error.response.data.errors[0].message.includes("input.subject")
        ) {
          throw new Error(
            "Error creating DataPacket ticket: Invalid Ticket Subject"
          );
        } else {
          // Handle other 400 errors with a generic message
          throw new Error(
            `Failed to create DataPacket ticket: ${error.response.data.errors[0].message}`
          );
        }
      } else {
        // Handle other unexpected errors
        throw new Error(
          `Failed to create DataPacket ticket: ${error.response}`
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error creating DataPacket ticket: No response received");
      throw new Error("Network Error: Could not create DataPacket ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating DataPacket ticket:", error);
      throw error;
    }
  }
};

const getTickets = async (pageIndex, pageSize) => {
  const query = `query SupportRequests($input: PaginatedSupportRequestsInput) {
    supportRequests(input: $input) {
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
      pageIndex: pageIndex,
      pageSize: pageSize,
    },
  };

  try {
    const response = await axios.post(
      `${config.datapacket.apiUrl}`,
      {
        query: query,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.datapacket.apiToken}`,
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      if (response.data.data != null) {
        return response.data.data.supportRequests;
      } else {
        console.error(`Error retrieving DataPacket ticket: ${response.data.errors[0].message}`);
        throw new Error(`Error retrieving DataPacket ticket: ${response.data.errors[0].message}`);
      }
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error retrieving DataPacket ticket:`,
        error.response.data.errors[0].message
      );

      if (error.response.status === 400) {
        // Handle specific 400 errors based on the message
        if (
          error.response.data.errors[0].message.includes(
            "invalid value null at \"input.id\""
          )
        ) {
          throw new Error("Error retrieving DataPacket ticket: Ticket ID is null");
        } else if (
          error.response.data.errors[0].message.includes(
            "Int cannot represent non-integer value"
          )
        ) {
          throw new Error("Error retrieving DataPacket ticket: Ticket ID is a non-integer value");
        } else if (
          error.response.data.errors[0].message.includes(
            "Field \"id\" of required type \"Int!\" was not provided"
          )
        ) {
          throw new Error("Error retrieving DataPacket ticket: Ticket ID is empty");
        } else {
          // Handle other 400 errors with a generic message
          throw new Error(
            `Failed to retrieve DataPacket ticket: ${error.response.data.errors[0].message}`
          );
        }
      } else {
        // Handle other unexpected errors
        throw new Error(`Failed to retrieve DataPacket ticket: ${error.response}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error retrieving DataPacket ticket: No response received");
      throw new Error("Network Error: Could not retrieve DataPacket ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error retrieving DataPacket ticket:", error);
      throw error;
    }
  }
};

module.exports = {
  createTicket,
  getTickets,
};
