const axios = require("axios");
const config = require("../../config/apiConfig");
const emailConfig = require("../../config/emailConfig");

const makeZendeskRequest = async (
  endpoint,
  method = "GET",
  data = null,
  authEmail,
  headers = {
    "Content-Type": "application/json",
  }
) => {
  // Construct the full URL
  const url = `${config.zendesk.apiUrl}/${endpoint}`;

  // Set request headers
  // const headers = {
  //   "Content-Type": "application/json",
  // };

  try {
    // Make the Axios request to the Zendesk API
    const response = await axios.request({
      method,
      url,
      headers,
      auth: {
        username: `${authEmail}/token`,
        password: `${config.zendesk.apiToken}`,
      },
      data,
    });

    // Return the JSON response
    return response.data;
  } catch (error) {
    // Handle any errors
    throw new Error(`Error making Zendesk request: ${error.response.data}`);
  }
};

const getTicket = async (ticketId, authEmail) => {
  try {
    // Make a request to get the ticket details
    const ticketDetails = await makeZendeskRequest(
      `tickets/${ticketId}`,
      "GET",
      null,
      authEmail
    );
    return ticketDetails;
  } catch (error) {
    // Handle any errors
    throw new Error(`Error getting Zendesk ticket by ID: ${error.message}`);
  }
};

const getCustomField = async (ticketId, customFieldId, authEmail) => {
  const ticketDetails = await getTicket(ticketId, authEmail);
  const customFields = ticketDetails.ticket.custom_fields;
  const customField = customFields.find((cf) => cf.id === customFieldId);
  return customField ? customField.value : undefined;
};

const updateCustomField = async (
  ticketId,
  customFieldId,
  updateValue,
  authEmail
) => {
  try {
    // Define payload with custom field update
    const payload = {
      ticket: {
        custom_fields: [{ id: customFieldId, value: updateValue }],
      },
    };

    return await makeZendeskRequest(
      `tickets/${ticketId}`,
      "PUT",
      payload,
      authEmail
    );
  } catch (error) {
    throw new Error(
      `Error updating Zendesk ticket custom field: ${error.message}`
    );
  }
};

const getTicketComments = async (ticketId, authEmail) => {
  try {
    const params = {
      include: "",
      include_inline_images: false,
    };

    // Make a request to get the ticket details
    const ticketComments = await makeZendeskRequest(
      `tickets/${ticketId}/comments`,
      "GET",
      params,
      authEmail
    );
    return ticketComments.comments;
  } catch (error) {
    // Handle any errors
    throw new Error(
      `Error getting Zendesk ticket comments for ${ticketId}: ${error}`
    );
  }
};

const uploadAttachment = async (attachment, authEmail) => {
  try {
    const data = attachment.buffer;

    const headers = { "Content-Type": attachment.mimetype };

    // Make a request to get the ticket details
    const response = await makeZendeskRequest(
      `uploads.json?filename=${attachment.originalname}`,
      "POST",
      data,
      authEmail,
      headers
    );
    return response.upload.token;
  } catch (error) {
    // Handle any errors
    throw new Error(
      `Error uploading attachment to Zendesk: ${error}`
    );
  }
};

const createTicket = async (
  subject,
  priority,
  comment,
  requesterName,
  requesterEmail,
  assigneeId,
  groupId,
  ticketFormId,
  tags,
  authEmail
) => {
  try {
    // Define payload with custom field update
    const payload = {
      ticket: {
        subject: subject,
        priority: priority, // Allowed values are "urgent", "high", "normal", or "low".
        comment: {
          body: comment,
        },
        requester: {
          name: requesterName,
          email: requesterEmail,
        },
        recipient: requesterEmail,
        email_ccs: [{ user_email: emailConfig.multiplayerSuppliers.email }],
        assignee_id: assigneeId,
        group_id: groupId,
        ticket_form_id: ticketFormId,
        tags: tags,
      },
    };

    const response = await makeZendeskRequest(
      "tickets",
      "POST",
      payload,
      authEmail
    );

    return response.ticket.id;
  } catch (error) {
    throw new Error(`Error creating Zendesk ticket: ${error}`);
  }
};

const createTicketComment = async (ticketId, comment, isPublic, authEmail) => {
  try {
    // Define payload with custom field update
    const payload = {
      ticket: {
        comment: {
          body: comment,
          public: isPublic,
        },
      },
    };

    return await makeZendeskRequest(
      `tickets/${ticketId}`,
      "PUT",
      payload,
      authEmail
    );
  } catch (error) {
    throw new Error(
      `Error adding comment to Zendesk ticket ${ticketId}: ${error.message}`
    );
  }
};

const createDcTicketComment = async (
  ticketId,
  comment,
  isPublic,
  authEmail,
  attachments = []
) => {
  try {
    // Define payload with custom field update
    const payload = {
      ticket: {
        comment: {
          body: comment,
          public: isPublic,
        },
        email_ccs: [{ user_email: emailConfig.multiplayerSuppliers.email }],
      },
    };

    if (attachments.length > 0) {
      attachments.forEach((attachment) => {
        uploadAttachment(attachment, authEmail).then((response) => {
          payload.ticket.comment.uploads = [response];
          console.log(payload.ticket.comment.uploads);
          setTimeout(async () => {
            return await makeZendeskRequest(
              `tickets/${ticketId}`,
              "PUT",
              payload,
              authEmail
            );
          }, 3000);
        });
      });
    } else {
      return await makeZendeskRequest(
        `tickets/${ticketId}`,
        "PUT",
        payload,
        authEmail
      );
    }
  } catch (error) {
    throw new Error(
      `Error adding comment to Zendesk ticket ${ticketId}: ${error.message}`
    );
  }
};

const updateTicket = async (ticketId, requesterName, requesterEmail, authEmail) => {
  try {
    // Define payload with custom field update
    const payload = {
      ticket: {
        requester: {
          name: requesterName,
          email: requesterEmail,
        },
        status: "hold"
      },
    };

    return await makeZendeskRequest(
      `tickets/${ticketId}`,
      "PUT",
      payload,
      authEmail
    );
  } catch (error) {
    throw new Error(
      `Error updating Zendesk ticket ${ticketId}: ${error.message}`
    );
  }
};


const getGroups = async (authEmail) => {
  try {
    // Make a request to get the ticket details
    const currentGroups = await makeZendeskRequest(
      "groups",
      "GET",
      null,
      authEmail
    );
    console.log(currentGroups);
    return currentGroups;
  } catch (error) {
    // Handle any errors
    throw new Error(`Error getting Zendesk ticket by ID: ${error.message}`);
  }
};

const verifyAuth = async (authEmail, userId) => {
  try {
    // Make a simple request to verify authentication
    await makeZendeskRequest(`users/${userId}.json`, "GET", null, authEmail);
    return true;
  } catch (error) {
    console.error("Error verifying Zendesk auth:", error);
    return false;
  }
};

module.exports = {
  makeZendeskRequest,
  getTicket,
  getCustomField,
  updateCustomField,
  getTicketComments,
  createTicket,
  createTicketComment,
  createDcTicketComment,
  updateTicket,
  getGroups,
  verifyAuth,
};
