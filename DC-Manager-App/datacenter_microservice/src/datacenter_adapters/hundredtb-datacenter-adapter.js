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

class _100TBDataCenterAdapter extends DataCenterClient {
  constructor(config) {
    super(config.baseUrl, config.apiKey); // Call base class constructor
  }

  async createTicket(data) {
    // Extract relevant data from the input argument
    const {
      subject,
      body,
      department = 10,
      priority = 1,
      attachments = [],
    } = data;

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
              attachment.mime
            }. Allowed types are: ${allowedFileTypes.join(", ")}`
          );
        }
        return {
          // Adapt attachment data to the format expected by the 100TB API
          mime: attachment.mime,
          name: attachment.name,
          file: fs.readFileSync(attachment.path, "base64"),
        };
      }),
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/tickets`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Api-Token": `${this.apiKey}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        console.log(`100TB ticket created ${response.data.data.id}`);
        return response.data.data;
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Creating ticket:`,
          error.response.data.message
        );

        if (error.response.status === 400) {
          // Handle specific 400 errors based on the message
          if (error.response.data.message === "Missing Ticket subject") {
            throw new Error("Error: Missing Ticket Subject");
          } else if (error.response.data.message === "Missing Ticket body") {
            throw new Error("Error: Missing Ticket Body");
          } else {
            // Handle other 400 errors with a generic message
            throw new Error(
              `Failed to create ticket: ${error.response.data.message}`
            );
          }
        } else if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `Failed to create ticket: ${error.response.data.error.description}`
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
      const response = await axios.get(`${this.baseUrl}/tickets/${ticketId}`, {
        headers: {
          Accept: "application/json",
          "X-Api-Token": `${this.apiKey}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        console.log(`Fetched 100TB Ticket #${ticketId}:`, response.data);
        // Ticket Retrieval successful
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the validated range
        console.error(
          `${error.response.status} Error Creating ticket:`,
          error.response.data.message
        );

        if (error.response.status === 400) {
          // Handle specific 400 errors based on the message
          console.error(
            "400 Ticket ID Type Invalid:",
            error.response.data.message
          );
          throw new Error(
            `400 Ticket ID Type Invalid: ${error.response.data.message}`
          );
        } else if (error.response.status === 401) {
          console.error(
            "401 Unauthenticated Error, Response Message:",
            error.response.data.message
          );
          throw new Error(
            `401 Failed to retrieve ticket: ${error.response.data.error.description}`
          );
        } else if (
          error.response.data.status === 404 ||
          error.response.status === 404
        ) {
          console.error(
            `${error.response.data.status} Error retrieving ticket:`,
            error.response.data.message
          );
          throw new Error(`Ticket not found: ${ticketId}`); // Informative message for 404
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

module.exports = _100TBDataCenterAdapter;
