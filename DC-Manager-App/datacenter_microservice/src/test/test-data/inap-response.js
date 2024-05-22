// Create Ticket Responses -----------------------------

const createTicketValidResponse = {
  status: 200,
  statusText: "OK",
  data: {
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
  },
};

const createTicketInvalidSubjectResponse = {
  response: {
    status: 400,
    data: { code: 400, message: "shortDescription is required" },
  },
};

const createTicketInvalidBodyResponse = {
  response: {
    status: 400,
    data: { code: 400, message: "description is required" },
  },
};

const createTicketInvalidPriorityResponse = {
  response: {
    status: 500,
    data: { code: 500, message: "Internal Server Error" },
  },
};

// Get Ticket Responses -----------------------------

const getTicketValidResponse = {
  status: 200,
  data: {
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
  },
};

const getTicketInvalidTicketIdResponse = {
  response: {
    status: 404,
    data: { code: 404, message: "Client Error: Unable to retrieve case e" },
  },
};

const getTicketInvalidTicketForOtherCompanyResponse = {
  response: {
    status: 403,
    data: {
      code: 403,
      message: "Requested case uber client id does not match with company",
    },
  },
};

// 100TB Config Error Responses -----------------------------

const invalidApiKey = {
  response: {
    status: 401,
    data: { message: "Authentication Failed: Bad credentials." },
  },
};

module.exports = {
  createTicketValidResponse,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
  createTicketInvalidPriorityResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidTicketForOtherCompanyResponse,
  invalidApiKey,
};
