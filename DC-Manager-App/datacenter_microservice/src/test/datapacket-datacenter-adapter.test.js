const _DatapacketDataCenterAdapter = require("../datacenter_adapters/datapacket-datacenter-adapter.js");
const {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidMessageResponse,
  createTicketInvalidPriorityResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidNullTicketIdResponse,
  getTicketInvalidMissingTicketIdResponse,
  invalidApiKey,
} = require("./test-data/datapacket-response.js");

const axios = require("axios");

const datapacketConfig = {
  baseUrl: "http://localhost", // Replace with a mock URL for testing
  apiKey: "mock-api-key", // Replace with a mock API key for testing
};

const adapter = new _DatapacketDataCenterAdapter(datapacketConfig);

jest.mock("axios");

describe("Create DataPacket Ticket", () => {
  // Test Successful Ticket Creation
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
      // Map data to the format required by the Datapacket API
      input: {
        message: ticketData.message,
        subject: ticketData.subject,
        priority: ticketData.priority,
      },
    };

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({ data: { createSupportRequest: true } }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      `${datapacketConfig.baseUrl}`,
      // Validate request body structure
      { query: mutation, variables: variables },
      {
        headers: {
          // Validate headers including X-Api-Token
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${datapacketConfig.apiKey}`, // Replace with mock-api-key if needed for testing
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

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Invalid Ticket message was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Invalid Ticket Message");
    }

    axios.post.mockReset();
  });

  test("throws error for invalid priority in ticket data", async () => {
    const ticketData = {
      subject: "HARDWARE_OTHER",
      priority: null,
      message: "Test ticket body. Please close this ticket",
    };

    axios.post.mockRejectedValue(createTicketInvalidPriorityResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Invalid Ticket priority was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Invalid Ticket Priority");
    }

    axios.post.mockReset();
  });
});

describe("Get DataPacket Ticket", () => {
  test("retrieves a ticket by ID", async () => {
    axios.post.mockResolvedValueOnce(getTicketValidResponse); // Mock axios.get behavior

    const ticketId = 5055867;

    const query = `query SupportRequest($input: SupportRequestInput!) {
        supportRequest(input: $input) {
            id
            subject
            status
            createdAt
            updatedAt
            numberOfReplies
            lastReplyAt
            fullName
            email
            category
            posts {
                id
                contents
                createdAt
                email
                fullName
                postBy
            }
        }
    }`;

    const variables = {
      input: {
        id: ticketId,
      },
    };

    const retrievedTicket = await adapter.getTicket(ticketId);

    expect(retrievedTicket).toEqual({
      supportRequest: {
        id: 5055867,
        subject: "Support request (HW issue)",
        status: "CLOSED",
        createdAt: "2024-04-25T16:47:25.000Z",
        updatedAt: "2024-04-28T10:56:58.000Z",
        numberOfReplies: 5,
        lastReplyAt: "2024-04-28T10:56:58.000Z",
        fullName: "Testie Test",
        email: "testie@test.com",
        category: null,
        posts: [
          {
            id: 6258063,
            contents: "string",
            createdAt: "2024-04-28T10:56:58.000Z",
            email: "person@test.com",
            fullName: "Person Test",
            postBy: "STAFF",
          },
        ],
      },
    });
    expect(axios.post).toHaveBeenCalledWith(
      `${datapacketConfig.baseUrl}`,
      {
        query: query,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${datapacketConfig.apiKey}`,
        },
      }
    );
  });

  test("throws error for Invalid Ticket ID", async () => {
    const ticketId = "e";

    axios.post.mockRejectedValue(getTicketInvalidTicketIdResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket ID undefined was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Ticket ID is a non-integer value");
    }
  });

  test("throws error for Null Ticket ID", async () => {
    const ticketId = "e";

    axios.post.mockRejectedValue(getTicketInvalidNullTicketIdResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket ID undefined was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Ticket ID is null");
    }
  });

  test("throws error for Missing Ticket ID", async () => {
    const ticketId = "e";

    axios.post.mockRejectedValue(getTicketInvalidMissingTicketIdResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket ID undefined was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Ticket ID is empty");
    }
  });

  test("throws error for Invalid API token (200)", async () => {
    const adapter = new _DatapacketDataCenterAdapter({
      baseUrl: "http://localhost",
      apiKey: null,
    });
    const ticketId = "12345";

    axios.post.mockResolvedValueOnce(invalidApiKey);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Unauthorized error was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "Error: You are not authorized to perform this action"
      );
    }
  });
});
