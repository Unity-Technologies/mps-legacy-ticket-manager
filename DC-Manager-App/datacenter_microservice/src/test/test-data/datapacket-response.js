// Create Ticket Responses -----------------------------

const createTicketValidResponse = {
  status: 200,
  statusText: "OK",
  data: { data: { createSupportRequest: true } },
};

const createTicketInvalid500Response = {
  status: 500,
  message: "Error message",
  data: null,
};

const createTicketInvalidMessageResponse = {
  response: {
    status: 400,
    data: {
      errors: [
        {
          message:
            'Variable "$input" got invalid value null at "input.message"; Expected non-nullable type "String!" not to be null.',
          extensions: {
            processId: ["9508ac57-d4fd-4016-a0c6-786a0692f14d"],
            code: "GRAPHQL_VALIDATION_FAILED",
          },
        },
      ],
    },
  },
};

const createTicketInvalidPriorityResponse = {
  response: {
    status: 400,
    data: {
      errors: [
        {
          message:
            'Variable "$input" got invalid value null at "input.priority"; Expected non-nullable type "SupportRequestPriority!" not to be null.',
          extensions: {
            processId: ["9508ac57-d4fd-4016-a0c6-786a0692f1r5"],
            code: "GRAPHQL_VALIDATION_FAILED",
          },
        },
      ],
    },
  },
};

// Get Ticket Responses -----------------------------

const getTicketValidResponse = {
  status: 200,
  data: {
    data: {
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
    },
  },
};

const getTicketInvalidTicketIdResponse = {
  response: {
    status: 400,
    data: {
      errors: [
        {
          message:
            'Variable "$input" got invalid value "e" at "input.id"; Int cannot represent non-integer value: "e"',
          extensions: {
            processId: ["12345"],
            code: "GRAPHQL_VALIDATION_FAILED",
          },
        },
      ],
    },
  },
};

const getTicketInvalidNullTicketIdResponse = {
  response: {
    status: 400,
    data: {
      errors: [
        {
          message:
            'Variable "$input" got invalid value null at "input.id"; Expected non-nullable type "Int!" not to be null.',
          extensions: {
            processId: ["12345"],
            code: "GRAPHQL_VALIDATION_FAILED",
          },
        },
      ],
    },
  },
};

const getTicketInvalidMissingTicketIdResponse = {
  response: {
    status: 400,
    data: {
      errors: [
        {
          message:
            'Variable "$input" got invalid value {}; Field "id" of required type "Int!" was not provided.',
          extensions: {
            processId: ["12345"],
            code: "GRAPHQL_VALIDATION_FAILED",
          },
        },
      ],
    },
  },
};

// 100TB Config Error Responses -----------------------------

const invalidApiKey = {
  status: 200,
  data: {
    errors: [
      {
        message: "You are not authorized to perform this action",
        extensions: { processId: ["12345"], code: "NOT_AUTHORIZED" },
      },
    ],
    data: null,
  },
};

module.exports = {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidMessageResponse,
  createTicketInvalidPriorityResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdResponse,
  getTicketInvalidNullTicketIdResponse,
  getTicketInvalidMissingTicketIdResponse,
  invalidApiKey,
};
