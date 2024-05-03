// Create Ticket Responses -----------------------------

const createTicketValidResponse = {
  status: 201,
  message: "Ticket created",
  data: {
    data: { id: "2981" },
  },
};

const createTicketInvalid500Response = {
  status: 500,
  message: "Error message",
  data: null,
};

const createTicketInvalidSubjectResponse = {
  data: {
    status: 400,
    message: "Missing Ticket subject",
    data: [],
  },
};

const createTicketInvalidBodyResponse = {
  data: {
    status: 400,
    message: "Missing Ticket body",
    data: [],
  },
};

// Get Ticket Responses -----------------------------

const getTicketValidResponse = {
  status: 200,
  message: "Ticket Details",
  data: {
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
  },
};

const getTicketInvalidTicketIdTypeResponse = {
  data: {
    status: 400,
    message: "Path parameter ticket_id needs to be numeric",
    data: [],
  },
};

const getTicketInvalidTicketNotFoundResponse = {
  data: {
    status: 404,
    message: "ticket not found",
    data: [],
  },
};

// 100TB Config Error Responses -----------------------------

const invalidApiKey = {
  data: {
    status: 401,
    error: {
      type: "UNAUTHENTICATED",
      description: "Invalid API Key",
    },
  },
};

module.exports = {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectResponse,
  createTicketInvalidBodyResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdTypeResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
};
