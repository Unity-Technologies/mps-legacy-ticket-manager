const _PerformiveDataCenterAdapter = require("../datacenter_adapters/performive-datacenter-adapter.js");
const {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectOrBodyResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
} = require("./test-data/performive-response.js");
const axios = require("axios");

const performiveConfig = {
  baseUrl: "http://localhost", // Replace with a mock URL for testing
  apiKey: "mock-api-key", // Replace with a mock API key for testing
};

jest.mock("axios");

describe("Create Performive Ticket", () => {
  // Test Successful Ticket Creation
  test("creates a ticket with valid data (mocked success)", async () => {
    const adapter = new _PerformiveDataCenterAdapter(performiveConfig);
    const ticketData = {
      group: "Support",
      subject: "Test Ticket",
      body: "Test Body",
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({
      success: true,
      message: "Ticket Created Successfully",
      payload: { id: 621968 },
    }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      `${performiveConfig.baseUrl}/tickets`,
      // Validate request body structure
      expect.objectContaining({
        group: ticketData.group,
        subject: ticketData.subject,
        body: ticketData.body,
      }),
      {
        headers: {
          // Validate headers including X-Api-Token
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Auth-Token": performiveConfig.apiKey, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test("throws error for missing subject in ticket data", async () => {
    const adapter = new _PerformiveDataCenterAdapter(performiveConfig);
    const ticketData = {
      group: "Support",
      body: "Test Body",
    };

    axios.post.mockResolvedValueOnce(createTicketInvalidSubjectOrBodyResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Subject or Body was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "Error: You must include a [subject] and [body] when creating a ticket"
      );
    }
  });

  test("throws error for missing body in ticket data", async () => {
    const adapter = new _PerformiveDataCenterAdapter(performiveConfig);
    const ticketData = {
      group: "Support",
      subject: "Test Ticket",
    };

    axios.post.mockResolvedValueOnce(createTicketInvalidSubjectOrBodyResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Subject or Body was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "Error: You must include a [subject] and [body] when creating a ticket"
      );
    }
  });
});

describe("Get 100TB Ticket", () => {
  test("retrieves a ticket by ID", async () => {
    const adapter = new _PerformiveDataCenterAdapter(performiveConfig);

    axios.get.mockResolvedValueOnce(getTicketValidResponse); // Mock axios.get behavior

    const ticketId = 618192;

    const retrievedTicket = await adapter.getTicket(ticketId);

    expect(retrievedTicket).toEqual({
      success: true,
      message: "Ticket 618192 Found",
      payload: {
        ticket: [
          {
            id: 618192,
            group: "support",
            subject: "string",
            description: "string",
            body: "string",
            company_id: 12345,
            requester: {
              name: "string",
              email: "string",
            },
            created_at: "04/22/24",
            updated_at: "04/23/24",
            replies: [
              {
                body: "string",
                incoming: true,
                from: {
                  name: "string",
                  email: "string",
                },
                timestamp: "2019-08-24T14:15:22Z",
              },
            ],
          },
        ],
      },
    });
    expect(axios.get).toHaveBeenCalledWith(
      `${performiveConfig.baseUrl}/tickets/${ticketId}`,
      // Validate request body structure
      {
        headers: {
          // Validate headers including X-Api-Token
          Accept: "application/json",
          "X-Auth-Token": performiveConfig.apiKey, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test("throws error for Invalid Ticket ID", async () => {
    const adapter = new _PerformiveDataCenterAdapter(performiveConfig);
    const ticketId = "e";

    axios.get.mockResolvedValueOnce(getTicketInvalidTicketIdResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket ID undefined was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "Error: Could not get ticketsUndefined property: stdClass::$issue"
      );
    }
  });

  test("throws error for Invalid API token (401)", async () => {
    const adapter = new _PerformiveDataCenterAdapter({
      baseUrl: "https://api.ingenuitycloudservices.com/rest-api",
      apiKey: null,
    });
    const ticketId = "12345";

    axios.get.mockResolvedValueOnce(invalidApiKey);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: 401 Unauthorized was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "401 Unauthorized Error: We are unable to authenticate your token. Please contact support for more information"
      );
    }
  });
});
