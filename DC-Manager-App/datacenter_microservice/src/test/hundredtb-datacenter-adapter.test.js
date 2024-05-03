const _100TBDataCenterAdapter = require("../datacenter_adapters/hundredtb-datacenter-adapter");
// const jest = require("jest");
const axios = require("axios");

jest.mock("axios");

describe("_100TBDataCenterAdapter class", () => {
  // Test Successful Ticket Creation
  test("creates a ticket with valid data", async () => {
    const mockResponse = { data: { id: 12345 } }; // Mock successful API response
    axios.post.mockResolvedValueOnce(mockResponse); // Mock axios.post behavior

    const adapter = new _100TBDataCenterAdapter({
      baseUrl: "http://localhost",
      apiKey: "mock-key",
    });
    const ticketData = {
      subject: "Test Ticket",
      body: "This is a test ticket",
      department: 1,
    };

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({ id: 12345 }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      // Verify axios.post was called with expected arguments
      "http://localhost/tickets",
      // ... request body (you can assert specific parts of the request body)
      { headers: { "X-Api-Token": "mock-key" } }
    );
  });

  // Test Error Handling during Ticket Creation (Example: exceeding attachment limit)
  test("throws error for exceeding attachment limit", async () => {
    const adapter = new _100TBDataCenterAdapter({
      baseUrl: "http://localhost",
      apiKey: "mock-key",
    });
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

  test("retrieves a ticket by ID", async () => {
    const mockResponse = {
      data: { id: 54321, subject: "Another Test Ticket" },
    }; // Mock successful API response
    axios.get.mockResolvedValueOnce(mockResponse); // Mock axios.get behavior

    const adapter = new _100TBDataCenterAdapter({
      baseUrl: "http://localhost",
      apiKey: "mock-key",
    });
    const ticketId = 12345;

    const retrievedTicket = await adapter.getTicket(ticketId);

    expect(retrievedTicket).toEqual({
      id: 54321,
      subject: "Another Test Ticket",
    });
  });
});
