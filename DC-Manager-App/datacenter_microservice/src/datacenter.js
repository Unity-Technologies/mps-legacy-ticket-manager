require("dotenv").config({path:"../../.env"})
const axios = require('axios');
const fs = require('fs');

const apiKey = process.env.HUNDREDTB_API_KEY;

const allowedFileTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/gif",
    "text/csv",
    "text/plain",
    "video/3gpp",
    "video/3gpp2",
    "video/h261",
    "video/h263",
    "video/h264",
    "video/jpeg",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/quicktime",
    "video/webm",
    "application/pdf",
    "application/x-pdf",
    "application/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

function isValidFileType(attachment) {
    return allowedFileTypes.includes(attachment.mime);
}
  
async function createTicket(subject, body, department = 10, priority = 1, attachments = []) {
    
    if (attachments.length > 2) {
        throw new Error('Maximum 2 attachments allowed per ticket.');
    }

    const requestBody = {
        subject: subject,
        body: body,
        department: department,
        priority: priority,
        attachments: attachments.map(attachment => {
            if (!isValidFileType(attachment)) {
                throw new Error(`Invalid attachment file type: ${attachment.mime}. Allowed types are: ${allowedFileTypes.join(', ')}`);
            }
            return {
                mime: attachment.mime,
                name: attachment.name,
                file: fs.readFileSync(attachment.path, 'base64'),
            };
        }),
    };

    console.log(requestBody);

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
    }   else if (response.status === 401) {
        console.error('401 Unauthenticated Error, Response Message:', response.data.message)
    }   else if (response.status === 413) {
        console.error('413 Request Entity Too Large, Response Message:', response.data.message)
        throw new Error('Attachment size exceeds the allowed limit. Please reduce the file size and try again.');
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
// const response2 = createTicket('', 'This is a test ticket body.');
// console.log(response2);  // This might log an error message or throw an exception

// // Test Case 3: Long Subject and Body
// const response3 = createTicket('This is a very long subject...', 'This is a very long ticket body...',);  // Include full text for subject and body
// console.log(response3);  // This should be similar to your mockApiResponse (assuming function handles long text)

const mockAttachment1 = {
    mime: 'image/png',
    name: 'test_image.png',
    path: 'C:\\Users\\juliantitusglover\\repos\\DC-Ticket-Manager-App\\DC-Manager-App\\assets\\logo.png',
}; // Your mock attachment object

const mockAttachment2 = {
    mime: 'application/pdf',
    name: 'test_file.pdf',
    path: 'C:\\Users\\juliantitusglover\\Downloads\\Mastering GUI Programming with Python_ Develop impressive -- Alan D. Moore -- 2019 -- Packt Publishing -- 9781789612905 -- da31eb8d5c1afcdaafebffdd245898b9 -- Anna’s Archive.pdf',
};

// const response = createTicket('Test Ticket', 'Test ticket with Attachment', 10, 1, [mockAttachment1]);
// console.log(response);  // Should be similar to mockApiResponse

const response = createTicket('Test Ticket with Large Attachment', 'Body with Attachment', undefined, undefined, [mockAttachment2]);

console.log(response);  // Observe the output for successful or error messages