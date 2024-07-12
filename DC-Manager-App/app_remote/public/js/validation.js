import { messageTemplates, getTemplateVars } from './template.js';

export function validateForm() {
  const dataCenter = document.querySelector("#data-center");
  const issueCategory = document.querySelector("#issue-category");
  const zendeskTicketId = document.querySelector("#zendesk-ticket-id");
  const subject = document.querySelector("#subject");
  const priorityLevel = document.querySelector("#priority-level");
  const message = document.querySelector("#body");
  const serviceId = document.querySelector("#service-id");
  const ipAddress = document.querySelector("#ip-address");
  const osVersion = document.querySelector("#os-version");
  const logs = document.querySelector("#logs");

  const dataCenterValue = dataCenter ? dataCenter.value : "";
  const issueCategoryValue = issueCategory ? issueCategory.value : "";
  const zendeskTicketIdValue = zendeskTicketId
    ? zendeskTicketId.value.trim()
    : "";
  const subjectValue = subject ? subject.value.trim() : "";
  const priorityLevelValue = priorityLevel ? priorityLevel.value : "";
  const messageValue = message ? message.value.trim() : "";
  const serviceIdValue = serviceId ? serviceId.value.trim() : "";
  const ipAddressValue = ipAddress ? ipAddress.value.trim() : "";
  const osVersionValue = osVersion ? osVersion.value : "";
  const logsValue = logs ? logs.value.trim() : "";

  const templateVars = issueCategoryValue
    ? getTemplateVars(messageTemplates[issueCategoryValue])
    : [];

  let isValid = true;

  if (!dataCenterValue || dataCenterValue === "Select Provider") {
    setErrorFor(dataCenter, "Data center needs to be selected");
    isValid = false;
  } else {
    setSuccessFor(dataCenter);
  }

  if (!issueCategoryValue || issueCategoryValue === "Select Issue Category") {
    setErrorFor(issueCategory, "Issue Category needs to be selected");
    isValid = false;
  } else {
    setSuccessFor(issueCategory);
  }

  if (!zendeskTicketIdValue) {
    setErrorFor(zendeskTicketId, "Zendesk Ticket ID cannot be blank");
    isValid = false;
  } else if (!/^\d+$/.test(zendeskTicketIdValue)) {
    setErrorFor(zendeskTicketId, "Zendesk Ticket ID must be a number");
    isValid = false;
  } else if (zendeskTicketIdValue.length < 7) {
    setErrorFor(
      zendeskTicketId,
      "Zendesk Ticket ID must be 7 characters or more"
    );
    isValid = false;
  } else {
    setSuccessFor(zendeskTicketId);
  }

  if (subject) {
    if (!subjectValue) {
      setErrorFor(subject, "Subject cannot be blank");
      isValid = false;
    } else {
      setSuccessFor(subject);
    }
  }

  if (priorityLevel) {
    if (!priorityLevelValue || priorityLevelValue === "Select Priority Level") {
      setErrorFor(priorityLevel, "Priority Level needs to be selected");
      isValid = false;
    } else {
      setSuccessFor(priorityLevel);
    }
  }

  if (serviceId) {
    if (serviceIdValue.length >= 1) {
      if (isNaN(parseInt(serviceIdValue))) {
        setErrorFor(serviceId, "Service ID must be a number");
        isValid = false;
      } else {
        setSuccessFor(serviceId);
      }
    }
  }

  if (templateVars.includes("ipAddress")) {
    if (!ipAddressValue) {
      setErrorFor(ipAddress, "IP Address cannot be blank for this issue");
      isValid = false;
    } else {
      const ipAddressArray = ipAddressValue.split("\n").map((ip) => ip.trim());
      const invalidIPs = ipAddressArray.filter((ip) => !isValidIPAddress(ip));
      if (invalidIPs.length > 0) {
        setErrorFor(
          ipAddress,
          `Invalid IP address(es) found: ${invalidIPs.join(", ")}`
        );
        isValid = false;
      } else {
        setSuccessFor(ipAddress);
      }
    }
  }

  if (templateVars.includes("osVersion")) {
    if (!osVersionValue) {
      setErrorFor(osVersion, "OS Version needs to be selected");
      isValid = false;
    } else {
      setSuccessFor(osVersion);
    }
  }

  if (templateVars.includes("logs")) {
    if (!logsValue) {
      setErrorFor(logs, "Logs cannot be blank for this issue");
      isValid = false;
    } else {
      setSuccessFor(logs);
    }
  }

  if (!messageValue) {
    setErrorFor(message, "Message cannot be blank");
    isValid = false;
  } else {
    setSuccessFor(message);
  }

  return isValid;
}

export function validateFileCount(dataCenter, fileCount, fileInput) {
  const maxFiles = getMaxFiles(dataCenter);
  if (fileCount > maxFiles) {
    setErrorFor(fileInput, `Maximum limit of ${maxFiles} file(s) reached.`);
    return false;
  } else {
    setSuccessFor(fileInput);
    return true;
  }
}

function getMaxFiles(dataCenter) {
  switch (dataCenter) {
    case "hundredtb":
      return 2;
    case "velia":
      return 5;
    default:
      return 1;
  }
}

export function isValidIPAddress(ip) {
  const ipPattern =
    /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
  return ipPattern.test(ip);
}

export function setErrorFor(input, message) {
  const formControl = input.parentElement;
  const small = formControl.querySelector("small");
  small.innerText = message;
  formControl.className = "form-control error";
}

export function setSuccessFor(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control success";
}

export function resetAlert(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control";
}
