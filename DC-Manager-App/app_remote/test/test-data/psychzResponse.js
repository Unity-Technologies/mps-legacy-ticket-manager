// Create Ticket Responses -----------------------------

const createTicketValidResponse = {
  status: 200,
  data: { status: true, data: { status: true, ticket_id: "4327900" } },
};

const createTicketInvalid500Response = {
  status: 500,
  message: "Error message",
  data: null,
};

const createTicketInvalidSubjectResponse = {
  response: {
    status: 400,
    data: {
      status: 400,
      error: {
        code: "400",
        message: "Invalid request parameter.",
        errors: [
          {
            code: "400",
            field: "subject",
            description: "A valid subject is required.",
          },
        ],
      },
    },
  },
};

const createTicketInvalidDepartmentIdResponse = {
  response: {
    status: 400,
    data: {
      status: 400,
      error: {
        code: "400",
        message: "Invalid request parameter.",
        errors: [
          {
            code: "400",
            field: "department_id",
            description: "A valid integer is required.",
          },
        ],
      },
    },
  },
};

const createTicketInvalidMessageResponse = {
  response: {
    status: 400,
    data: {
      status: 400,
      error: {
        code: "400",
        message: "Invalid request parameter.",
        errors: [
          {
            code: "400",
            field: "message",
            description: "A valid message is required.",
          },
        ],
      },
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
    status: true,
    data: {
      ticket_id: "4311829",
      department: "Psychz Support",
      submitted: "2024-04-30 09:44:42",
      priority: "Normal",
      service: "0",
      device: "0",
      status: "Closed",
      ticket_post_list: [
        {
          ticket_id: "4311829",
          ticket_post_id: "14282075",
          timestamp: "2024-04-30 09:44:42",
          body: "Test body, please close this ticket.",
          subject: "Test Ticket with attachment",
          source_name: "client",
          type: "Escalate to Manager",
          author: "Unity Technologies SF ",
        },
      ],
    },
  },
};

const getTicketInvalidTicketIdTypeResponse = {
  response: {
    status: 400,
    data: {
      status: false,
      error: {
        code: "400",
        message: "Invalid request parameter.",
        errors: [
          {
            code: "400",
            field: "ticket_id",
            description: "A valid ticket id is required.",
          },
        ],
      },
    },
  },
};

const getTicketInvalidTicketNotFoundResponse = {
  response: {
    status: 404,
    data: {
      status: false,
      error: {
        code: "404",
        message: "The request params are invalid.",
        errors: [
          {
            code: "404",
            field: "ticket_id",
            description: "Invalid ticket id.",
          },
        ],
      },
    },
  },
};

// Velia Config Error Responses -----------------------------

const invalidApiKey = {
  response: {
    status: 401,
    data: {
      status: false,
      error: {
        code: 401,
        message: "Unauthorised access request.",
        errors: [
          {
            code: 401,
            field: "access_token",
            description: "Invalid access token.",
          },
        ],
      },
    },
  },
};

const invalidAccessUsername = {
  response: {
    status: 400,
    data: {
      status: 400,
      error: {
        code: "400",
        message: "Invalid request parameter.",
        errors: [
          {
            code: "400",
            field: "access_username",
            description: "A valid username is required.",
          },
        ],
      },
    },
  },
};

module.exports = {
  createTicketValidResponse,
  createTicketInvalid500Response,
  createTicketInvalidSubjectResponse,
  createTicketInvalidAttachmentSizeResponse,
  createTicketInvalidDepartmentIdResponse,
  createTicketInvalidMessageResponse,
  createTicketInvalidNumberOfAttachmentsResponse,
  getTicketValidResponse,
  getTicketInvalidTicketIdTypeResponse,
  getTicketInvalidTicketNotFoundResponse,
  invalidApiKey,
  invalidAccessUsername,
};
