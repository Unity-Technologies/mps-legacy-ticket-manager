const multer = require("multer");

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create middleware for handling file uploads
const uploadAttachments = upload.array("attachments", 5);

module.exports = uploadAttachments;
