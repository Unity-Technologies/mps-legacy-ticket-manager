// app_remote/test/veliaService.test.js
const { createTicketValidResponse, createTicketInvalidSubjectResponse, createTicketInvalidAttachmentSizeResponse, createTicketInvalidTopicResponse, createTicketInvalidMessageResponse, createTicketInvalidNumberOfAttachmentsResponse } = require("./test-data/veliaResponse.js");
const axios = require("axios");
const config = require("../../config/apiConfig");
const { createTicket } = require("../services/dataCenterService/veliaService");

jest.mock("axios");

// Mock the configuration for testing
jest.mock("../../config/apiConfig", () => ({
  velia: {
    apiUrl: "https://api.mockvelia.com",
    apiToken: "mock-api-token",
  },
}));

describe("Create Velia Ticket", () => {
  // Test Successful Ticket Creation
  test("creates a ticket with valid data (mocked success)", async () => {
    const ticketData = {
      subject: "Test Ticket",
      topic: "velianet-support",
      summary: "Test summary",
      message: "Test ticket body, please close this ticket",
      attachments: [],
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await createTicket(ticketData);

    expect(createdTicket).toBe(473809); // Assert the returned ticket ID
    expect(axios.post).toHaveBeenCalledWith(
      `${config.velia.apiUrl}/ticket`,
      // Validate request body structure
      expect.objectContaining({
        subject: ticketData.subject,
        topic: ticketData.topic,
        summary: ticketData.summary,
        message: ticketData.message,
        files: [], // Assuming no attachments in this test case
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "mock-api-token",
        },
      }
    );

    axios.post.mockReset();
  });

  test("throws an error for invalid subject (mocked error response)", async () => {
    const ticketData = {
      subject: "",
      topic: "velianet-support",
      summary: "Test summary",
      message: "Test ticket body, please close this ticket",
      attachments: [],
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidSubjectResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Error creating Velia ticket: Missing Ticket Subject");

    axios.post.mockReset();
  });

  test("throws an error for invalid attachment size (mocked error response)", async () => {
    const mockAttachment1 = {
      mimetype: "image/png",
      buffer: Buffer.from("some data"),
    };

    const ticketData = {
      subject: "Test Ticket with Attachment",
      topic: "velianet-support",
      summary: "Test summary",
      message: "Test ticket body",
      attachments: [mockAttachment1, mockAttachment1, mockAttachment1, mockAttachment1, mockAttachment1, mockAttachment1], // More than 5 attachments
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidAttachmentSizeResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Maximum limit of 5 files reached.");

    axios.post.mockReset();
  });

  test("throws an error for invalid topic (mocked error response)", async () => {
    const ticketData = {
      subject: "Test Ticket",
      topic: "invalid-topic",
      summary: "Test summary",
      message: "Test ticket body",
      attachments: [],
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidTopicResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Error creating Velia ticket: Missing Ticket Topic");

    axios.post.mockReset();
  });

  test("throws an error for invalid message (mocked error response)", async () => {
    const ticketData = {
      subject: "Test Ticket",
      topic: "velianet-support",
      summary: "Test summary",
      message: "",
      attachments: [],
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidMessageResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Error creating Velia ticket: Missing Ticket Message");

    axios.post.mockReset();
  });

  test("throws an error for invalid number of attachments (mocked error response)", async () => {
    const mockAttachment1 = {
      mimetype: "image/png",
      buffer: Buffer.from("some data"),
    };

    const ticketData = {
      subject: "Test Ticket with Attachment",
      topic: "velianet-support",
      summary: "Test summary",
      message: "Test ticket body",
      attachments: [mockAttachment1, mockAttachment1, mockAttachment1, mockAttachment1, mockAttachment1, mockAttachment1], // More than 5 attachments
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidNumberOfAttachmentsResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Maximum limit of 5 files reached.");

    axios.post.mockReset();
  });
});
