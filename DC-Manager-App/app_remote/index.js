const express = require('express');

const app = express();

// Define a port number for the server
const port = process.env.PORT || 3000;

// Basic route handler to display a welcome message
app.get('/sidebar', (req, res) => {
  res.send('Hello from your Zendesk application!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});