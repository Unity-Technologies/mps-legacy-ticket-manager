require("dotenv").config({path:"../../.env"})
const axios = require('axios');

const apiKey = process.env.HUNDREDTB_API_KEY;

async function createTicket(subject, body, department = 10, priority = 1, attachments = []) {
    
    const requestBody = {
        subject: subject,
        body: body,
        department: department,
        priority: priority,
        attachments: attachments.map(attachment => ({
          mime: attachment.mime,
          name: attachment.name,
          file: attachment.file,
        })),
    };

    // Make the Axios POST request to create a new ticket
    const response = await axios.post('https://api.ingenuitycloudservices.com/rest-api/tickets', 
    requestBody, 
    {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Api-Token': `${apiKey}`
        },
    });

    console.log(response.status);
    console.log(response.data);

    if (response.status === 200 || response.status === 201) {
        // Ticket creation successful
        return response.data; // Return the response data (might contain ticket details)
    }
    else if (response.status === 401) {
        console.error('401 Unauthenticated Error, Response Message:', response.data.message)
    }   else {
        // Handle error - log the error message and potentially throw an exception
        console.error(`${response.status} Error creating ticket:`, response.data.message);
        throw new Error('Failed to create ticket');
    }
  }

// Test Case 1: Valid Ticket Creation
// const response1 = createTicket('Test Ticket', 'This is a test ticket body.');
// console.log(response1);  // This should be similar to your mockApiResponse

// Test Case 2: Empty Subject (expected error)
const response2 = createTicket('', 'This is a test ticket body.');
console.log(response2);  // This might log an error message or throw an exception

// // Test Case 3: Long Subject and Body
// const response3 = createTicket('This is a very long subject...', 'This is a very long ticket body...',);  // Include full text for subject and body
// console.log(response3);  // This should be similar to your mockApiResponse (assuming function handles long text)