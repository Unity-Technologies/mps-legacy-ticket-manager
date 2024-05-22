const _InapDataCenterAdapter = require("../datacenter_adapters/inap-datacenter-adapter.js");
const {
  createTicketValidResponse,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
  createTicketInvalidPriorityResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidTicketForOtherCompanyResponse,
  invalidApiKey,
} = require("./test-data/inap-response.js");
const axios = require("axios");

const inapConfig = {
  baseUrl: "http://localhost", // Replace with a mock URL for testing
  apiKey: "mock-api-key", // Replace with a mock API key for testing
};

const adapter = new _InapDataCenterAdapter(inapConfig);

jest.mock("axios");

describe("Create INAP Ticket", () => {
  // Test Successful Ticket Creation
  test("creates a ticket with valid data (mocked success)", async () => {
    const ticketData = {
      priority: "Low",
      shortDescription: "Test Ticket",
      description: "Test ticket body, please close this ticket",
    };

    axios.post.mockResolvedValueOnce(createTicketValidResponse);

    const createdTicket = await adapter.createTicket(ticketData);

    expect(createdTicket).toEqual({
      id: "CASE01272850",
      billingId: "",
      uberClientId: 193786,
      inapClientId: 17420,
      shortDescription: " - Test Ticket",
      description: "Test ticket body, please close this ticket",
      active: true,
      category: {
        uuid: "9019c7e0-098f-420f-9685-e1c121d99833",
        id: 56,
        name: "Request",
        departmentName: "Cloud",
        subcategory: [],
        department: {
          uuid: "55f8872d-5aa4-4c89-8867-bcffcc6e96ec",
          id: "cb01df19dbea9300e562791c8c96197c",
          name: "Cloud",
        },
      },
      subcategory: [],
      department: "Cloud",
      location: null,
      assignmentGroup: "Cloud Support Tier 1",
      state: "new",
      isReplyAllowed: true,
      priority: "Low",
      impact: "Low",
      urgency: "Low",
      assignee: "",
      contactFirstName: "Unity",
      contactLastName: "INAP",
      contactEmail: "multiplayer-suppliers@unity3d.com",
      contactType: "web",
      cc: null,
      createdDate: 1716386813,
      updatedDate: 1716386813,
    }); // Assert the returned ticket data
    expect(axios.post).toHaveBeenCalledWith(
      `${inapConfig.baseUrl}/support-cases`,
      // Validate request body structure
      expect.objectContaining({
        priority: ticketData.priority,
        shortDescription: ticketData.shortDescription,
        description: ticketData.description,
      }),
      {
        headers: {
          // Validate headers including X-Api-Token
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${inapConfig.apiKey}`, // Replace with mock-api-key if needed for testing
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

    axios.post.mockRejectedValue(createTicketInvalidSubjectResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Subject was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Missing Ticket Subject");
    }
  });

  test("throws error for missing body in ticket data", async () => {
    const ticketData = {
      priority: "Low",
      shortDescription: "Test Ticket",
      description: null,
    };

    axios.post.mockRejectedValue(createTicketInvalidBodyResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Subject or Body was not thrown");
    } catch (error) {
      expect(error.message).toEqual("Error: Missing Ticket Body");
    }
  });

  test("throws error for missing priority in ticket data", async () => {
    const ticketData = {
      priority: null,
      shortDescription: "Test Ticket",
      description: "Test ticket body, please close this ticket",
    };

    axios.post.mockRejectedValue(createTicketInvalidPriorityResponse);

    try {
      await adapter.createTicket(ticketData);
      fail("Error: Missing Ticket Subject or Body was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "500 Error Failed to create ticket: Internal Server Error"
      );
    }
  });
});

describe("Get INAP Ticket", () => {
  test("retrieves a ticket by ID", async () => {
    axios.get.mockResolvedValueOnce(getTicketValidResponse); // Mock axios.get behavior

    const ticketId = "CASE01272850";

    const retrievedTicket = await adapter.getTicket(ticketId);

    expect(retrievedTicket).toEqual({
      id: "CASE01272850",
      billingId: "",
      uberClientId: 193786,
      inapClientId: 17420,
      shortDescription: " - Test Ticket",
      description: "Test ticket body, please close this ticket",
      active: true,
      category: {
        uuid: "9019c7e0-098f-420f-9685-e1c121d99833",
        id: 56,
        name: "Request",
        departmentName: "Cloud",
        subcategory: [],
        department: {
          uuid: "55f8872d-5aa4-4c89-8867-bcffcc6e96ec",
          id: "cb01df19dbea9300e562791c8c96197c",
          name: "Cloud",
        },
      },
      subcategory: [],
      department: "Cloud",
      location: null,
      assignmentGroup: "Cloud Support Tier 1",
      state: "new",
      isReplyAllowed: true,
      priority: "Low",
      impact: "Low",
      urgency: "Low",
      assignee: "",
      contactFirstName: "Test",
      contactLastName: "Test",
      contactEmail: "test@test.com",
      contactType: "web",
      cc: "",
      createdDate: 1716386813,
      updatedDate: 1716386813,
      internalUuid: "",
    });
    expect(axios.get).toHaveBeenCalledWith(
      `${inapConfig.baseUrl}/support-cases/${ticketId}`,
      // Validate request body structure
      {
        headers: {
          // Validate headers including X-Api-Token
          Accept: "application/json",
          Authorization: `Bearer ${inapConfig.apiKey}`, // Replace with mock-api-key if needed for testing
        },
      }
    );
  });

  test("throws error for Invalid Ticket ID for our company", async () => {
    const ticketId = "CASE01111111";

    axios.get.mockRejectedValue(getTicketInvalidTicketForOtherCompanyResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket ID belongs to other company was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "403 Error Failed to retrieve ticket: Requested case uber client id does not match with company"
      );
    }
  });

  test("throws error for Invalid Ticket ID", async () => {
    const ticketId = "e";

    axios.get.mockRejectedValue(getTicketInvalidTicketIdResponse);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: Ticket ID undefined was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        `404 Error Failed to retrieve ticket: Client Error: Unable to retrieve case ${ticketId}`
      );
    }
  });

  test("throws error for Invalid API token (401)", async () => {
    const adapter = new _InapDataCenterAdapter({
      baseUrl: "https://api.ingenuitycloudservices.com/rest-api",
      apiKey: null,
    });
    const ticketId = "12345";

    axios.get.mockRejectedValue(invalidApiKey);

    try {
      await adapter.getTicket(ticketId);
      fail("Error: 401 Unauthorized was not thrown");
    } catch (error) {
      expect(error.message).toEqual(
        "401 Error Failed to create ticket: Authentication Failed: Bad credentials."
      );
    }
  });
});
