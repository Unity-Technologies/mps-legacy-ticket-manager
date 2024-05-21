const _PsychzDataCenterAdapter = require("../datacenter_adapters/psychz-datacenter-adapter.js");
const {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectResponse,
  createTicketInvalidAttachmentSizeResponse,
  createTicketInvalidDepartmentIdResponse,
  createTicketInvalidMessageResponse,
  createTicketInvalidNumberOfAttachmentsResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdTypeResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
  invalidAccessUsername,
} = require("./test-data/psychz-response.js");
const axios = require("axios");

const psychzConfig = {
  baseUrl: "http://localhost", // Replace with a mock URL for testing
  apiKey: "mock-api-key", // Replace with a mock API key for testing
  access_username: "fake-username",
};

const adapter = new _PsychzDataCenterAdapter(psychzConfig, psychzConfig.access_username);

jest.mock("axios");

describe("Create Psychz Ticket", () => {
  // Test Successful Ticket Creation
  test("creates a ticket with valid data (mocked success)", async () => {
    const ticketData = {
      subject: "Test Ticket",
      department_id: "2",
      priority: "0",
      message: "Test ticket body, please close this ticket",
      service_id: "0",
      attach: null,
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({
      status: true,
      data: { status: true, ticket_id: "4327900" },
    }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      `${psychzConfig.baseUrl}/ticket_create`,
      // Validate request body structure
      expect.objectContaining({
        subject: ticketData.subject,
        department_id: ticketData.department_id,
        priority: ticketData.priority,
        message: ticketData.message,
        service_id: ticketData.service_id,
        attach: null, // Assuming no attachments in this test case
      }),
      {
        headers: {
          // Validate headers including X-Api-Token
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
  });

//   test("creates a ticket with valid attachments (mocked success)", async () => {
//     const mockAttachment1 = {
//       mime: "image/png",
//       path: "C:\\Users\\juliantitusglover\\repos\\DC-Ticket-Manager-App\\DC-Manager-App\\assets\\logo.png",
//     };

//     const ticketData = {
//       subject: "Test Ticket with Attachment",
//       topic: "velianet-support",
//       message: "Test ticket body",
//       files: [mockAttachment1, mockAttachment1],
//     };

//     axios.post.mockResolvedValueOnce(createTicketValidResponse);

//     const createdTicket = await adapter.createTicket(ticketData);

//     expect(createdTicket).toEqual({
//       id: 473809,
//       queue: "velianet-support",
//       status: "new",
//       subject: "Test Ticket",
//       priority: 20,
//       requestors: [],
//       cc: [],
//       created: "2024-05-06T13:29:32+00:00",
//       due: null,
//       resolved: null,
//       updated: "2024-05-06T13:29:33+00:00",
//       server: null,
//     }); // Assert the returned ticket data
//     expect(axios.post).toHaveBeenCalledWith(
//       `${psychzConfig.baseUrl}/ticket`,
//       // Validate request body structure
//       expect.objectContaining({
//         subject: ticketData.subject,
//         topic: ticketData.topic,
//         message: ticketData.message,
//         files: [
//           `data:image/png;base64,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`,
//           `data:image/png;base64,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`,
//         ],
//       }),
//       {
//         headers: {
//           // Validate headers including X-Api-Token
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: psychzConfig.apiKey, // Replace with mock-api-key if needed for testing
//         },
//       }
//     );
//   });

  test("throws error for missing subject in ticket data", async () => {
    const ticketData = {
        subject: null,
        department_id: "2",
        priority: "0",
        message: "Test ticket body, please close this ticket",
        service_id: "0",
        attach: null,
      };

    axios.post.mockRejectedValue(createTicketInvalidSubjectResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Subject was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Missing Ticket Subject");
    }
  });

  test("throws error for missing department_id in ticket data", async () => {
    const ticketData = {
        subject: "Test Ticket",
        department_id: null,
        priority: "0",
        message: "Test ticket body, please close this ticket",
        service_id: "0",
        attach: null,
    };

    axios.post.mockRejectedValue(createTicketInvalidDepartmentIdResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket department_id was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Missing Ticket department_id");
    }
  });

  test("throws error for missing message in ticket data", async () => {
    const ticketData = {
      subject: "Test Ticket",
      topic: "velianet-support",
      message: null,
      files: [],
    };

    axios.post.mockRejectedValue(createTicketInvalidMessageResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Message was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Missing Ticket message");
    }
  });

//   // Test Error Handling during Ticket Creation (Example: exceeding attachment limit)
//   test("throws error for exceeding attachment limit", async () => {
//     const ticketData = {
//       subject: "Test Ticket with Attachment",
//       topic: "velianet-support",
//       message: "Test ticket body",
//       files: [{}, {}, {}, {}, {}, {}],
//     };

//     expect.assertions(1); // Only expect one assertion (the thrown error)

//     try {
//       await adapter.createTicket(ticketData);
//     } catch (error) {
//       expect(error.message).toBe("Maximum limit of 5 files reached.");
//     }
//   });
});

describe("Get Velia Ticket", () => {
  test("retrieves a ticket by ID", async () => {
    axios.get.mockResolvedValueOnce(getTicketValidResponse); // Mock axios.get behavior

    const ticketId = 4311829;

    const retrievedTicket = await adapter.getTicket(ticketId);

    expect(retrievedTicket).toEqual({
        status: true,
        data: {
          ticket_id: "4311829",
          department: "Psychz Support",
          submitted: "2024-04-30 09:44:42",
          priority: "Normal",
          service: "0",
          device: "0",
          status: "Closed",
          ticket_post_list: [
            {
              ticket_id: "4311829",
              ticket_post_id: "14282075",
              timestamp: "2024-04-30 09:44:42",
              body: "Test body, please close this ticket.",
              subject: "Test Ticket with attachment",
              source_name: "client",
              type: "Escalate to Manager",
              author: "Unity Technologies SF ",
            },
          ],
        },
      });
    expect(axios.get).toHaveBeenCalledWith(
      `${psychzConfig.baseUrl}/tickets_detail?access_token=${psychzConfig.apiKey}&access_username=${psychzConfig.access_username}&ticket_id=${ticketId}`,
      // Validate request body structure
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
  });

  test("throws error for Invalid Ticket ID type (400)", async () => {
    const ticketId = "e";

    axios.get.mockRejectedValue(getTicketInvalidTicketIdTypeResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket not found was not thrown");
    } catch (error) {
      expect(error.message).toEqual("400 Ticket ID Type Invalid: A valid ticket id is required.");
    }
  });

  test("throws error for Invalid Access Username (400)", async () => {
    const ticketId = "12345";

    axios.get.mockRejectedValue(invalidAccessUsername);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Invalid Access Username was not thrown");
    } catch (error) {
      expect(error.message).toEqual("400 Access Username Invalid: A valid username is required.");
    }
  });

  test("throws error for Invalid API key (401)", async () => {
    const adapter = new _PsychzDataCenterAdapter({
      baseUrl: "http://localhost",
      apiKey: null,
    });
    const ticketId = "12345";

    axios.get.mockRejectedValue(invalidApiKey);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: 401 Unauthorized was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "Failed to retrieve ticket: Invalid access token."
      );
    }
  });

  test("throws error for non-existent ticket (404)", async () => {
    const ticketId = "12345";

    axios.get.mockRejectedValue(getTicketInvalidTicketNotFoundResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket not found was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Ticket not found: 12345");
    }
  });
});
