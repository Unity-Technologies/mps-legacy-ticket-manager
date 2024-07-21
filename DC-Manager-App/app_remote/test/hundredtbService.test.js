const axios = require("axios");
const { createTicket } = require("../services/dataCenterService/hundredtbService");
const { 
  createTicketValidResponse,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
} = require("./test-data/hundredtbResponse");

const config = require("../../config/apiConfig");

jest.mock("axios");
jest.mock("../../config/apiConfig", () => ({
  hundredtb: {
    apiUrl: "https://api.mock100tb.com",
    apiToken: "mock-api-token",
  },
}));

describe("Create 100TB Ticket", () => {
  const validTicketData = {
    subject: "Test Ticket",
    body: "Test Body without Attachment",
    department: 10,
    priority: 1,
    attachments: [],
  };

  const validAttachment = {
    mimetype: "image/png",
    originalname: "test_image.png",
    buffer: Buffer.from("test_image_buffer"),
  };

  test("creates a ticket with valid data (mocked success)", async () => {
    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const ticketId = await createTicket(validTicketData);
    
    expect(ticketId).toEqual("2981");
    expect(axios.post).toHaveBeenCalledWith(
      `${config.hundredtb.apiUrl}/tickets`,
      expect.objectContaining({
        subject: validTicketData.subject,
        body: validTicketData.body,
        department: validTicketData.department,
        priority: validTicketData.priority,
        attachments: [],
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Token": config.hundredtb.apiToken,
        },
      }
    );
  });

  test("creates a ticket with valid attachments (mocked success)", async () => {
    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const ticketDataWithAttachments = {
      ...validTicketData,
      attachments: [validAttachment, validAttachment],
    };

    const ticketId = await createTicket(ticketDataWithAttachments);
    
    expect(ticketId).toEqual("2981");
    expect(axios.post).toHaveBeenCalledWith(
      `${config.hundredtb.apiUrl}/tickets`,
      expect.objectContaining({
        subject: validTicketData.subject,
        body: validTicketData.body,
        department: validTicketData.department,
        priority: validTicketData.priority,
        attachments: expect.arrayContaining([
          expect.objectContaining({
            mime: validAttachment.mimetype,
            name: validAttachment.originalname,
            file: expect.any(String),
          }),
        ]),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Token": config.hundredtb.apiToken,
        },
      }
    );
  });

  test("throws an error when creating a ticket with more than 2 attachments", async () => {
    const ticketDataWithTooManyAttachments = {
      ...validTicketData,
      attachments: [validAttachment, validAttachment, validAttachment],
    };

    await expect(createTicket(ticketDataWithTooManyAttachments)).rejects.toThrow(
      "Maximum 2 attachments allowed per ticket."
    );
  });

  test("throws an error when creating a ticket with an invalid attachment type", async () => {
    const invalidAttachment = {
      mimetype: "application/zip",
      originalname: "test.zip",
      buffer: Buffer.from("test_zip_buffer"),
    };

    const ticketDataWithInvalidAttachment = {
      ...validTicketData,
      attachments: [invalidAttachment],
    };

    await expect(createTicket(ticketDataWithInvalidAttachment)).rejects.toThrow(
      "Invalid attachment file type: application/zip. Allowed types are: image/jpg, image/jpeg, image/png, image/tiff, image/gif, text/csv, text/plain, video/3gpp, video/3gpp2, video/h261, video/h263, video/h264, video/jpeg, video/mp4, video/mpeg, video/ogg, video/quicktime, video/webm, application/pdf, application/x-pdf, application/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  test("throws an error when creating a ticket without a subject", async () => {
    const ticketDataWithoutSubject = {
      ...validTicketData,
      subject: "",
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidSubjectResponse);

    await expect(createTicket(ticketDataWithoutSubject)).rejects.toThrow(
      "Error creating 100TB ticket: Missing Ticket Subject"
    );
  });

  test("throws an error when creating a ticket without a body", async () => {
    const ticketDataWithoutBody = {
      ...validTicketData,
      body: "",
    };

    axios.post.mockRejectedValueOnce(createTicketInvalidBodyResponse);

    await expect(createTicket(ticketDataWithoutBody)).rejects.toThrow(
      "Error creating 100TB ticket: Missing Ticket Body"
    );
  });

  test("throws a network error when no response is received", async () => {
    axios.post.mockRejectedValueOnce({ request: {} });

    await expect(createTicket(validTicketData)).rejects.toThrow(
      "Network Error: Could not create 100TB ticket"
    );
  });

  test("throws an error for unexpected errors", async () => {
    const unexpectedError = new Error("Unexpected error");
    axios.post.mockRejectedValueOnce(unexpectedError);

    await expect(createTicket(validTicketData)).rejects.toThrow(unexpectedError);
  });

  test("handles 401 unauthenticated error", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { error: { description: "Invalid API token" } },
      },
    });

    await expect(createTicket(validTicketData)).rejects.toThrow(
      "Failed to create 100TB ticket: Invalid API token"
    );
  });

  test("handles other 400 errors with generic message", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: "Some other error" },
      },
    });

    await expect(createTicket(validTicketData)).rejects.toThrow(
      "Failed to create 100TB ticket: Some other error"
    );
  });

  test("handles non-400/401 errors with generic message", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        message: "Server error",
      },
    });

    await expect(createTicket(validTicketData)).rejects.toThrow(
      "Failed to create 100TB ticket: Server error"
    );
  });
});
