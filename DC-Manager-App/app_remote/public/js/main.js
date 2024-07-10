let client; // Declare the client variable globally

let zendeskUsername;

document.addEventListener("DOMContentLoaded", function() {
  client = ZAFClient.init();

  client.invoke('resize', { width: '100%', height: '380px' });

  function notifyZendeskFailure(message) {
    client.invoke("notify", message, "error");
  }

  client.get("currentUser.email").then(function (data) {
    const zendeskUserEmail = data["currentUser.email"];
    document.querySelector("#zendesk-user-email").value = zendeskUserEmail;
  });

  client.get("currentUser.name").then(function (data) {
    zendeskUsername = data["currentUser.name"];
    document.querySelector("#zendesk-username").value = zendeskUsername;
  });

  client.get("currentUser.id").then(function (data) {
    const zendeskUserId = data["currentUser.id"];
    document.querySelector("#zendesk-user-id").value = zendeskUserId;
  });

  client.get("ticket.id").then(function(data) {
    document.querySelector("#zendesk-ticket-id").value = data["ticket.id"];
  }).catch(function(error) {
    console.error("Error getting ticket ID:", error);
    notifyZendeskFailure(`Error getting ticket ID: ${error}`);
  });

  const bodyTextarea = document.getElementById("body");
  const ipAddressContainer = document.getElementById("ip-address-container");
  const osVersionContainer = document.getElementById("os-version-container");
  const logsContainer = document.getElementById("logs-container");


  const showOrHideElements = (issueCategory) => {
    // Hide all optional input containers by default
    ipAddressContainer.classList.add("hidden");
    osVersionContainer.classList.add("hidden");
    logsContainer.classList.add("hidden");

    // Determine which elements to show based on the selected issue category
    if (issueCategory.includes("ipAddress")) {
      ipAddressContainer.classList.remove("hidden");
    } else {
      ipAddressContainer.classList.remove("error");
      ipAddressContainer.classList.remove("success");
    }

    if (issueCategory.includes("osVersion")) {
        osVersionContainer.classList.remove("hidden");
    } else {
      osVersionContainer.classList.remove("error");
      osVersionContainer.classList.remove("success");
    }
    if (issueCategory.includes("logs")) {
        logsContainer.classList.remove("hidden");
    } else {
      logsContainer.classList.remove("error");
      logsContainer.classList.remove("success");
    }
  };

  const messageTemplates = {
    "Low CPU Frequency": `Hi Support,\n\nThe machine(s) at \n\n{ipAddress}\n\nis reporting low CPU frequency. Here are the following BIOS Settings that need to be modified:\n\nBoot Performance Mode: Turbo Performance\nIntel® SpeedStep™:  Enabled\nTurbo Mode: Enabled\nC-States: Disabled\n\nIf you need assistance in locating any of the BIOS settings, please provide the motherboard model and a screenshot of the options and we can assist you in locating the options to change.\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nPlease let us know what adjustments you've made and when it's safe to add the machine back to production.\n\nThanks!\n{{ticket.submitter.name}}`,
    "Machine reporting unreachable": `Hi Support,\n\nThe following list of the machine(s) has gone unreachable from our side.\n\n{ipAddress}\n\nPlease investigate the cause. If there are problems with the OS please clarify what the screen is showing by checking via IPMI. Once and only if you have confirmed the state of what the screen is showing, you can reboot if necessary but provide us with any errors in the IPMI logs as well.\n\nThe machine has been taken out of production so feel free to reboot as necessary to diagnose this. DOWNTIME IS ACCEPTED\n\nThanks!\n{{ticket.submitter.name}}`,
    "CPU Governor Errors & OS CPU Scaling": `Hi Support,\n\nThe machine(s) \n\n{ipAddress}\n\nis showing a CPU scaling error.\n\ncat: /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor: No such file or directory\n{ipAddress} C-State Enabled - Must be Disabled  - Gov:\n\nPlease ensure c-state is disabled\nPlease ensure Turbo Mode is enabled\nPlease ensure EIST / Speed Step is enabled (OS DBPM on Dell machines)\nDowntime is accepted,\nThanks!\n{{ticket.submitter.name}}`,
    "CPU high temperature": `Hi Support,\n\nWe are seeing very high CPU temperatures on \n\n{ipAddress}\n\nWhile running on high loads. Here is the logs that show that information:\n{logs}\n\nWould you be able to check the chassis fan speeds (set to max), CPU temperatures, and the BIOS performance configuration (performance mode should be enabled) to make sure everything is configured correctly?\n\nTo assist in your investigation, here is a list of potential causes behind the high CPU temperatures:\n- BIOS settings set to power saver mode= Please Disable power save\n- Capped fan speeds= Please set to max\n- Faulty RAM= Please let us know if it needs replacing\n- PSU kicking the machine into Safety / Emergency Mode= Please replace the faulty psu\n- Outdated firmware= please update them\n- Disable C-states in bios.\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nThanks!\n{{ticket.submitter.name}}`,
    "RAM Issues": `Hi Support,\n\nThe machine(s) at \n\n{ipAddress}\n\nis running into RAM errors. Please replace the affected RAM on this machine indicated in the dmesg errors below:\n\n{logs}\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nPlease let us know when the RAM has been replaced so we can check for any new errors and add the machine back to production.\n\nThanks!\n{{ticket.submitter.name}}`,
    "Disk shows I/O errors": `Hi Team,\n\nThe machine(s) at \n\n{ipAddress}\n\nis running into disk I/O errors. Please run a hard drive test to see if there are any issues there. If there are, please replace the disk and reinstall the OS. If the hard drive test confirms that there aren't any issues, please reinstall the OS.\n\n{logs}\n\nDOWNTIME AND DATA LOSS IS ACCEPTED.\n\nThe OS will be {osVersion}\nPlease make sure the IP remains the same. \nPlease configure our SSH key and disable password authentication.\n\nThanks!\n{{ticket.submitter.name}}`,
    "Read-only file system error": `Hi Team,\n\nThe machine(s) at \n\n{ipAddress}\n\nis running into read-only filesystem errors. Please run a hard drive test to see if there are any issues there. If there are, please replace the disk and reinstall the OS. If the hard drive test confirms that there aren't any issues, please reinstall the OS.\n\n{logs}\n\nDOWNTIME AND DATA LOSS IS ACCEPTED.\n\nThe OS will be {osVersion}\nPlease make sure the IP remains the same. \nPlease configure our SSH key and disable password authentication.\n\nThanks!\n{{ticket.submitter.name}}`,
    "Abuse Report": `Hi @here! ZD-{zendeskTicketId}\n\nWe have received an abuse report for the machine(s):\n\n{ipAddress}\n\nIt is possible that this is a case of IP spoofing but please could you ask your sec team to investigate this machine for rogue processes/elements?\n\nThanks!\n{{ticket.submitter.name}}`,
    "Network Interface Card Error": `Hi Support,\n\n{ipAddress}\n\nThe above machines' network card has registered multiple errors. Please can you perform an extended network test on this.\n\n{logs}\n\nThanks!\n{{ticket.submitter.name}}`,
    "BIOS Settings Error": `Hey Support,\n\nThe machine(s) \n\n{ipAddress}\n\nneeds to have their BIOS settings set correctly. Please make sure the following are enabled in BIOS:\n\nBoot Performance Mode: Turbo Performance\nIntel® SpeedStep™:  Enabled\nTurbo Mode: Enabled\nC-States: Disabled\n\nIf you need assistance in locating any of the BIOS settings, please provide the motherboard model and a screenshot of the options and we can assist you in locating the options to change.\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nPlease let us know what adjustments you've made and when it's safe to add the machine back to production.\n\nThanks!\n{{ticket.submitter.name}}`,
    "OS Reinstall": `Hey Support,\n\nCan you please reinstall the OS on the machine(s) below:\n\n{ipAddress}\n\nOS: {osVersion}\n\nDowntime/dataloss are accepted\nPlease make sure the IP remains the same. \nPlease configure our SSH key and disable password authentication.\n\nThanks!\n{{ticket.submitter.name}}`
  };

  document.getElementById("data-center").addEventListener("change", function() {
    const selectedDataCenter = this.value;
    const dataCentersWithoutAPI = ['zenlayer', 'hivelocity', 'rapidswitch', 'serversdotcom', 'gcore', 'maxihost', 'vultr', 'leaseweb', 'enzu'];
    document.querySelector("#data-center-name").value = this.options[this.selectedIndex].innerText;

    if (selectedDataCenter) {
      client.invoke('resize', { width: '100%', height: '950px' });

      const url = dataCentersWithoutAPI.includes(selectedDataCenter) 
        ? `/tickets/partials/email` 
        : `/tickets/partials/${selectedDataCenter}`;
        
      fetch(url)
        .then(response => response.text())
        .then(html => {
          document.getElementById("dataCenterForm").innerHTML = html;
          document.getElementById("form-title").innerText = `New ${this.options[this.selectedIndex].innerText} Support Ticket`;

          // Now that the form is dynamically loaded, add the event listener and validation logic
          addFormEventListenerAndValidation();

          if (document.querySelector('#subject')) {
            document.querySelector('#subject').addEventListener('input', function () {
              if (!this.value) {
                setErrorFor(this, 'Subject cannot be blank');
              } else {
                setSuccessFor(this);
              }
            })
          }

          if (document.querySelector('#priority-level')) {
            document.querySelector('#priority-level').addEventListener('change', function () {
              if (!this.value || this.value === "Select Priority Level") {
                setErrorFor(this, 'Priority Level needs to be selected');
              } else {
                setSuccessFor(this);
              }
            })
          }

          if (document.querySelector('#service-id')) {
            document.querySelector('#service-id').addEventListener('input', function () {
              if (this.value.length >= 1) {
                if (isNaN(parseInt(this.value))) {
                  setErrorFor(this, 'Service ID must be a number');
                } else {
                  setSuccessFor(this);
                }
              } else {
                resetAlert(this);
              }
            })
          }

          document.querySelector('#body').addEventListener('input', function () {
            if (!this.value) {
              setErrorFor(this, 'Message cannot be blank');
            } else {
              setSuccessFor(this);
            }
          })
          if (document.getElementById('file-button')) {
            addFileButtonListener();
          }
          
          const issueCategorySelect = document.getElementById("issue-category");
          const dataCenterSelect = document.getElementById("data-center");
          const bodyTextarea = document.getElementById("body");
          const ipAddressContainer = document.getElementById("ip-address-container");
          const ipAddressTextarea = document.getElementById("ip-address");
          const osVersionContainer = document.getElementById("os-version-container");
          const osVersionSelect = document.getElementById("os-version");
          const logsContainer = document.getElementById("logs-container");
          const logsTextarea = document.getElementById("logs");
          const zendeskTicketIdInput = document.getElementById("zendesk-ticket-id");
        
          const showOrHideElements = (issueCategory) => {
            // Hide all optional input containers by default
            ipAddressContainer.classList.add("hidden");
            osVersionContainer.classList.add("hidden");
            logsContainer.classList.add("hidden");
        
            // Determine which elements to show based on the selected issue category
            if (issueCategory.includes("ipAddress")) {
              ipAddressContainer.classList.remove("hidden");
            } else {
              ipAddressContainer.classList.remove("error");
              ipAddressContainer.classList.remove("success");
            }

            if (issueCategory.includes("osVersion")) {
                osVersionContainer.classList.remove("hidden");
            } else {
              osVersionContainer.classList.remove("error");
              osVersionContainer.classList.remove("success");
            }
            if (issueCategory.includes("logs")) {
                logsContainer.classList.remove("hidden");
            } else {
              logsContainer.classList.remove("error");
              logsContainer.classList.remove("success");
            }
          };
        
          const getTemplateVars = (template) => {
            const vars = [];
            const regex = /\{(\w+)\}/g;
            let match;
            while ((match = regex.exec(template)) !== null) {
                vars.push(match[1]);
            }
            return vars;
          };
        
          const replaceTemplateVars = (template, vars) => {
              let result = template;
              for (const [key, value] of Object.entries(vars)) {
                  const regex = new RegExp(`\\{${key}\\}`, 'g');
                  result = result.replace(regex, value);
              }
              return result;
          };
        
          const updateMessageBody = () => {
              const issueCategory = issueCategorySelect.value || "{issueCategory}";
              const dataCenter = dataCenterSelect.value;
              const ipAddress = ipAddressTextarea.value || "{ipAddress}";
              const osVersion = osVersionSelect.value || "{osVersion}";
              const logs = logsTextarea.value || "{logs}";
              const zendeskTicketId = zendeskTicketIdInput.value || "{zendeskTicketId}";
              let ipAddressArray = ipAddress.split('\n').map(ip => ip.trim());
              let ipAddressString;
              if(ipAddressArray.length > 3) {
                ipAddressString = "Multiple Machines"
              } else {
                ipAddressString = ipAddress.replace(/\n/g, ', ').trim();
              }
        
              const template = messageTemplates[issueCategory];
              if (template) {
                  const templateVars = {
                      ipAddress,
                      osVersion,
                      logs,
                      zendeskTicketId,
                      "{ticket.submitter.name}": dataCentersWithoutAPI.includes(dataCenter) ? "{{ticket.submitter.name}}" : document.querySelector("#zendesk-username").value
                  };
                  const message = replaceTemplateVars(template, templateVars);
                  bodyTextarea.value = message;
              } else {
                  bodyTextarea.value = "";
              }

              if(document.querySelector('#subject')) {
                if(issueCategory !== "Custom Issue" && issueCategory !== "{issueCategory}") {
                  document.querySelector('#subject').value = `${issueCategory} - ${ipAddressString} - ZD-${zendeskTicketId}`;
                }
              }
          };

          document.querySelector('#issue-category').addEventListener('change', function () {
            const selectedIssueCategory = this.value;
            if (!selectedIssueCategory || selectedIssueCategory === "Select Issue Category") {
              setErrorFor(this, 'Issue Category needs to be selected');
            } else {
              setSuccessFor(this);
            }
            
            if (selectedIssueCategory === "Custom Issue") {
                bodyTextarea.value = "";
                document.querySelector('#subject').value = '';
                showOrHideElements([]);
            } else {
                const templateVars = getTemplateVars(messageTemplates[selectedIssueCategory]);
                showOrHideElements(templateVars);
                updateMessageBody();
            }
          });

          dataCenterSelect.addEventListener("change", updateMessageBody);
          ipAddressTextarea.addEventListener("input", updateMessageBody);
          osVersionSelect.addEventListener("change", updateMessageBody);
          logsTextarea.addEventListener("input", updateMessageBody);
          zendeskTicketIdInput.addEventListener("input", updateMessageBody);

          updateMessageBody();

          if(issueCategorySelect.value) {
            const templateVars = getTemplateVars(messageTemplates[issueCategorySelect.value]);
            showOrHideElements(templateVars);
          }
          
        })
        .catch(function(error) {
          console.error("Error fetching partial:", error);
          notifyZendeskFailure(`Error fetching partial: ${error}`);
        });
    } else {
      document.getElementById("dataCenterForm").innerHTML = "";
    }
  });

  document.querySelector('#zendesk-ticket-id').addEventListener('input', function () {
    if (!this.value) {
      setErrorFor(this, 'Zendesk Ticket ID cannot be blank');
    } else if (!/^\d+$/.test(this.value)) {
      setErrorFor(this, 'Zendesk Ticket ID must be a number');
    } else if (this.value.length < 7) {
      setErrorFor(this, 'Ticket ID must be 7 digits or more');
    } else {
      setSuccessFor(this);
    }
  })

  document.querySelector('#ip-address').addEventListener('input', function () {
    const templateVars = document.querySelector('#issue-category').value ? getTemplateVars(messageTemplates[document.querySelector('#issue-category').value]) : [];
    if (templateVars.includes('ipAddress')) {
      if (!this.value) {
        setErrorFor(this, 'IP Address cannot be blank for this issue');
      } else {
        const ipAddressArray = this.value.split('\n').map(ip => ip.trim());
        const invalidIPs = ipAddressArray.filter(ip => !isValidIPAddress(ip));
        if (invalidIPs.length > 0) {
          setErrorFor(this, `Invalid IP address(es) found: ${invalidIPs.join(', ')}`);
          isValid = false;
        } else {
          setSuccessFor(this);
        }
      }
    }
  });

  document.querySelector('#os-version').addEventListener('change', function () {
    const templateVars = document.querySelector('#issue-category').value ? getTemplateVars(messageTemplates[document.querySelector('#issue-category').value]) : [];
    if (templateVars.includes('osVersion')) {
      if ((!this.value || this.value === "Select OS Version")) {
        setErrorFor(this, 'OS Version needs to be selected');
      } else {
        setSuccessFor(this);
      }
    }
  });

  document.querySelector('#logs').addEventListener('input', function () {
    const templateVars = document.querySelector('#issue-category').value ? getTemplateVars(messageTemplates[document.querySelector('#issue-category').value]) : [];
    if (templateVars.includes("logs")) {
      if (!this.value) {
        setErrorFor(this, 'Logs cannot be blank for this issue');
      } else {
        setSuccessFor(this);
      }
    }
  });

  function addFileButtonListener() {
    const fileButton = document.getElementById('file-button');
    const fileInput = document.getElementById('attachment');
    const fileList = document.getElementById('file-list');

    if (!fileButton) {
      console.error('fileButton not found');
      return;
    }
    if (!fileInput) {
      console.error('fileInput not found');
      return;
    }
    if (!fileList) {
      console.error('fileList not found');
      return;
    }

    fileButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      const files = fileInput.files;
      displayFileNames(files, fileList, fileInput);
    });
  }

  let allFiles = [];

  function displayFileNames(files, fileList, fileInput) {
    if (fileList) {
      // Add new files to the global array
      const newFiles = [...files];
      allFiles = allFiles.concat(newFiles);

      const selectedDataCenter = document.querySelector("#data-center").value;
      const isValid = validateFileCount(selectedDataCenter, allFiles.length, fileInput);

      if (!isValid) {
        allFiles = allFiles.slice(0, allFiles.length - newFiles.length);
        return;
      }

      // Clear the current file list display
      fileList.innerHTML = '';
      const ul = document.createElement('ul');

      // Iterate over all files in the global array and display them
      allFiles.forEach((file, i) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = file.name;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';

        removeButton.addEventListener('click', (e) => {
          e.preventDefault();

          // Remove the file from the global array
          allFiles.splice(i, 1);

          // Update the file input's files
          const dt = new DataTransfer();
          allFiles.forEach(f => dt.items.add(f));
          fileInput.files = dt.files;

          // Update the display
          displayFileNames([], fileList, fileInput);

          // Reset alert if no files are left
          if (allFiles.length === 0) {
            resetAlert(fileInput);
          }
        });

        li.appendChild(span);
        li.appendChild(removeButton);
        ul.appendChild(li);
      });

      fileList.appendChild(ul);

      // Update the file input's files to match the global array
      const dt = new DataTransfer();
      allFiles.forEach(file => dt.items.add(file));
      fileInput.files = dt.files;
    }
  }

  function getMaxFiles(dataCenter) {
    switch (dataCenter) {
      case 'hundredtb':
        return 2;
      case 'velia':
        return 5;
      default:
        return 1;
    }
  }

  function validateFileCount(dataCenter, fileCount, fileInput) {
    const maxFiles = getMaxFiles(dataCenter);
    if (fileCount > maxFiles) {
      setErrorFor(fileInput, `Maximum limit of ${maxFiles} file(s) reached.`);
      return false;
    } else {
      setSuccessFor(fileInput);
      return true;
    }
  }
  

  function addFormEventListenerAndValidation() {
    const form = document.querySelector("#form");
    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (checkInputs()) {
          form.submit();          
        }
      });
    }
  }

  function checkInputs() {
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

    const dataCenterValue = dataCenter ? dataCenter.value : '';
    const issueCategoryValue = issueCategory ? issueCategory.value : '';
    const zendeskTicketIdValue = zendeskTicketId ? zendeskTicketId.value.trim() : '';
    const subjectValue = subject ? subject.value.trim() : '';
    const priorityLevelValue = priorityLevel ? priorityLevel.value : '';
    const messageValue = message ? message.value.trim() : '';
    const serviceIdValue = serviceId ? serviceId.value.trim() : '';
    const ipAddressValue = ipAddress ? ipAddress.value.trim() : '';
    const osVersionValue = osVersion ? osVersion.value : '';
    const logsValue = logs ? logs.value.trim() : '';

    const templateVars = issueCategoryValue ? getTemplateVars(messageTemplates[issueCategoryValue]) : [];

    let isValid = true;

    if (!dataCenterValue || dataCenterValue === "Select Provider") {
      setErrorFor(dataCenter, 'Data center needs to be selected');
      isValid = false;
    } else {
      setSuccessFor(dataCenter);
    }

    if (!issueCategoryValue || issueCategoryValue === "Select Issue Category") {
      setErrorFor(issueCategory, 'Issue Category needs to be selected');
      isValid = false;
    } else {
      setSuccessFor(issueCategory);
    }

    if (!zendeskTicketIdValue) {
      setErrorFor(zendeskTicketId, 'Zendesk Ticket ID cannot be blank');
      isValid = false;
    } else if (!/^\d+$/.test(zendeskTicketIdValue)) {
      setErrorFor(zendeskTicketId, 'Zendesk Ticket ID must be a number');
      isValid = false;
    } else if (zendeskTicketIdValue.length < 7) {
      setErrorFor(zendeskTicketId, 'Zendesk Ticket ID must be 7 characters or more');
      isValid = false;
    } else {
      setSuccessFor(zendeskTicketId);
    }

    if (subject) {
      if (!subjectValue) {
        setErrorFor(subject, 'Subject cannot be blank');
        isValid = false;
      } else {
        setSuccessFor(subject);
      }
    }

    if (priorityLevel) {
      if (!priorityLevelValue || priorityLevelValue === "Select Priority Level") {
        setErrorFor(priorityLevel, 'Priority Level needs to be selected');
        isValid = false;
      } else {
        setSuccessFor(priorityLevel);
      }
    }

    if (serviceId) {
      if (serviceIdValue.length >= 1) {
        if (isNaN(parseInt(serviceIdValue))) {
          setErrorFor(serviceId, 'Service ID must be a number');
          isValid = false;
        } else {
          setSuccessFor(serviceId);
        }
      }
    }

    if (templateVars.includes("ipAddress")) {
      if (!ipAddressValue) {
        setErrorFor(ipAddress, 'IP Address cannot be blank for this issue');
        isValid = false;
      } else {
        const ipAddressArray = ipAddressValue.split('\n').map(ip => ip.trim());
        const invalidIPs = ipAddressArray.filter(ip => !isValidIPAddress(ip));
        if (invalidIPs.length > 0) {
          setErrorFor(ipAddress, `Invalid IP address(es) found: ${invalidIPs.join(', ')}`);
          isValid = false;
        } else {
          setSuccessFor(ipAddress);
        }
      }
    }

    if (templateVars.includes("osVersion")) {
      if (!osVersionValue) {
        setErrorFor(osVersion, 'OS Version needs to be selected');
        isValid = false;
      } else {
        setSuccessFor(osVersion);
      }
    }

    

    if (templateVars.includes("logs")) {
      if (!logsValue) {
        setErrorFor(logs, 'Logs cannot be blank for this issue');
        isValid = false;
      } else {
        setSuccessFor(logs);
      }
    }

    if (!messageValue) {
      setErrorFor(message, 'Message cannot be blank');
      isValid = false;
    } else {
      setSuccessFor(message);
    }

    return isValid;
  }

  function isValidIPAddress(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
    return ipPattern.test(ip);
  }

  function getTemplateVars(template) {
    const vars = [];
    const regex = /\{(\w+)\}/g;
    let match;
    while ((match = regex.exec(template)) !== null) {
        vars.push(match[1]);
    }
    return vars;
  };

  function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    small.innerText = message;
    formControl.className = 'form-control error';
  }

  function setSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
  }

  function resetAlert(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control';
  }

  // Initially add event listener and validation to the form if present
  addFormEventListenerAndValidation();
});
