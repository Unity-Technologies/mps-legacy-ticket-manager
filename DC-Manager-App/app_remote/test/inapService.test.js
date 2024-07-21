const inapService = require("../services/dataCenterService/inapService");
const {
  createTicketValidResponse,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
  createTicketInvalidPriorityResponse,
} = require("./test-data/inapResponse.js");
const axios = require("axios");
const config = require("../../config/apiConfig");

jest.mock("axios");

jest.mock("../../config/apiConfig", () => ({
  inap: {
    apiUrl: "https://api.mockinap.com",
    apiToken: "mock-api-token",
  },
}));

describe("INAP Service", () => {
  describe("Create Ticket", () => {
    test("creates a ticket with valid data (mocked success)", async () => {
      const ticketData = {
        priority: "Low",
        shortDescription: "Test Ticket",
        description: "Test ticket body, please close this ticket",
      };

      axios.post.mockResolvedValueOnce(createTicketValidResponse);

      const createdTicket = await inapService.createTicket(ticketData);

      expect(createdTicket).toEqual(createTicketValidResponse.data.id);
      expect(axios.post).toHaveBeenCalledWith(
        `${config.inap.apiUrl}/support-cases`,
        {
          priority: ticketData.priority,
          shortDescription: ticketData.shortDescription,
          description: ticketData.description,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${config.inap.apiToken}`,
          },
        }
      );
    });

    test("throws error for missing subject in ticket data", async () => {
      const ticketData = {
        priority: "Low",
        shortDescription: null,
        description: "Test ticket body, please close this ticket",
      };

      axios.post.mockRejectedValueOnce(createTicketInvalidSubjectResponse);

      await expect(inapService.createTicket(ticketData)).rejects.toThrow(
        "Error creating INAP ticket: Missing Ticket Subject"
      );
    });

    test("throws error for missing body in ticket data", async () => {
      const ticketData = {
        priority: "Low",
        shortDescription: "Test Ticket",
        description: null,
      };

      axios.post.mockRejectedValueOnce(createTicketInvalidBodyResponse);

      await expect(inapService.createTicket(ticketData)).rejects.toThrow(
        "Error creating INAP ticket: Missing Ticket Body"
      );
    });

    test("throws error for invalid priority in ticket data", async () => {
      const ticketData = {
        priority: null,
        shortDescription: "Test Ticket",
        description: "Test ticket body, please close this ticket",
      };

      axios.post.mockRejectedValueOnce(createTicketInvalidPriorityResponse);

      await expect(inapService.createTicket(ticketData)).rejects.toThrow(
        "500 Error Failed to create INAP ticket: Internal Server Error"
      );
    });
  });
});
