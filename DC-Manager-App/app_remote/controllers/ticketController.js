const zendeskService = require("../services/zendeskService");
const dataCenterServices = require("../services/dataCenterService");
const emailConfig = require("../../config/emailConfig");

exports.createTicket = (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  res.cookie("my_app_params", qs, { httpOnly: true });
  res.render("create-support-ticket", { qs });
};

exports.submitTicket = async (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  res.cookie("my_app_params", qs, { httpOnly: true });

  console.log(req.body);
  console.log(req.files);

  let error_msg = "";
  let success_msg = "";

  try {
    const ticketData = req.body;
    const dataCenter = ticketData.dataCenter;

    if (req.files && req.files.length > 0) {
      ticketData.attachments = req.files;
    } else {
      ticketData.attachments = [];
    }

    console.log("Attachments:", ticketData.attachments);
    

    if (ticketData.submitViaAPI) {
      await dataCenterServices[dataCenter]
        .createTicket(ticketData)
        .then(async (response) => {
          success_msg = `Created ${ticketData.dataCenterName} ticket ${response}`;
          if (dataCenter === "datapacket") {
            success_msg = `Created ${dataCenter} ticket`;
          }
          await handleZendeskFields(
            dataCenter,
            ticketData.zendeskTicketId,
            response,
            true,
            ticketData.zendeskUserEmail
          );
          res.render("create-support-ticket", { qs, success_msg });
        })
        .catch((err) => {
          error_msg = `API Submission Failure: ${err.message}`;
          res.render("create-support-ticket", { qs, error_msg });
        });
    } else {
      await zendeskService
        .createTicket(
          ticketData.subject,
          ticketData.priority,
          ticketData.comment,
          ticketData.zendeskUsername,
          ticketData.zendeskUserEmail,
          ticketData.assigneeId,
          6363707620628,
          6016555588628,
          ["dc_ticket", `${dataCenter}_dc_ticket`],
          ticketData.zendeskUserEmail
        )
        .then(async (response) => {
          success_msg = `Created ${ticketData.dataCenterName} ticket ${response}`;
          await handleZendeskFields(
            dataCenter,
            ticketData.zendeskTicketId,
            response,
            false,
            ticketData.zendeskUserEmail
          );
          setTimeout(async () => {
            await zendeskService.updateTicket(response, ticketData.dataCenterName, emailConfig[dataCenter].email, ticketData.zendeskUserEmail);
          }, 2000);
          setTimeout(async () => {
            await zendeskService.createDcTicketComment(
              response,
              ticketData.comment,
              true,
              ticketData.zendeskUserEmail,
              ticketData.attachments
            );
          }, 4000);
          res.render("create-support-ticket", { qs, success_msg });
        })
        .catch((err) => {
          error_msg = `Email Submission Failure: ${err.message}`;
          res.render("create-support-ticket", { qs, error_msg });
        });
    }
  } catch (error) {
    console.log(error);
    error_msg = `API & Email Submission Failure: ${error}`;
    res.render("create-support-ticket", { qs, error_msg });
  }
};

const handleZendeskFields = async (
  dataCenter,
  zendeskTicketId,
  response,
  submitViaAPI,
  authEmail
) => {
  const baseUrlMap = {
    hundredtb:
      "https://cp.ingenuitycloudservices.com/ticketing/ticket-details/",
    velia: "https://www.velia.net/account/ticket/",
    psychz:
      "https://www.psychz.net/dashboard/client/web/ticket/view?ticket_id=",
    inap: "https://compass.horizoniq.com/support/cases/all/",
    performive: "https://portal.performive.com/support/ticket/",
    i3d: "https://one.i3d.net/Support/Tickets/T-",
    datapacket: "https://app.datapacket.com/support/request/",
    zendesk: "https://unity3d.zendesk.com/agent/tickets/",
  };

  let url = baseUrlMap[dataCenter] + response;

  if (dataCenter === "datapacket") {
    setTimeout(async () => {
      const latestTicket = await dataCenterServices["datapacket"].getTickets(
        0,
        1
      );
      const latestTicketId = latestTicket[0].id;
      url = baseUrlMap[dataCenter] + latestTicketId;

      await updateDcTicketFields(zendeskTicketId, url, authEmail);
    }, 3500);
  } else {
    if (!submitViaAPI) {
      url = baseUrlMap.zendesk + response;
    }
    await updateDcTicketFields(zendeskTicketId, url, authEmail);
  }
};

const updateDcTicketFields = async (zendeskTicketId, url, authEmail) => {
  const dcTicketField1 = await zendeskService.getCustomField(
    zendeskTicketId,
    12315780559636,
    authEmail
  );
  if (!dcTicketField1) {
    await zendeskService.updateCustomField(
      zendeskTicketId,
      12315780559636,
      url,
      authEmail
    );
    return;
  }

  const dcTicketField2 = await zendeskService.getCustomField(
    zendeskTicketId,
    26482193950356,
    authEmail
  );
  if (!dcTicketField2) {
    await zendeskService.updateCustomField(
      zendeskTicketId,
      26482193950356,
      url,
      authEmail
    );
    return;
  }

  const dcTicketField3 = await zendeskService.getCustomField(
    zendeskTicketId,
    26482204680084,
    authEmail
  );
  if (!dcTicketField3) {
    await zendeskService.updateCustomField(
      zendeskTicketId,
      26482204680084,
      url,
      authEmail
    );
  } else {
    await zendeskService.createTicketComment(
      zendeskTicketId,
      url,
      false,
      authEmail
    );
  }
};
