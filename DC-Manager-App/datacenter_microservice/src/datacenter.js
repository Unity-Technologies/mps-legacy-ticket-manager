require("dotenv").config({ path: "../../.env" });
const axios = require("axios");
const fs = require("fs");
const _100TBDataCenterAdapter = require("./datacenter_adapters/hundredtb-datacenter-adapter.js");
const _i3dDataCenterAdapter = require("./datacenter_adapters/i3d-datacenter-adapter.js");
const _VeliaDataCenterAdapter = require("./datacenter_adapters/velia-datacenter-adapter.js");
const _PerformiveDataCenterAdapter = require("./datacenter_adapters/performive-datacenter-adapter.js");
const _InapDataCenterAdapter = require("./datacenter_adapters/inap-datacenter-adapter.js");
const _DatapacketDataCenterAdapter = require("./datacenter_adapters/datapacket-datacenter-adapter.js");
const _PsychzDataCenterAdapter = require("./datacenter_adapters/psychz-datacenter-adapter.js");

const apiKey = process.env.HUNDREDTB_API_KEY;

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

async function createTicket(
  subject,
  body,
  department = 10,
  priority = 1,
  attachments = []
) {
  if (attachments.length > 2) {
    throw new Error("Maximum 2 attachments allowed per ticket.");
  }

  const requestBody = {
    subject: subject,
    body: body,
    department: department,
    priority: priority,
    attachments: attachments.map((attachment) => {
      if (!isValidFileType(attachment)) {
        throw new Error(
          `Invalid attachment file type: ${
            attachment.mime
          }. Allowed types are: ${allowedFileTypes.join(", ")}`
        );
      }
      return {
        mime: attachment.mime,
        name: attachment.name,
        file: fs.readFileSync(attachment.path, "base64"),
      };
    }),
  };

  console.log(requestBody);

  // Make the Axios POST request to create a new ticket
  const response = await axios.post(
    "https://api.ingenuitycloudservices.com/rest-api/tickets",
    requestBody,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Token": `${apiKey}`,
      },
    }
  );

  console.log(response.status);
  console.log(response.data);

  if (response.status === 200 || response.status === 201) {
    // Ticket creation successful
    return response.data; // Return the response data (might contain ticket details)
  } else if (response.status === 401) {
    console.error(
      "401 Unauthenticated Error, Response Message:",
      response.data.message
    );
  } else if (response.status === 413) {
    console.error(
      "413 Request Entity Too Large, Response Message:",
      response.data.message
    );
    throw new Error(
      "Attachment size exceeds the allowed limit. Please reduce the file size and try again."
    );
  } else {
    // Handle error - log the error message and potentially throw an exception
    console.error(
      `${response.status} Error creating ticket:`,
      response.data.message
    );
    throw new Error("Failed to create ticket");
  }
}

// Test Case 1: Valid Ticket Creation
// const response1 = createTicket('Test Ticket', 'This is a test ticket body.');
// console.log(response1);  // This should be similar to your mockApiResponse

// Test Case 2: Empty Subject (expected error)
// const response2 = createTicket('', 'This is a test ticket body.');
// console.log(response2);  // This might log an error message or throw an exception

// // Test Case 3: Long Subject and Body
// const response3 = createTicket('This is a very long subject...', 'This is a very long ticket body...',);  // Include full text for subject and body
// console.log(response3);  // This should be similar to your mockApiResponse (assuming function handles long text)

const mockAttachment1 = {
  mime: "image/png",
  name: "test_image.png",
  path: "C:\\Users\\juliantitusglover\\repos\\DC-Ticket-Manager-App\\DC-Manager-App\\assets\\logo.png",
}; // Your mock attachment object

const mockAttachment2 = {
  mime: "application/pdf",
  name: "test_file.pdf",
  path: "C:\\Users\\juliantitusglover\\Downloads\\Mastering GUI Programming with Python_ Develop impressive -- Alan D. Moore -- 2019 -- Packt Publishing -- 9781789612905 -- da31eb8d5c1afcdaafebffdd245898b9 -- Anna’s Archive.pdf",
};

// // const response = createTicket('Test Ticket', 'Test ticket with Attachment', 10, 1, [mockAttachment1]);
// // console.log(response);  // Should be similar to mockApiResponse

// const response = createTicket(
//   "Test Ticket with Large Attachment",
//   "Body with Attachment",
//   undefined,
//   undefined,
//   [mockAttachment2]
// );

// console.log(response); // Observe the output for successful or error messages

// 100TB Testing --------------------

// const hundredtbConfig = {
//   baseUrl: "https://api.ingenuitycloudservices.com/rest-api", // Replace with your actual API endpoint
//   apiKey: `${process.env.HUNDREDTB_API_KEY}`, // Replace with your actual API key
// };

// const hundredtbAdapter = new _100TBDataCenterAdapter(hundredtbConfig);

// const ticketData = {
//   subject: "Test Ticket with Attachment",
//   body: "Body with Attachment",
//   department: undefined,
//   priority: undefined,
//   attachments: [mockAttachment1],
// };

// try {
//   hundredtbAdapter.createTicket(ticketData);
// //   console.log("Ticket created successfully:", createdTicket);
// } catch (error) {
//   console.error("Error creating ticket:", error.message);
// }

// const ticketId = 36663365; // Replace with the actual ticket ID

// try {
//   hundredtbAdapter.getTicket(ticketId);
// //   console.log("Fetched ticket details:", retrievedTicket);
// } catch (error) {
//   console.error("Error retrieving ticket:", error.message);
// }


// I3D Testing --------------------

// const i3dConfig = {
//     baseUrl: "https://api.i3d.net/v3", // Replace with your actual API endpoint
//     apiKey: `${process.env.I3D_API_KEY}`, // Replace with your actual API key
//   };

// const i3dAdapter = new _i3dDataCenterAdapter(i3dConfig);

// const ticketData = {
//   title: "Test Ticket",
//   content: "Test Body",
//   department: undefined,
//   category: undefined,
//   attachmentIds: undefined,
// };

// try {
//   i3dAdapter.createTicket(ticketData);
//   //   console.log("Ticket created successfully:", createdTicket);
// } catch (error) {
//   console.error("Error creating ticket:", error.message);
// }

// const ticketId = 1930181; // Replace with the actual ticket ID

// try {
//   i3dAdapter.getTicket(ticketId);
//   //   console.log("Fetched ticket details:", retrievedTicket);
// } catch (error) {
//   console.error("Error retrieving ticket:", error.message);
// }

// Velia Tesing --------------------

// const veliaConfig = {
//     baseUrl: "https://www.velia.net/api/v1", // Replace with your actual API endpoint
//     apiKey: `${process.env.VELIA_API_KEY}`, // Replace with your actual API key
//   };

// const veliaAdapter = new _VeliaDataCenterAdapter(veliaConfig);

// const ticketData = {
//   subject: "Test Ticket with Attachment",
//   topic: undefined,
//   summary: "Test ticket Summary",
//   message: "Test ticket body",
//   files: [`data:image/png;base64,${fs.readFileSync(mockAttachment1.path, "base64")}`],
// };

// console.log(ticketData.files);

// try {
//     veliaAdapter.createTicket(ticketData);
//   //   console.log("Ticket created successfully:", createdTicket);
// } catch (error) {
//   console.error("Error creating ticket:", error.message);
// }

// const ticketId = 471075; // Replace with the actual ticket ID

// try {
//     veliaAdapter.getTicket(ticketId);
//   //   console.log("Fetched ticket details:", retrievedTicket);
// } catch (error) {
//   console.error("Error retrieving ticket:", error.message);
// }

// Performive Tesing --------------------

// const performiveConfig = {
//     baseUrl: "https://api.performive.com/api/v1", // Replace with your actual API endpoint
//     apiKey: `${process.env.PERFORMIVE_API_KEY}`, // Replace with your actual API key
//   };

// const performiveAdapter = new _PerformiveDataCenterAdapter(performiveConfig);

// const ticketData = {
//   group: undefined,
//   subject: "Test ticket subject",
//   body: "This is an API test. Please close this ticket.",
// };

// try {
//     performiveAdapter.createTicket(ticketData);
//   //   console.log("Ticket created successfully:", createdTicket);
// } catch (error) {
//   console.error("Error creating ticket:", error.message);
// }

// const ticketId = 618192; // Replace with the actual ticket ID

// try {
//     performiveAdapter.getTicket(ticketId);
//   //   console.log("Fetched ticket details:", retrievedTicket);
// } catch (error) {
//   console.error("Error retrieving ticket:", error.message);
// }

// INAP Tesing --------------------

const inapConfig = {
    baseUrl: "https://api.compass.horizoniq.com/v1", // Replace with your actual API endpoint
    apiKey: `${process.env.INAP_API_KEY}`, // Replace with your actual API key
  };

const inapAdapter = new _InapDataCenterAdapter(inapConfig);

const ticketData = {
  priority: "Low",
  shortDescription: "Test Ticket with Attachment",
  description: "Test ticket body",
};

try {
    inapAdapter.createTicket(ticketData);
  //   console.log("Ticket created successfully:", createdTicket);
} catch (error) {
  console.error("Error creating ticket:", error.message);
}

const ticketId = "CASE01262228"; // Replace with the actual ticket ID

try {
    inapAdapter.getTicket(ticketId);
  //   console.log("Fetched ticket details:", retrievedTicket);
} catch (error) {
  console.error("Error retrieving ticket:", error.message);
}

// DataPacket Tesing --------------------

// const datapacketConfig = {
//     baseUrl: "https://api.datapacket.com/v0/graphql", // Replace with your actual API endpoint
//     apiKey: `${process.env.DATAPACKET_API_KEY}`, // Replace with your actual API key
//   };

// const datapacketAdapter = new _DatapacketDataCenterAdapter(datapacketConfig);

// const ticketData = {
//   subject: undefined,
//   priority: "NORMAL",
//   message: "Test ticket body. Please close this ticket",
// };

// try {
//     datapacketAdapter.createTicket(ticketData);
//   //   console.log("Ticket created successfully:", createdTicket);
// } catch (error) {
//   console.error("Error creating ticket:", error.message);
// }

// const ticketId = 5055867; // Replace with the actual ticket ID

// try {
//     datapacketAdapter.getTicket(ticketId);
//   //   console.log("Fetched ticket details:", retrievedTicket);
// } catch (error) {
//   console.error("Error retrieving ticket:", error.message);
// }

// Psychz Tesing --------------------

// const psychzConfig = {
//     baseUrl: "https://api.psychz.net/v1", // Replace with your actual API endpoint
//     apiKey: `${process.env.PSYCHZ_ACCESS_TOKEN}`, // Replace with your actual API key
//   };

// const psychzAdapter = new _PsychzDataCenterAdapter(psychzConfig);

// const ticketData = {
//   subject: "Test Ticket with Attachment",
//   department_id: undefined,
//   priority: undefined,
//   message: "Test ticket body",
//   attach: `${fs.readFileSync(mockAttachment1.path, "base64")};type=image/png`,
// };

// console.log(ticketData.files);

// try {
//     psychzAdapter.createTicket(ticketData);
//   //   console.log("Ticket created successfully:", createdTicket);
// } catch (error) {
//   console.error("Error creating ticket:", error.message);
// }

// const ticketId = 4311829; // Replace with the actual ticket ID

// try {
//     psychzAdapter.getTicket(ticketId);
//   //   console.log("Fetched ticket details:", retrievedTicket);
// } catch (error) {
//   console.error("Error retrieving ticket:", error.message);
// }

// Both create and get ticket functions working

// 100TB
// Velia
// Datapacket
// i3D
// Performive
// Psychz: attachment issue

// Inap: Get ticket working but create ticket not working
