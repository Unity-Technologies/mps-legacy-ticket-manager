const _VeliaDataCenterAdapter = require("../datacenter_adapters/hundredtb-datacenter-adapter");
const {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdTypeResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
} = require("./test-data/velia-response.js");
const axios = require("axios");

const veliaConfig = {
  baseUrl: "http://localhost", // Replace with a mock URL for testing
  apiKey: "mock-api-key", // Replace with a mock API key for testing
};

const adapter = new _VeliaDataCenterAdapter(veliaConfig);

jest.mock("axios");

describe("Create Velia Ticket", () => {
  // Test Successful Ticket Creation
  test("creates a ticket with valid data (mocked success)", async () => {
    const ticketData = {
      subject: "Test Ticket",
      body: "Test Body without Attachment",
      department: 10,
      priority: 1,
      attachments: [],
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({ id: "2981" }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      `${veliaConfig.baseUrl}/tickets`,
      // Validate request body structure
      expect.objectContaining({
        subject: ticketData.subject,
        body: ticketData.body,
        department: ticketData.department,
        priority: ticketData.priority,
        attachments: [], // Assuming no attachments in this test case
      }),
      {
        headers: {
          // Validate headers including X-Api-Token
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Token": veliaConfig.apiKey, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test("creates a ticket with valid attachments (mocked success)", async () => {
    const mockAttachment1 = {
      mime: "image/png",
      name: "test_image.png",
      path: "C:\\Users\\juliantitusglover\\repos\\DC-Ticket-Manager-App\\DC-Manager-App\\assets\\logo.png",
    };

    const ticketData = {
      subject: "Test Ticket",
      body: "Test Body with Attachment",
      department: 10,
      priority: 1,
      attachments: [mockAttachment1, mockAttachment1],
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({ id: "2981" }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      `${veliaConfig.baseUrl}/tickets`,
      // Validate request body structure
      expect.objectContaining({
        subject: ticketData.subject,
        body: ticketData.body,
        department: ticketData.department,
        priority: ticketData.priority,
        attachments: [
          {
            file: "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",
            mime: "image/png",
            name: "test_image.png",
          },
          {
            file: "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",
            mime: "image/png",
            name: "test_image.png",
          },
        ],
      }),
      {
        headers: {
          // Validate headers including X-Api-Token
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Token": veliaConfig.apiKey, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test('throws error for missing subject in ticket data', async () => {
    const ticketData = {
      body: 'Test Body without Attachment',
      department: 10,
      priority: 1,
      attachments: [],
    };

    axios.post.mockResolvedValueOnce(createTicketInvalidSubjectResponse);

    try {
      await adapter.createTicket(ticketData);
      fail('Error: Missing Ticket Subject was not thrown');
    } catch (error) {
      expect(error.message).toEqual('Error: Missing Ticket Subject');
    }
  });

  test('throws error for missing body in ticket data', async () => {
    const ticketData = {
      subject: 'Test Ticket',
      department: 10,
      priority: 1,
      attachments: [],
    };

    axios.post.mockResolvedValueOnce(createTicketInvalidBodyResponse);

    try {
      await adapter.createTicket(ticketData);
      fail('Error: Missing Ticket Body was not thrown');
    } catch (error) {
      expect(error.message).toEqual('Error: Missing Ticket Body');
    }
  });

  // Test Error Handling during Ticket Creation (Example: exceeding attachment limit)
  test("throws error for exceeding attachment limit", async () => {
    const ticketData = {
      subject: "Test Ticket",
      body: "This is a test ticket",
      attachments: [{}, {}, {}],
    };

    expect.assertions(1); // Only expect one assertion (the thrown error)

    try {
      await adapter.createTicket(ticketData);
    } catch (error) {
      expect(error.message).toBe("Maximum 2 attachments allowed per ticket.");
    }
  });
});

describe("Get Velia Ticket", () => {
  test("retrieves a ticket by ID", async () => {
    axios.get.mockResolvedValueOnce(getTicketValidResponse); // Mock axios.get behavior

    const ticketId = 3391;

    const retrievedTicket = await adapter.getTicket(ticketId);

    expect(retrievedTicket).toEqual({
      author_email: "(no author)",
      body: "Test",
      subject: "TEST",
      department: "General Support",
      status: "Open",
      priority: "Normal",
      comments: [
        {
          id: 4458,
          ticket_id: "3391",
          body: "TEST2",
          author_email: "",
          created_on: "2021-11-26T13:15:32+00:00",
        },
      ],
      id: "3391",
      created_on: "2021-11-26T12:46:11+00:00",
    });
    expect(axios.get).toHaveBeenCalledWith(
      `${veliaConfig.baseUrl}/tickets/${ticketId}`,
      // Validate request body structure
      {
        headers: {
          // Validate headers including X-Api-Token
          Accept: "application/json",
          "X-Api-Token": veliaConfig.apiKey, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test('throws error for Invalid Ticket ID type (400)', async () => {
    const ticketId = 'e';
  
    axios.get.mockResolvedValueOnce(getTicketInvalidTicketIdTypeResponse);
  
    try {
      await adapter.getTicket(ticketId);
      fail('Error: Ticket not found was not thrown');
    } catch (error) {
      expect(error.message).toEqual('400 Ticket ID Type Invalid: Path parameter ticket_id needs to be numeric');
    }
  });

  test('throws error for Invalid API key (401)', async () => {
    const adapter = new _VeliaDataCenterAdapter({
      baseUrl: 'https://api.ingenuitycloudservices.com/rest-api',
      apiKey: null,
    });
    const ticketId = '12345';
  
    axios.get.mockResolvedValueOnce(invalidApiKey);
  
    try {
      await adapter.getTicket(ticketId);
      fail('Error: 401 Unauthorized was not thrown');
    } catch (error) {
      expect(error.message).toEqual('401 Failed to retrieve ticket: Invalid API Key');
    }
  });

  test('throws error for non-existent ticket (404)', async () => {
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