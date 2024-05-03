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

    try {
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

      // Handle the response based on the 100TB API's specific codes and structure
      if (response.status === 201 || response.status === 200) {
        console.log(`100TB ticket created ${response.data.data.id}`);
        return response.data.data;
      } else {
        if (response.data.status === 400 || response.status === 400) {
          // Handle specific 400 errors based on the message
          if (response.data.message === "Missing Ticket subject") {
            throw new Error("Error: Missing Ticket Subject");
          } else if (response.data.message === "Missing Ticket body") {
            throw new Error("Error: Missing Ticket Body");
          } else {
            // Handle other 400 errors generically
            console.error(`${response.status} Error Creating ticket:`, response.data.message);
            throw new Error(`${response.status} Failed to create ticket: ${response.data.message}`);
          }
        } else if (response.data.status === 401 || response.status === 401) {
          console.error("401 Unauthenticated Error, Response Message:", response.data.message);
          throw new Error(`401 Failed to create ticket: ${response.data.error.description}`);
        } else {
          console.error(`${response.status} Error Creating ticket:`, response.data.message);
          throw new Error(`${response.status} Failed to create ticket: ${response.data.message}`);
        }
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error creating ticket:", error.message);
      throw error;
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
      } else {
        if (response.data.status === 400 || response.status === 400) {
          console.error("400 Ticket ID Type Invalid:", response.data.message)
          throw new Error(`400 Ticket ID Type Invalid: ${response.data.message}`);
        } else if (response.data.status === 401 || response.status === 401) {
          console.error("401 Unauthenticated Error, Response Message:", response.data.error.description);
          throw new Error(`401 Failed to retrieve ticket: ${response.data.error.description}`);
        } else if (response.data.status === 404 || response.status === 404) {
          console.error(`${response.data.status} Error retrieving ticket:`, response.data.message);
          throw new Error(`Ticket not found: ${ticketId}`); // Informative message for 404
        } else {
          console.error(`${response.data.status || response.status} Error retrieving ticket:`, response.data.message);
          throw new Error(`${response.data.status || response.status} Failed to retrieve ticket: ${response.data.message}`);
        }
      }
    } catch (error) {
      // Handle errors appropriately (e.g., log the error and re-throw)
      console.error("Error retrieving ticket:", error.message);
      throw error;
    }
  }
}

module.exports = _100TBDataCenterAdapter;
