const axios = require("axios");
const config = require("../../../config/apiConfig");

const allowedFileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/gif",
  "text/plain",
  "application/pdf",
  "application/x-pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const createTicket = async (ticketData) => {
  if (ticketData.attachmentIds === "") {
    ticketData.attachmentIds = [];
  }

  const {
    title,
    content,
    department = "Service Desk",
    category = "Bare-metal",
    attachmentIds = [],
  } = ticketData;

  try {
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      ticketData.attachments.forEach((element) => {
        attachFile(element.buffer).then((response) => {
          attachmentIds.push(response);
          console.log("Attachments I3D:", attachmentIds);
        });
      });
    }

    const requestBody = {
      // Map data to the format required by the 100TB API
      // Only the following file types are supported: .png, .jpeg, .jpg, .gif, .pdf, .doc(x), .xls(x), .rtf and .txt.
      title,
      content,
      category,
      department,
      attachmentIds,
    };

    const response = await axios.post(
      `${config.i3d.apiUrl}/tickets`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "PRIVATE-TOKEN": `${config.i3d.apiToken}`,
        },
      }
    );

    // Handle the response based on the 100TB API's specific codes and structure
    if (response.status === 200 || response.status === 201) {
      return `${response.data.id}-${response.data.hash}`;
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error creating I3D ticket:`,
        error.response.data.message
      );

      if (error.response.status === 401) {
        console.error(
          "401 Unauthenticated Error for I3D, Response Message:",
          error.response.data.message
        );
        throw new Error(`Error: ${error.response.data.message}`);
      } else if (error.response.status === 422) {
        if (error.response.data.errors[0].property === "title") {
          console.error(
            "422 Unprocessable Entity for I3D: Subject is required"
          );
          throw new Error(
            `Error: ${error.response.data.errors[0].property} ${error.response.data.errors[0].message}`
          );
        } else if (error.response.data.errors[0].property === "content") {
          console.error("422 Unprocessable Entity for I3D: Body is required");
          throw new Error(
            `Error: ${error.response.data.errors[0].property} ${error.response.data.errors[0].message}`
          );
        }
        console.error(
          "422 Unprocessable Entity for I3D, Response Message:",
          `${error.response.data.errors[0].property} ${error.response.data.errors[0].message}`
        );
      } else {
        // Handle other unexpected errors
        throw new Error(`Failed to create I3D ticket: ${error.message}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error creating I3D ticket: No response received");
      throw new Error("Network Error: Could not create I3D ticket");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error creating I3D ticket:", error);
      throw error;
    }
  }
};

const attachFile = async (attachment) => {
  try {
    const response = await axios.post(
      `${config.i3d.apiUrl}/tickets/attachment`,
      attachment,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "PRIVATE-TOKEN": `${config.i3d.apiToken}`,
        },
      }
    );

    // Handle the response based on the 100TB API's specific codes and structure
    if (response.status === 200 || response.status === 201) {
      return response;
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls outside the validated range
      console.error(
        `${error.response.status} Error uploading I3D attachment:`,
        error.response.data.errorMessage
      );

      if (error.response.status === 400) {
        console.error(
          "400 Bad request Error for I3D, Response Message:",
          error.response.data.errorMessage
        );
        throw new Error(`Error: ${error.response.data.errorMessage}`);
      } else if (error.response.status === 401) {
        console.error(
          "401 Unauthenticated Error for I3D, Response Message:",
          error.response.data.message
        );
        throw new Error(`Error: ${error.response.data.message}`);
      } else {
        // Handle other unexpected errors
        console.log(error.response);
        throw new Error(`Failed to upload attachment: ${error.response}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        "I3D Error uploadiing attachment I3D: No response received"
      );
      throw new Error("I3D Network Error: Could not upload attachment");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("I3D Error uploadiing attachment I3D:", error);
      throw error;
    }
  }
};

module.exports = {
  createTicket,
  attachFile,
};
