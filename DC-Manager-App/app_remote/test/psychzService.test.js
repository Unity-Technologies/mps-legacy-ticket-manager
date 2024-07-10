// app_remote/test/psychzService.test.js
const { createTicket } = require("../services/dataCenterService/psychzService");
const axios = require("axios");
const config = require("../../config/apiConfig");

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
} = require("./test-data/psychzResponse.js");

jest.mock("axios");

describe("Create Psychz Ticket", () => {
  beforeAll(() => {
    jest.mock("../../config/apiConfig", () => ({
      psychz: {
        apiUrl: "https://api.mockpsychz.com",
        apiToken: "mock-api-token",
        apiUsername: "mock-username",
      },
    }));
  });

  test("creates a ticket with valid data (mocked success)", async () => {
    const ticketData = {
      subject: "Test Ticket",
      department_id: "2",
      priority: "0",
      message: "Test ticket body, please close this ticket",
      service_id: "0",
      attachments: [],
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await createTicket(ticketData);

    expect(createdTicket).toEqual("4327900"); // Assert the returned ticket ID
    expect(axios.post).toHaveBeenCalledWith(
      `${config.psychz.apiUrl}/ticket_create`,
      expect.objectContaining({
        subject: ticketData.subject,
        department_id: ticketData.department_id,
        priority: ticketData.priority,
        message: ticketData.message,
        service_id: ticketData.service_id,
        base64_file_name: undefined,
        base64_file: undefined,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
  });

  test("throws error when subject is missing", async () => {
    const ticketData = {
      department_id: "2",
      priority: "0",
      message: "Test ticket body",
      service_id: "0",
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidSubjectResponse);

    await expect(createTicket(ticketData)).rejects.toThrow(
      "Error creating Psychz ticket: Missing Ticket Subject"
    );
  });

  test("throws error when department_id is missing", async () => {
    const ticketData = {
      subject: "Test Ticket",
      priority: "0",
      message: "Test ticket body",
      service_id: "0",
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidDepartmentIdResponse);

    await expect(createTicket(ticketData)).rejects.toThrow(
      "Error creating Psychz ticket: Missing Ticket department_id"
    );
  });

  test("throws error when message is missing", async () => {
    const ticketData = {
      subject: "Test Ticket",
      department_id: "2",
      priority: "0",
      service_id: "0",
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidMessageResponse);

    await expect(createTicket(ticketData)).rejects.toThrow(
      "Error creating Psychz ticket: Missing Ticket message"
    );
  });

  test("throws error for invalid attachment size", async () => {
    const ticketData = {
      subject: "Test Ticket",
      department_id: "2",
      priority: "0",
      message: "Test ticket body",
      service_id: "0",
      attachments: [Buffer.alloc(9 * 1024 * 1024 + 1)], // 9 MB + 1 byte
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidAttachmentSizeResponse);

    await expect(createTicket(ticketData)).rejects.toThrow(
      `Failed to create Psychz ticket: ${{
        status: 409,
        data: { errors: ["Maximum Size of 14.3MB reached."] },
      }}`
    );
  });

  test("throws error for invalid number of attachments", async () => {
    const ticketData = {
      subject: "Test Ticket",
      department_id: "2",
      priority: "0",
      message: "Test ticket body",
      service_id: "0",
      attachments: [Buffer.alloc(1 * 1024 * 1024), Buffer.alloc(1 * 1024 * 1024), Buffer.alloc(1 * 1024 * 1024), Buffer.alloc(1 * 1024 * 1024), Buffer.alloc(1 * 1024 * 1024), Buffer.alloc(1 * 1024 * 1024)], // 6 attachments
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidNumberOfAttachmentsResponse);

    await expect(createTicket(ticketData)).rejects.toThrow(
      `Failed to create Psychz ticket: ${{
        status: 409,
        data: { errors: ["Maximum limit of 5 files reached."] },
      }}`
    );
  });

  test("throws error for invalid API token", async () => {
    const ticketData = {
      subject: "Test Ticket",
      department_id: "2",
      priority: "0",
      message: "Test ticket body",
      service_id: "0",
    };

    axios.post.mockRejectedValueOnce(invalidApiKey);

    await expect(createTicket(ticketData)).rejects.toThrow(
      "Failed to create Psychz ticket: Invalid access token."
    );
  });

  test("throws error for invalid access username", async () => {
    const ticketData = {
      subject: "Test Ticket",
      department_id: "2",
      priority: "0",
      message: "Test ticket body",
      service_id: "0",
    };

    axios.post.mockRejectedValueOnce(invalidAccessUsername);

    await expect(createTicket(ticketData)).rejects.toThrow(
      `Failed to create Psychz ticket: ${{
        code: "400",
        message: "Invalid request parameter.",
        errors: [
          {
            code: "400",
            field: "access_username",
            description: "A valid username is required.",
          },
        ],
      }}`
    );
  });
});
