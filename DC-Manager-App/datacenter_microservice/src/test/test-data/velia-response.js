// Create Ticket Responses -----------------------------

const { response } = require("express");

const createTicketValidResponse = {
  status: 200,
  data: {
    id: 473809,
    queue: "velianet-support",
    status: "new",
    subject: "Test Ticket",
    priority: 20,
    requestors: [],
    cc: [],
    created: "2024-05-06T13:29:32+00:00",
    due: null,
    resolved: null,
    updated: "2024-05-06T13:29:33+00:00",
    server: null,
  },
};

const createTicketInvalid500Response = {
  status: 500,
  message: "Error message",
  data: null,
};

const createTicketInvalidSubjectResponse = {
  response: {
    status: 409,
    data: {
      errors: ["Subject can not be blank or longer than 200 characters."],
    },
  },
};

const createTicketInvalidTopicResponse = {
  response: {
    status: 409,
    data: { errors: ["Topic not found.", "Topic name is invalid."] },
  },
};

const createTicketInvalidMessageResponse = {
  response: {
    status: 409,
    data: {
      errors: ["Message cannot be blank or longer than 100000 characters."],
    },
  },
};

const createTicketInvalidNumberOfAttachmentsResponse = {
  response: {
    status: 409,
    data: { errors: ["Maximum limit of 5 files reached."] },
  },
};

const createTicketInvalidAttachmentSizeResponse = {
  response: {
    status: 409,
    data: { errors: ["Maximum Size of 14.3MB reached."] },
  },
};

// Get Ticket Responses -----------------------------

const getTicketValidResponse = {
  status: 200,
  data: {
    ticket: {
      id: 471075,
      queue: "velianet-support",
      status: "resolved",
      subject: "Test ticket",
      priority: 20,
      requestors: [],
      cc: [],
      created: "2024-04-26T10:24:51+00:00",
      due: null,
      resolved: "2024-04-26T10:28:18+00:00",
      updated: "2024-04-26T10:28:18+00:00",
      server: null,
    },
    history: [
      {
        id: 1,
        content: "string",
        created: "2024-04-26T10:24:52+02:00",
        staffResponse: true,
        attachments: null,
      },
      {
        id: 2,
        content: "Please close this ticket as it is an API test.",
        created: "2024-04-26T10:26:27+02:00",
        staffResponse: true,
        attachments: null,
      },
    ],
  },
};

const getTicketInvalidTicketIdTypeResponse = {
  response: {
    data: {
      type: "https://tools.ietf.org/html/rfc2616#section-10",
      title: "An error occurred",
      status: 404,
      detail: "Not Found",
    },
  },
};

const getTicketInvalidTicketNotFoundResponse = {
  response: {
    status: 404,
    data: { error: "Ticket is not found." },
  },
};

// Velia Config Error Responses -----------------------------

const invalidApiKey = {
  response: {
    status: 401,
    data: "",
  },
};

module.exports = {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectResponse,
  createTicketInvalidAttachmentSizeResponse,
  createTicketInvalidTopicResponse,
  createTicketInvalidMessageResponse,
  createTicketInvalidNumberOfAttachmentsResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdTypeResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
};
