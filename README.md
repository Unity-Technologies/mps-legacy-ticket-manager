# DC-Ticket-Manager-App
## Data Center Ticket Management App

The Data Center Ticket Management App is designed to streamline the process of raising support tickets with Data Centers for the Developer Support Engineering Team. The app provides the capability to raise tickets either via email or Data Center API, with built-in message templates for common machine issues. By enabling efficient input of essential details, such as logs and OS versions, the app aims to expedite the ticket-raising process, enhancing collaboration with Data Centers.

## Scope
The scope of the Data Center Ticket Management App includes:

Allowing Developer Support Engineers to log in securely using their team credentials.
Offering an intuitive interface to create new support tickets.
Providing predefined message templates for common machine issues.
Allowing customization of message templates.
Enabling attachment of relevant logs, screenshots, and other files to support tickets.
Facilitating communication with Data Centers via email or API.
Ensuring proper categorization and tagging of support tickets.
Supporting tracking and status updates of raised tickets.
Generating reports on ticket history and response times.

## Functional Requirements
### Zendesk Authentication
Zendesk authentication via secure login using user's Zendesk credentials.

### Ticket Creation
Ability to create new support tickets with the following information:
Subject
Data Center selection
Issue category
Priority level
Message template selection or customization
Attachment of relevant files

### Message Templates
Predefined message templates for common machine issues.
Customization of message templates by users.

### Communication
Integration with Data Center APIs for seamless ticket creation and updates.

### Attachment Management
Attachment of logs, screenshots, and files to support tickets where applicable.
Automatic file type validation.

## Non-Functional Requirements
### Performance
App should handle concurrent user requests efficiently.
Response time for ticket creation and updates should be within 3 seconds.

### Security
User data and ticket information must be encrypted and securely stored.
Secure API communication with Data Centers using authentication tokens.

### Usability
Intuitive user interface with clear navigation and form fields.
Responsive design for optimal usage on desktop.

### Reliability
App should be available 24/7 with minimal downtime for maintenance.
