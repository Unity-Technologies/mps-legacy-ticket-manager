import { notifyZendeskFailure } from './zendeskData.js';
import { messageTemplates, getTemplateVars, replaceTemplateVars } from './template.js';
import { validateFileCount, validateForm, setSuccessFor, setErrorFor, resetAlert, isValidIPAddress } from './validation.js';

export function initClient() {
  const client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '380px' });
  return client;
}

export function handleDataCenterChange(client) {
    console.log("handling data center change...");
    const issueCategorySelect = document.querySelector("#issue-category");
    const dataCenterSelect = document.querySelector("#data-center");
    const ipAddressTextarea = document.querySelector("#ip-address");
    const osVersionSelect = document.querySelector("#os-version");
    const logsTextarea = document.querySelector("#logs");
    const zendeskTicketIdInput = document.querySelector("#zendesk-ticket-id");

    const dataCentersWithoutAPI = ['zenlayer', 'hivelocity', 'rapidswitch', 'serversdotcom', 'gcore', 'maxihost', 'vultr', 'leaseweb', 'enzu'];

    const selectedDataCenter = dataCenterSelect.value;
    
    document.querySelector("#data-center-name").value = dataCenterSelect.options[dataCenterSelect.selectedIndex].innerText;

    if (selectedDataCenter) {
      client.invoke('resize', { width: '100%', height: '950px' });

      const url = dataCentersWithoutAPI.includes(selectedDataCenter) 
        ? `/tickets/partials/email` 
        : `/tickets/partials/${selectedDataCenter}`;
        
      fetch(url)
        .then(response => response.text())
        .then(html => {
          document.getElementById("dataCenterForm").innerHTML = html;
          document.getElementById("form-title").innerText = `New ${dataCenterSelect.options[dataCenterSelect.selectedIndex].innerText} Support Ticket`;

          addFormEventListeners();

          const bodyTextarea = document.querySelector("#body");
        
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

          const showOrHideElements = (issueCategory) => {
            // Hide all optional input containers by default
            const ipAddressContainer = document.querySelector("#ip-address-container");
            const osVersionContainer = document.querySelector("#os-version-container");
            const logsContainer = document.querySelector("#logs-container");

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
          notifyZendeskFailure(client, `Error fetching partial: ${error}`);
        });
    } else {
      document.getElementById("dataCenterForm").innerHTML = "";
    }
}

export function addFormEventListeners() {
  const ipAddressTextarea = document.querySelector("#ip-address");
  const osVersionSelect = document.querySelector("#os-version");
  const logsTextarea = document.querySelector("#logs");
  const zendeskTicketIdInput = document.querySelector("#zendesk-ticket-id");
  const bodyTextarea = document.querySelector("#body");
  const form = document.querySelector("#form");
  
  if (form) {
    form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (validateForm()) {
        form.submit();          
    }
    });
  }

  zendeskTicketIdInput.addEventListener('input', function () {
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

  ipAddressTextarea.addEventListener('input', function () {
    const templateVars = document.querySelector('#issue-category').value ? getTemplateVars(messageTemplates[document.querySelector('#issue-category').value]) : [];
    if (templateVars.includes('ipAddress')) {
      if (!this.value) {
        setErrorFor(this, 'IP Address cannot be blank for this issue');
      } else {
        const ipAddressArray = this.value.split('\n').map(ip => ip.trim());
        const invalidIPs = ipAddressArray.filter(ip => !isValidIPAddress(ip));
        if (invalidIPs.length > 0) {
          setErrorFor(this, `Invalid IP address(es) found: ${invalidIPs.join(', ')}`);
        } else {
          setSuccessFor(this);
        }
      }
    }
  });

  osVersionSelect.addEventListener('change', function () {
    const templateVars = document.querySelector('#issue-category').value ? getTemplateVars(messageTemplates[document.querySelector('#issue-category').value]) : [];
    if (templateVars.includes('osVersion')) {
      if ((!this.value || this.value === "Select OS Version")) {
        setErrorFor(this, 'OS Version needs to be selected');
      } else {
        setSuccessFor(this);
      }
    }
  });

  logsTextarea.addEventListener('input', function () {
    const templateVars = document.querySelector('#issue-category').value ? getTemplateVars(messageTemplates[document.querySelector('#issue-category').value]) : [];
    if (templateVars.includes("logs")) {
      if (!this.value) {
        setErrorFor(this, 'Logs cannot be blank for this issue');
      } else {
        setSuccessFor(this);
      }
    }
  });

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

  if(bodyTextarea) {
    document.querySelector('#body').addEventListener('input', function () {
        if (!this.value) {
            setErrorFor(this, 'Message cannot be blank');
        } else {
            setSuccessFor(this);
        }
    })
  }

  if (document.getElementById('file-button')) {
    addFileButtonListener();
  }
}

function displayFileNames(files, fileList, fileInput) {
    let allFiles = [];

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