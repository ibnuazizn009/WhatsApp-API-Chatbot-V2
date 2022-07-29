const app = require('express')();

var express = require('express');
var path = require('path');
const { Client, MessageMedia, WAState } = require('whatsapp-web.js');
var http = require('http').Server(app);
const io = require('socket.io')(http, {cors: {origin: "*"}});
const qrcode = require('qrcode');
const fs = require('fs');
var validator = require('express-validator');
require('dotenv').config();

// client configuration
const configClient = require('./helpers/clientConf');

// import controller
var AuthController = require('./controllers/AuthController');

// import Router file
var pageRouter = require('./routers/route');


// Connection MOngoDB
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var mongoString = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.3yt2b.gcp.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`


mongoose.connect(mongoString, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
})

mongoose.connection.on("error", function(error) {
  console.log(error)
});

mongoose.connection.on("open", function() {
  console.log("Connected to MongoDB database.")
}); // <--End Connection MongodB

var session = require('express-session');
const flash = require('connect-flash');
var i18n = require("i18n-express");

app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 1200000
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ resave: false, saveUninitialized: true, secret: 'nodedemo' }));
app.use(flash());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));
app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
  siteLangs: ["es", "en", "de", "ru", "it", "fr"],
  textsVarName: 'translation'
}));




app.use('/public', express.static('public'));

app.get('/layouts/', function (req, res) {
  res.render('view');
});


// whtsappConfig.clienConfig()

// Session For Whatsapp Web API
// const SESSION_FILE_PATH = './whatsapp-session-chatbot.json';
// let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//     sessionCfg = require(SESSION_FILE_PATH);
// }

// apply controller
AuthController(app);

//For set layouts of html view
var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Define All Route 
pageRouter(app);

app.get('/', function (req, res) {
  res.redirect('/');
});

// Configuration WhatsApp Web API
// const client = new Client({
//   restartOnAuthFail: true, 
//   puppeteer: { 
//       headless: true,
//       args: [
//           '--no-sandbox',
//           '--disable-setuid-sandbox',
//           '--disable-dev-shm-usage',
//           '--disable-accelerated-2d-canvas',
//           '--no-first-run',
//           '--no-zygote',
//           '--single-process', // <- this one doesn't works in Windows
//           '--disable-gpu'
//       ],
//   }, session: sessionCfg });


// configClient.client.on('authenticated', (session) => {
//   console.log('AUTHENTICATED', session);
//   configClient.sessionCfg=session;
//   fs.writeFile(configClient.SESSION_FILE_PATH, JSON.stringify(session), function (err) {
//       if (err) {
//           console.error(err);
//       }
//   });
// });

// from message keyword
const replymessage = require('./models/messagereply')
const msgkey = async (keyword) => {
  const messagekey = await replymessage.find({'keyword':keyword})
  return {messagekey}
}
// end message keyword


// Initialization Reply For WhatsApp Web
// reply Chat
const chatreply = require('./helpers/replyChat')

configClient.client.on('message', async msg => {
  const keyword = msg.body;
  const msgreply = await chatreply.replymsg(keyword)
  const keymessage = await msgkey(keyword)
  if(msgreply !== false){
    // check if database length exist
    if(keymessage.messagekey.length > 0){
      // check if property array not include replyimage
      if(!keymessage.messagekey[0].replyimage){
        configClient.client.sendMessage(msg.from, msgreply)
      }else if(keymessage.messagekey[0].replyimage){ // <--check if property array include replyimage
        // Send Message Media and check if media true or false
        configClient.client.sendMessage(msg.from, msgreply.value[0] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[1] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[2] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[3] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[4] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[5] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[6] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[7] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[8] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[9] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[10] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[11] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[12] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[13] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[14] || false)
        configClient.client.sendMessage(msg.from, msgreply.value[15] || false)
      }
    }else{
      // throw this message if keyword not in the database
      configClient.client.sendMessage(msg.from, `No product found for this ${keyword}`)
    }
  }
});

configClient.client.initialize();

// Socket IO Configuration
io.on('connection', (socket)=>{
  socket.emit('message', 'Connecting...');

  socket.on('create-session', function(data){
    console.log('create-session')
    console.log(data)
  })

  configClient.client.on('qr', (qr) => {
      // Generate and scan this code with your phone
      console.log('QR RECEIVED', qr);
      qrcode.toDataURL(qr, (err, url)=>{
          socket.emit('qr', url);
          socket.emit('message', 'QR Code recived scan now!')
      });
  });
  configClient.client.on('ready', () => {
      socket.emit('ready', 'WhatsApp QR Ready')
      socket.emit('message', 'WhatsApp QR Ready')
  });

  configClient.client.on('authenticated', (session) => {
      socket.emit('authenticated', 'WhatsApp QR authenticated')
      socket.emit('message', 'WhatsApp QR authenticated')
      console.log('AUTHENTICATED', session);
      configClient.sessionCfg=session;
      fs.writeFile(configClient.SESSION_FILE_PATH, JSON.stringify(session), function (err) {
          if (err) {
              console.error(err);
          }
      });
  });

  configClient.client.on('auth_failure', function(session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  configClient.client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is disconnected!', reason);
    console.log('Whatsapp is disconnected!', reason)
    if(fs.existsSync(configClient.SESSION_FILE_PATH)){
      fs.unlink(configClient.SESSION_FILE_PATH, function(err) {
          if(err) return console.log(err);
          console.log('Session file deleted!');
      });
    }
    configClient.client.destroy();
    configClient.client.initialize(); 

    socket.emit('remove-session', reason)
    });
});



http.listen(process.env.PORT, function () {
  console.log(`listening on *:${process.env.PORT}`);
});