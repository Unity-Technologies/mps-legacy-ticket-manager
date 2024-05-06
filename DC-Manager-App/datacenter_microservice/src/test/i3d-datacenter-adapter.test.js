const _I3dDataCenterAdapter = require("../datacenter_adapters/i3d-datacenter-adapter.js");
const {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdTypeResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
} = require("./test-data/i3d-response.js");
const axios = require("axios");

const i3dConfig = {
  baseUrl: "http://localhost", // Replace with a mock URL for testing
  apiKey: "mock-api-key", // Replace with a mock API key for testing
};

jest.mock("axios");

describe("Create Performive Ticket", () => {
  // Test Successful Ticket Creation
  test("creates a ticket with valid data (mocked success)", async () => {
    const adapter = new _I3dDataCenterAdapter(i3dConfig);
    const ticketData = {
      title: "Test Ticket",
      content: "Test Body, please close this ticket",
      department: "Service Desk",
      category: "Bare-metal",
      attachmentIds: [],
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({
      id: 1935509,
      hash: "OAHJ",
      readHash: "e2ee753463f2614dead7705c9495a450a8a96794",
      title: "Test Ticket",
      categoryName: "Bare-metal",
      priorityName: "Normal Priority",
      createdAt: 1714988143,
      updatedAt: 1714988143,
      clientLastRepliedAt: 1714988143,
      clientLastReadAt: 0,
      status: "open",
      numUserReplies: 1,
      replies: [
        {
          id: 16204909,
          title: "Test Ticket",
          fullUserName: "Unity Technologies",
          content: "Test Body, please close this ticket",
          createdAt: 1714988143,
          replyByI3d: 0,
          attachments: [],
        },
      ],
    }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      `${i3dConfig.baseUrl}/tickets`,
      // Validate request body structure
      expect.objectContaining({
        title: ticketData.title,
        content: ticketData.content,
        department: ticketData.department,
        category: ticketData.category,
        attachmentIds: ticketData.attachmentIds,
      }),
      {
        headers: {
          // Validate headers including X-Api-Token
          "Content-Type": "application/json",
          Accept: "application/json",
          "PRIVATE-TOKEN": i3dConfig.apiKey, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test("throws error for missing title in ticket data (400)", async () => {
    const adapter = new _I3dDataCenterAdapter(i3dConfig);
    const ticketData = {
      title: null,
      content: "Test Body, please close this ticket",
    };

    axios.post.mockResolvedValueOnce(createTicketInvalidSubjectResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Subject was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: title is required");
    }
  });

  test("throws error for missing content in ticket data (400)", async () => {
    const adapter = new _I3dDataCenterAdapter(i3dConfig);
    const ticketData = {
      title: "Test Ticket",
      content: null,
    };

    axios.post.mockResolvedValueOnce(createTicketInvalidBodyResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Body was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: content is required");
    }
  });
});

describe("Get 100TB Ticket", () => {
  test("retrieves a ticket by ID", async () => {
    const adapter = new _I3dDataCenterAdapter(i3dConfig);

    axios.get.mockResolvedValueOnce(getTicketValidResponse); // Mock axios.get behavior

    const ticketId = 618192;

    const retrievedTicket = await adapter.getTicket(ticketId);

    expect(retrievedTicket).toEqual({
      id: 1935509,
      hash: "OAHJ",
      readHash: "e2ee753463f2614dead7705c9495a450a8a96794",
      title: "Test Ticket",
      categoryName: "Bare-metal",
      priorityName: "Normal Priority",
      createdAt: 1714988143,
      updatedAt: 1714988143,
      clientLastRepliedAt: 1714988143,
      clientLastReadAt: 1714988235,
      status: "closed",
      numUserReplies: 1,
      replies: [
        {
          id: 16204909,
          title: "Test Ticket",
          fullUserName: "Unity Technologies",
          content: "Test Body, please close this ticket",
          createdAt: 1714988143,
          replyByI3d: 0,
          attachments: [],
        },
      ],
    });
    expect(axios.get).toHaveBeenCalledWith(
      `${i3dConfig.baseUrl}/tickets/${ticketId}`,
      // Validate request body structure
      {
        headers: {
          // Validate headers including X-Api-Token
          Accept: "application/json",
          "PRIVATE-TOKEN": i3dConfig.apiKey, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test("throws error for Invalid Ticket ID type", async () => {
    const adapter = new _I3dDataCenterAdapter(i3dConfig);
    const ticketId = "e";

    axios.get.mockResolvedValueOnce(getTicketInvalidTicketIdTypeResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket ID undefined was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "Error: Ticket ID type most likely invalid, API route not found"
      );
    }
  });

  test("throws error for Invalid API token (401)", async () => {
    const adapter = new _I3dDataCenterAdapter({
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
        "401 Failed to retrieve i3D ticket: Unauthenticated / invalid credentials for API request"
      );
    }
  });

  test('throws error for non-existent ticket (404)', async () => {
    const adapter = new _I3dDataCenterAdapter(i3dConfig);
    const ticketId = '12345';
  
    axios.get.mockResolvedValueOnce(getTicketInvalidTicketNotFoundResponse);
  
    try {
      await adapter.getTicket(ticketId);
      fail('Error: Ticket not found was not thrown');
    } catch (error) {
      expect(error.message).toEqual('Ticket not found: 12345');
    }
  });
});
