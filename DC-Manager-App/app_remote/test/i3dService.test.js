const axios = require("axios");
const { createTicket, attachFile } = require("../services/dataCenterService/i3dService");
const config = require("../../config/apiConfig");
const {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdTypeResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
} = require("./test-data/i3dResponse");

jest.mock("axios");
jest.mock("../../config/apiConfig", () => ({
  i3d: {
    apiUrl: "https://api.mocki3d.com",
    apiToken: "mock-api-token",
  },
}));

describe("Create I3D Ticket", () => {
  const validTicketData = {
    title: "Test Ticket",
    content: "Test Body, please close this ticket",
    department: "Service Desk",
    category: "Bare-metal",
    attachmentIds: [],
  };

  test("creates a ticket with valid data (mocked success)", async () => {
    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await createTicket(validTicketData);

    expect(createdTicket).toEqual("1935509-OAHJ");
    expect(axios.post).toHaveBeenCalledWith(
      `${config.i3d.apiUrl}/tickets`,
      expect.objectContaining({
        title: validTicketData.title,
        content: validTicketData.content,
        department: validTicketData.department,
        category: validTicketData.category,
        attachmentIds: validTicketData.attachmentIds,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "PRIVATE-TOKEN": config.i3d.apiToken,
        },
      }
    );
  });

  test("throws error for missing title in ticket data (422)", async () => {
    const ticketData = {
      title: null,
      content: "Test Body, please close this ticket",
    };

    axios.post.mockRejectedValue(createTicketInvalidSubjectResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Error: title is required");
  });

  test("throws error for missing content in ticket data (422)", async () => {
    const ticketData = {
      title: "Test Ticket",
      content: null,
    };

    axios.post.mockRejectedValue(createTicketInvalidBodyResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Error: content is required");
  });

  test("throws a network error when no response is received", async () => {
    axios.post.mockRejectedValue({ request: {} });

    await expect(createTicket(validTicketData)).rejects.toThrow("Network Error: Could not create I3D ticket");
  });

  test("throws an error for unexpected errors", async () => {
    const unexpectedError = new Error("Unexpected error");
    axios.post.mockRejectedValue(unexpectedError);

    await expect(createTicket(validTicketData)).rejects.toThrow(unexpectedError);
  });
});

describe("Attach I3D File", () => {
  const validAttachment = {
    mimetype: "image/png",
    originalname: "test_image.png",
    buffer: Buffer.from("test_image_buffer"),
  };

  test("attaches a file successfully", async () => {
    const mockResponse = { status: 201, data: "mockAttachmentId" };
    axios.post.mockResolvedValueOnce(mockResponse);

    const attachmentId = await attachFile(validAttachment.buffer);

    expect(attachmentId).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith(
      `${config.i3d.apiUrl}/tickets/attachment`,
      validAttachment.buffer,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "PRIVATE-TOKEN": config.i3d.apiToken,
        },
      }
    );
  });

  test("throws error for invalid file type", async () => {
    const invalidAttachment = {
      mimetype: "application/zip",
      originalname: "test.zip",
      buffer: Buffer.from("test_zip_buffer"),
    };

    const mockErrorResponse = {
      response: {
        status: 400,
        data: { errorMessage: `Failed to upload attachment: ${invalidAttachment}` },
      },
    };
    axios.post.mockRejectedValueOnce(mockErrorResponse);

    await expect(attachFile(invalidAttachment.buffer)).rejects.toThrow("Failed to upload attachment: [object Object]");
  });
});
