// app_remote/test/datapacketService.test.js

const { createTicket, getTickets } = require("../services/dataCenterService/datapacketService.js");
const {
  createTicketValidResponse,
  createTicketInvalidMessageResponse,
  createTicketInvalidPriorityResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidNullTicketIdResponse,
  getTicketInvalidMissingTicketIdResponse,
  invalidApiKey,
} = require("./test-data/datapacketResponse.js");

const axios = require("axios");

jest.mock("axios");

describe("Create DataPacket Ticket", () => {
  test("creates a ticket with valid data (mocked success)", async () => {
    const ticketData = {
      subject: "HARDWARE_OTHER",
      priority: "NORMAL",
      message: "Test ticket body. Please close this ticket",
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const mutation = `mutation CreateSupportRequest($input: CreateSupportRequestInput!) {
        createSupportRequest(input: $input)
    }`;

    const variables = {
      input: {
        message: ticketData.message,
        subject: ticketData.subject,
        priority: ticketData.priority,
      },
    };

    const createdTicket = await createTicket(ticketData);

    expect(createdTicket).toEqual(createTicketValidResponse.data); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      { query: mutation, variables: variables },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: expect.any(String),
        },
      }
    );

    axios.post.mockReset();
  });

  test("throws error for invalid message in ticket data", async () => {
    const ticketData = {
      subject: "HARDWARE_OTHER",
      priority: "NORMAL",
      message: null,
    };

    axios.post.mockRejectedValue(createTicketInvalidMessageResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Error creating DataPacket ticket: Invalid Ticket Message");

    axios.post.mockReset();
  });

  test("throws error for invalid priority in ticket data", async () => {
    const ticketData = {
      subject: "HARDWARE_OTHER",
      priority: null,
      message: "Test ticket body. Please close this ticket",
    };

    axios.post.mockRejectedValue(createTicketInvalidPriorityResponse);

    await expect(createTicket(ticketData)).rejects.toThrow("Error creating DataPacket ticket: Invalid Ticket Priority");

    axios.post.mockReset();
  });
});
