// Create Ticket Responses -----------------------------

const createTicketValidResponse = {
  status: 200,
  statusText: "OK",
  data: {
    success: true,
    message: "Ticket Created Successfully",
    payload: { id: 621968 },
  },
};

const createTicketInvalid500Response = {
  status: 500,
  message: "Error message",
  data: null,
};

const createTicketInvalidSubjectOrBodyResponse = {
  status: 400,
  data: {
    success: false,
    reason: "You must include a [subject] and [body] when creating a ticket",
  },
};

// Get Ticket Responses -----------------------------

const getTicketValidResponse = {
  status: 200,
  data: {
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
  },
};

const getTicketInvalidTicketIdResponse = {
  status: 200,
  data: {
    success: false,
    message: "Could not get ticketsUndefined property: stdClass::$issue",
    payload: [],
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
  status: 401,
  data: {
    success: false,
    reason:
      "We are unable to authenticate your token. Please contact support for more information",
  },
};

module.exports = {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectOrBodyResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
};
