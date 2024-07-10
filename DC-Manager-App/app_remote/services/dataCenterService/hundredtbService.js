const axios = require("axios");
const config = require("../../../config/apiConfig");

const allowedFileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/gif",
  "text/csv",
  "text/plain",
  "video/3gpp",
  "video/3gpp2",
  "video/h261",
  "video/h263",
  "video/h264",
  "video/jpeg",
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "application/pdf",
  "application/x-pdf",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function isValidFileType(attachment) {
  return allowedFileTypes.includes(attachment.mimetype);
}

const createTicket = async (ticketData) => {
  if (ticketData.attachments === "") {
    ticketData.attachments = [];
  }

  const {
    subject,
    body,
    department = 10,
    priority = 1,
    attachments = [],
  } = ticketData;

  console.log("Attachments length:", attachments.length);

  if (attachments.length > 2) {
    throw new Error("Maximum 2 attachments allowed per ticket.");
  }

  const requestBody = {
    // Map data to the format required by the 100TB API
    subject,
    body,
    department,
    priority,
    attachments: attachments.map((attachment) => {
      if (!isValidFileType(attachment)) {
        throw new Error(
          `Invalid attachment file type: ${
            attachment.mimetype
          }. Allowed types are: ${allowedFileTypes.join(", ")}`
        );
      }
      return {
        // Adapt attachment data to the format expected by the 100TB API
        mime: attachment.mimetype,
        name: attachment.originalname,
        file: attachment.buffer.toString('base64'),
      };
    }),
  };

  console.log("Attachment details in requestBody:", requestBody.attachments);

  try {
    const response = await axios.post(
      `${config.hundredtb.apiUrl}/tickets`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Token": `${config.hundredtb.apiToken}`,
        },
      }
    );
    if (response.status === 200 || response.status === 201) {
      return response.data.data.id;
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error creating 100TB ticket:`,
        error.response.data
      );

      if (error.response.status === 400) {
        // Handle specific 400 errors based on the message
        if (error.response.data.message === "Missing Ticket subject") {
          throw new Error("Error creating 100TB ticket: Missing Ticket Subject");
        } else if (error.response.data.message === "Missing Ticket body") {
          throw new Error("Error creating 100TB ticket: Missing Ticket Body");
        } else {
          // Handle other 400 errors with a generic message
          throw new Error(
            `Failed to create 100TB ticket: ${error.response.data.message}`
          );
        }
      } else if (error.response.status === 401) {
        console.error(
          "401 Unauthenticated Error for 100TB, Response Message:",
          error.response.data
        );
        throw new Error(
          `Failed to create 100TB ticket: ${error.response.data.error.description}`
        );
      } else {
        // Handle other unexpected errors
        throw new Error(`Failed to create 100TB ticket: ${error.response.message}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error creating 100TB ticket: No response received");
      throw new Error("Network Error: Could not create 100TB ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating 100TB ticket:", error);
      throw error;
    }
  }
};

module.exports = {
  createTicket,
};
