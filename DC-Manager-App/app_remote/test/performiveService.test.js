const performiveService = require("../services/dataCenterService/performiveService");
const {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectOrBodyResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
} = require("./test-data/performiveResponse");
const axios = require("axios");
const config = require("../../config/apiConfig");

jest.mock("axios");

jest.mock("../../config/apiConfig", () => ({
  performive: {
    apiUrl: "https://api.mockperformive.com",
    apiToken: "mock-api-token",
  },
}));

describe("Performive Service", () => {
  describe("Create Ticket", () => {
    test("creates a ticket with valid data (mocked success)", async () => {
      const ticketData = {
        group: "Support",
        subject: "Test Ticket",
        body: "Test Body",
      };

      axios.post.mockResolvedValueOnce(createTicketValidResponse);

      const createdTicket = await performiveService.createTicket(ticketData);

      expect(createdTicket).toEqual(createTicketValidResponse.data.payload.id);
      expect(axios.post).toHaveBeenCalledWith(
        `${config.performive.apiUrl}/tickets`,
        {
          group: ticketData.group,
          subject: ticketData.subject,
          body: ticketData.body,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Auth-Token": config.performive.apiToken,
          },
        }
      );
    });

    test("throws error for missing subject in ticket data", async () => {
      const ticketData = {
        group: "Support",
        body: "Test Body",
      };

      axios.post.mockRejectedValue(createTicketInvalidSubjectOrBodyResponse);

      await expect(performiveService.createTicket(ticketData)).rejects.toThrow(
        "Error: You must include a [subject] and [body] when creating a ticket"
      );
    });

    test("throws error for missing body in ticket data", async () => {
      const ticketData = {
        group: "Support",
        subject: "Test Ticket",
      };

      axios.post.mockRejectedValue(createTicketInvalidSubjectOrBodyResponse);

      await expect(performiveService.createTicket(ticketData)).rejects.toThrow(
        "Error: You must include a [subject] and [body] when creating a ticket"
      );
    });
  });
});
