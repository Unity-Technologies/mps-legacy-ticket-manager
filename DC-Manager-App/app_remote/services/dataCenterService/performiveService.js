const axios = require("axios");
const config = require("../../../config/apiConfig");

const createTicket = async (ticketData) => {
  // Extract relevant data from the input argument
  const { group = "Support", subject, body } = ticketData;

  try {
    const requestBody = {
      // Map data to the format required by the Performive API
      group,
      subject,
      body,
    };

    const response = await axios.post(
      `${config.performive.apiUrl}/tickets`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Auth-Token": `${config.performive.apiToken}`,
        },
      }
    );

    // Handle the response based on the Performive API's specific codes and structure
    if (response.status === 200 || response.status === 201) {
      return response.data.payload.id;
    }
  } catch (error) {
    if (error.response) {
      console.error(
        `${error.response.status} Error creating Performive ticket:`,
        error.response.data.message
      );

      if (error.response.status === 400) {
        console.error(
          `400 Error creating Performive ticket:`,
          error.response.data.reason
        );
        throw new Error(`Error: ${error.response.data.reason}`);
      } else if (error.response.status === 401) {
        console.error(
          "401 Unauthenticated Error for Performive, Response Message:",
          error.response.data.message
        );
        throw new Error(
          `401 Unauthorized Error for Performive: ${response.data.reason}`
        );
      } else {
        // Handle other unexpected errors
        throw new Error(`Failed to create Performive ticket: ${error.message}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error creating Performive ticket: No response received");
      throw new Error("Network Error: Could not create Performive ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating Performive ticket:", error);
      throw error;
    }
  }
};

module.exports = {
  createTicket,
};
