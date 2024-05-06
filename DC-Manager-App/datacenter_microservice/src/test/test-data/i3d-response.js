// Create Ticket Responses -----------------------------

const createTicketValidResponse = {
  status: 200,
  data: {
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
  },
};

const createTicketInvalid500Response = {
  status: 500,
  message: "Error message",
  data: null,
};

const createTicketInvalidSubjectResponse = {
  status: 422,
  data: {
    errorCode: 11001,
    errorMessage: "Errors in form",
    errors: [{ property: "title", message: "is required" }],
  },
};

const createTicketInvalidBodyResponse = {
  status: 422,
  data: {
    errorCode: 11001,
    errorMessage: "Errors in form",
    errors: [{ property: "content", message: "is required" }],
  },
};

// Get Ticket Responses -----------------------------

const getTicketValidResponse = {
  status: 200,
  data: {
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
  },
};

const getTicketInvalidTicketIdTypeResponse = {
  status: 404,
  data: {
    errorCode: 10012,
    errorMessage: "API route not found",
    errors: [],
  },
};

const getTicketInvalidTicketNotFoundResponse = {
  status: 404,
  data: { errorCode: 10001, errorMessage: "Entity not found" },
};

// 100TB Config Error Responses -----------------------------

const invalidApiKey = {
  status: 401,
  data: {
    errorCode: 10004,
    errorMessage: "Unauthenticated / invalid credentials for API request",
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
