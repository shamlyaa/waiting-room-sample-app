require('dotenv').config();
const express = require('express');
const OpenTok = require('opentok');
const path = require('path');
const app = express();

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const sessions = {};
const port = process.env.PORT || 3000;

if (!apiKey || !apiSecret) {
  throw new Error('Missing API_KEY or API_SECRET');
}

const opentok = new OpenTok(apiKey, apiSecret);

app.use(express.static(__dirname + '/public'));

const participantPath = path.join(__dirname, './public/participant.html');
app.use('/participant', express.static(participantPath));

const hostPath = path.join(__dirname, './public/host.html');
app.use('/host', express.static(hostPath));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/favicon.ico', (req, res) => res.status(204));

const sendSessionInfo = (res, session, role) => {
  console.log('gen token for ' + role);
  const token = session.generateToken(session.sessionId, {
    data: `${role}`,
    role: role === 'admin' ? 'moderator' : 'publisher'
  });
  res.json({
    apiKey,
    sessionId: session.sessionId,
    token
  });
};

app.get('/api/room/:roomName', (req, res) => {
  const { role } = req.query;
  console.log(role);
  const roomName = req.params.roomName;
  if (sessions[roomName]) {
    return sendSessionInfo(res, sessions[roomName], role);
  } else {
    opentok.createSession({ mediaMode: 'routed' }, (err, session) => {
      if (err) {
        res.status(500);
        res.render('error', { error: err });
      } else {
        sessions[roomName] = session;
        return sendSessionInfo(res, session, role);
      }
    });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
