const axios = require("axios");
const config = require("../../../config/apiConfig");

const createTicket = async (ticketData) => {
  // Extract relevant data from the input argument
  const { priority, shortDescription, description } = ticketData;

  try {
    const requestBody = {
      // Map data to the format required by the INAP API
      priority,
      shortDescription,
      description,
    };

    const response = await axios.post(
      `${config.inap.apiUrl}/support-cases`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${config.inap.apiToken}`,
        },
      }
    );

    // Handle the response based on the INAP API's specific codes and structure
    if (response.status === 200 || response.status === 201) {
      return response.data.id;
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error creating INAP ticket:`,
        error.response.data.message
      );

      if (error.response.status === 400) {
        // Handle specific 400 errors based on the message
        if (error.response.data.message === "shortDescription is required") {
          throw new Error("Error creating INAP ticket: Missing Ticket Subject");
        } else if (error.response.data.message === "description is required") {
          throw new Error("Error creating INAP ticket: Missing Ticket Body");
        } else {
          // Handle other 400 errors with a generic message
          throw new Error(
            `Failed to create INAP ticket: ${error.response.data.message}`
          );
        }
      } else if (error.response.status === 401) {
        console.error(
          "401 Unauthenticated Error for INAP, Response Message:",
          error.response.data.message
        );
        throw new Error(
          `401 Error Failed to create INAP ticket: ${error.response.data.message}`
        );
      } else if (error.response.status === 500) {
        console.error(
          "500 Internal Server Error for INAP, Response Message:",
          error.response.data.message
        );
        throw new Error(
          `500 Error Failed to create INAP ticket: ${error.response.data.message}`
        );
      } else {
        // Handle other unexpected errors
        throw new Error(`Failed to create INAP ticket: ${error.response}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error creating INAP ticket: No response received");
      throw new Error("Network Error: Could not create INAP ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating INAP ticket:", error);
      throw error;
    }
  }
};

module.exports = {
  createTicket,
};
