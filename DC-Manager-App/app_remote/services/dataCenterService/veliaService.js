const axios = require("axios");
const config = require("../../../config/apiConfig");

const allowedFileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/csv",
  "text/plain",
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
    topic = "velianet-support",
    summary,
    message,
    attachments = [],
  } = ticketData;

  console.log("Attachments length:", attachments.length);

  if (attachments.length > 5) {
    throw new Error("Maximum limit of 5 files reached.");
  }

  try {
    const requestBody = {
      // Map data to the format required by the 100TB API
      // Allowed extensions are .jpeg, .jpg, .png, .gif, .pdf, .csv, .txt, .log. Maximum files 5, by 14.3MB
      subject,
      topic,
      summary,
      message,
      files: attachments.map((attachment) => {
        if (!isValidFileType(attachment)) {
          throw new Error(
            `Invalid attachment file type: ${
              attachment.mimetype
            }. Allowed types are: ${allowedFileTypes.join(", ")}`
          );
        }
        return `data:${attachment.mimetype};base64,${attachment.buffer.toString("base64")}`;
      }),
    };

    console.log("Attachment details in requestBody:", requestBody.files);

    const response = await axios.post(`${config.velia.apiUrl}/ticket`, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `${config.velia.apiToken}`,
      },
    });

    // Handle the response based on the 100TB API's specific codes and structure
    if (response.status === 200 || response.status === 201) {
      return response.data.id;
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error creating Velia ticket:`,
        error.response.data
      );

      if (error.response.status === 409) {
        // Handle specific 400 errors based on the message
        if (
          error.response.data.errors[0] ===
          "Subject can not be blank or longer than 200 characters."
        ) {
          throw new Error("Error creating Velia ticket: Missing Ticket Subject");
        } else if (error.response.data.errors[0] === "Topic not found.") {
          throw new Error("Error creating Velia ticket: Missing Ticket Topic");
        } else if (
          error.response.data.errors[0] ===
          "Message cannot be blank or longer than 100000 characters."
        ) {
          throw new Error("Error creating Velia ticket: Missing Ticket Message");
        } else {
          throw new Error(`Failed to create Velia ticket: ${error.response.data.errors.join(", ")}`);
        }
      } else if (error.response.status === 401) {
        console.error("401 Unauthenticated Error for Velia");
        throw new Error(
          `Failed to create Velia ticket: ${error.response.status} Unauthenticated error`
        );
      } else {
        // Handle other unexpected errors
        throw new Error(`Failed to create Velia ticket: ${error.message}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error creating Velia ticket: No response received");
      throw new Error("Network Error: Could not create Velia ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating Velia ticket:", error);
      throw error;
    }
  }
};

module.exports = {
  createTicket,
};
