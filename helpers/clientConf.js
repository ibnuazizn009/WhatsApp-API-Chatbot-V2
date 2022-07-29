const { Client } = require('whatsapp-web.js');
const fs = require('fs');

// Session For Whatsapp Web API
const sessions = []
const SESSION_FILE_PATH = './whatsapp-session-chatbot.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require('../whatsapp-session-chatbot.json');
}
// const createSessionsFileIfNotExists = function() {
//     if (!fs.existsSync(SESSION_FILE_PATH)) {
//       try {
//         fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify([]));
//         console.log('Sessions file created successfully.');
//       } catch(err) {
//         console.log('Failed to create sessions file: ', err);
//       }
//     }
//   }
  
//   createSessionsFileIfNotExists();
  
// const setSessionsFile = function(sessions) {
//     fs.writeFile(SESSION_FILE_PATH, JSON.stringify(sessions), function(err) {
//       if (err) {
//         console.log(err);
//       }
//     });
// }
// const getSessionsFile = function() {
//         return JSON.parse(fs.readFileSync(SESSION_FILE_PATH));
// }



// Configuration WhatsApp Web API
const client = new Client({
    restartOnAuthFail: true, 
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],
    }, session: sessionCfg });



module.exports = {client, SESSION_FILE_PATH, sessionCfg, sessions}