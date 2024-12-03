const axios = require("axios");
const config = require("../../../config/apiConfig");

const createTicket = async (ticketData) => {
  if (ticketData.service_id === "") {
    ticketData.service_id = "0";
  }

  const {
    department_id = "2",
    subject,
    message,
    priority = "0",
    service_id = "0",
  } = ticketData;

  let base64_file;
  let base64_file_name;
  if (ticketData.attachments && ticketData.attachments.length > 0) {
    ticketData.attachments.map((attachment) => {
      base64_file_name = attachment.originalname;
      base64_file = attachment.buffer.toString("base64");
    });
  }

  try {
    const requestBody = {
      // Map data to the format required by the Psychz API
      // Allowed File Extensions: jpg, gif, jpeg, png, doc, pdf, txt, vcf, tiff, jpg, xls, xlsx. Max Size Limit - 8 MB
      access_token: `${config.psychz.apiToken}`,
      access_username: `${config.psychz.apiUsername}`,
      department_id,
      subject,
      message,
      priority,
      service_id,
      base64_file_name,
      base64_file,
    };

    const response = await axios.post(
      `${config.psychz.apiUrl}/ticket_create`,
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
      return response.data.data.ticket_id;
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error creating Psychz ticket:`,
        error.response.data
      );

      if (error.response.status === 400) {
        // Handle specific 400 errors based on the message
        if (error.response.data.error.errors[0].field === "subject") {
          throw new Error(
            "Error creating Psychz ticket: Missing Ticket Subject"
          );
        } else if (
          error.response.data.error.errors[0].field === "department_id"
        ) {
          throw new Error(
            "Error creating Psychz ticket: Missing Ticket department_id"
          );
        } else if (error.response.data.error.errors[0].field === "message") {
          throw new Error(
            "Error creating Psychz ticket: Missing Ticket message"
          );
        } else {
          // Handle other 400 errors with a generic message
          throw new Error(
            `Failed to create Psychz ticket: ${error.response.data.error}`
          );
        }
      } else if (error.response.status === 401) {
        console.error(
          "401 Unauthenticated Error for Psychz, Response Message:",
          error.response.data.error.errors[0].description
        );
        throw new Error(
          `Failed to create Psychz ticket: ${error.response.data.error.errors[0].description}`
        );
      } else {
        // Handle other unexpected errors
        throw new Error(`Failed to create Psychz ticket: ${error.response}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error creating Psychz ticket: No response received");
      throw new Error("Network Error: Could not create Psychz ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating Psychz ticket:", error);
      throw error;
    }
  }
};

module.exports = {
  createTicket,
};
