const DataCenterClient = require("../interfaces/datacenter-interface.js");
const axios = require("axios"); // Assuming you have axios installed for making HTTP requests
const fs = require("fs"); // Assuming you need fs for handling file attachments

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
  return allowedFileTypes.includes(attachment.mime);
}

class _VeliaDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const {
      subject,
      topic = "velianet-support",
      summary,
      message,
      files = [],
    } = data;

    if (files.length > 5) {
      throw new Error("Maximum limit of 5 files reached.");
    }

    try {
      const requestBody = {
        // Map data to the format required by the 100TB API
        subject,
        topic,
        summary,
        message,
        files: files.map((attachment) => {
          if (!isValidFileType(attachment)) {
            throw new Error(
              `Invalid attachment file type: ${
                attachment.mime
              }. Allowed types are: ${allowedFileTypes.join(", ")}`
            );
          }
          return `data:${attachment.mime};base64,${fs.readFileSync(
            attachment.path,
            "base64"
          )}`;
        }),
      };

      const response = await axios.post(`${this.baseUrl}/ticket`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${this.apiKey}`,
        },
      });

      // Handle the response based on the 100TB API's specific codes and structure
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

        if (error.response.status === 409) {
          // Handle specific 400 errors based on the message
          if (
            error.response.data.errors[0] ===
            "Subject can not be blank or longer than 200 characters."
          ) {
            throw new Error("Error: Missing Ticket Subject");
          } else if (error.response.data.errors[0] === "Topic not found.") {
            throw new Error("Error: Missing Ticket Topic");
          } else if (
            error.response.data.errors[0] ===
            "Message cannot be blank or longer than 100000 characters."
          ) {
            throw new Error("Error: Missing Ticket Message");
          } else {
            // Handle other 400 errors with a generic message
            throw new Error(`Failed to create ticket: ${error.response.data}`);
          }
        } else if (error.response.status === 401) {
          console.error("401 Unauthenticated Error");
          throw new Error(
            `Failed to create ticket: ${error.response.status} Unauthenticated error`
          );
        } else {
          // Handle other unexpected errors
          throw new Error(`Failed to create ticket: ${error.message}`);
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
      const response = await axios.get(`${this.baseUrl}/ticket/${ticketId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `${this.apiKey}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`Fetched Velia Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status || error.response.data.status} Error Creating ticket:`,
          error.response.data
        );

        if (error.response.status === 401 || error.response.data.status === 401) {
          console.error(
            `401 Unauthenticated Error ${error.response.status} Unauthenticated error`
          );
          throw new Error(
            `Failed to retrieve ticket: ${error.response.status} Unauthenticated error`
          );
        } else if (error.response.status === 404 || error.response.data.status === 404) {
          console.error(
            `${error.response.status || error.response.data.status} Error retrieving ticket:`,
            error.response.data
          );
          if (error.response.data.title) {
            throw new Error(`Error: Invalid Ticket ID Type`);
          } else if (error.response.data.error){
            throw new Error(`Ticket not found: ${ticketId}`);
          }
        } else {
          // Handle other unexpected errors
          throw new Error(`Failed to create ticket: ${error.message}`);
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

module.exports = _VeliaDataCenterAdapter;
